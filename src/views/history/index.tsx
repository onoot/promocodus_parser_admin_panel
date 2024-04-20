// Next, React
import React, {FC, useEffect, useState} from 'react';
import Head from "next/head";
import TableComponent from "../../components/dynTable/ParserTable";
import {showToast} from "../../components/Notification/ToastContainer";


export const HistoryView: FC = ({}) => {
    const [data, setData] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);

    const [sortedBy, setSortedBy] = useState([]);

    const handleSortChange = (newSortedBy) => {
        setSortedBy(newSortedBy); // Обновляем состояние сортировки
    };

    const columns = React.useMemo(
        () => [
            {
                Header: (
                    <>
                        <input
                            className="me-1"
                            type="checkbox"
                            checked={selectedCount === data.length}
                            onChange={() => handleSelectAllCheckbox()}
                        />
                        Выбрать
                    </>
                ),
                accessor: 'select',
                Cell: ({row}) => (
                    <div className="d-flex justify-content-center align-content-center">
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(row.original.id)}
                            onChange={() => handleCheckboxChange(row.original.id)}
                        />
                    </div>

                ),
            },
            {
                Header: 'ID',
                accessor: 'id',
            },
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Тип',
                accessor: 'type',
                Cell: ({value}) => {
                    let buttonStyle = {};
                    let buttonText = '';

                    switch (value) {
                        case 'delete':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Удаление';
                            break;
                        case 'update_template':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Обновление шаблона';
                            break;
                        case 'create_template':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Создание шаблона';
                            break;
                        case 'run_template':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Запущено выполенные по шаблону';
                            break;
                        case 'no_delete':
                            buttonStyle = {backgroundColor: 'orange'};
                            buttonText = 'Не удалось найти шаблон';
                            break;
                        case 'error_delete':
                            buttonStyle = {backgroundColor: 'red'};
                            buttonText = 'Ошибка сервера при удалении шаблона';
                            break;
                        case 'no_create_template':
                            buttonStyle = {backgroundColor: 'orange'};
                            buttonText = 'Провал при создании шаблона';
                            break;
                        case 'error_create_template':
                            buttonStyle = {backgroundColor: 'red'};
                            buttonText = 'Ошибка сервера при создании шаблона';
                            break;
                        case 'parsing_all_shop':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Запущен';
                            break;
                        case 'error_parsing_all_shop':
                            buttonStyle = {backgroundColor: 'red'};
                            buttonText = 'Ошибка сервера';
                            break;
                        case 'error_run_template':
                            buttonStyle = {backgroundColor: 'red'};
                            buttonText = 'Ошибка сервера';
                            break;
                        case 'error_set_template':
                            buttonStyle = {backgroundColor: 'red'};
                            buttonText = 'Ошибка клиента';
                            break;
                        case 'parsing_select_shop':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Запущено';
                            break;
                        case 'ok_parsing_select_shop':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Выполнено';
                            break;
                        case 'error_parsing_select_shop':
                            buttonStyle = {backgroundColor: 'red'};
                            buttonText = 'Ошибка сервера';
                            break;
                        case 'get_all_shop':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Успех';
                            break;
                        case 'error_get_all_shop':
                            buttonStyle = {backgroundColor: 'red'};
                            buttonText = 'Ошибка сервера';
                            break;
                        case 'set_template':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Измане шаблона';
                            break;
                        case 'no_task_delete':
                            buttonStyle = {backgroundColor: 'orange'};
                            buttonText = 'Провал при удалении задачи';
                            break;
                        case 'error_task_delete':
                            buttonStyle = {backgroundColor: 'red'};
                            buttonText = 'Ошибка сервера при удалении задачи';
                            break;
                        case 'task_delete':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Задача удалена';
                            break;
                        case 'error_set_exut':
                            buttonStyle = {backgroundColor: 'red'};
                            buttonText = 'Ошибка сервера. Работа с исключениями';
                            break;
                        case 'not_set_exut':
                            buttonStyle = {backgroundColor: 'orange'};
                            buttonText = 'Ошибка клиента';
                            break;
                        case 'set_exut':
                            buttonStyle = {backgroundColor: 'green'};
                            buttonText = 'Добавлено в исключение';
                            break;
                        default:
                            buttonStyle = {backgroundColor: 'gray'};
                            buttonText = 'Неизвестный тип';
                    }

                    return (
                        <button style={buttonStyle}>{buttonText}</button>
                    );
                },
            },
            {
                Header: 'URLs',
                accessor: 'urls',
            },
            {
                Header: 'LastRun',
                accessor: 'lastRun',
            },
        ],
        [selectedCount, selectedItems, data]
    );

    const handleCheckboxChange = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };
    const handleSelectAllCheckbox = () => {
        if (selectedCount === data.length) {
            // Если все уже выбраны, сбросить выбор для всех
            setSelectedItems([]);
            setSelectedCount(0);
        } else {
            // В противном случае выбрать все
            const allIds = data.map(item => item.id);
            setSelectedItems(allIds);
            setSelectedCount(allIds.length);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/controller/history/get'); // Замените 'yourEndpoint' на ваш реальный эндпоинт
                const result = await res.json();

                if (result.res && result.data) {
                    setData(result.data);
                } else {
                    showToast('Данные не получены', {type: 'warning'});
                    console.error('Failed to fetch data');
                }
            } catch (error) {
                showToast('Ошибка. Обновите страницу', {type: 'error'});
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            {/* eslint-disable-next-line react/jsx-no-undef */}
            <section className="col-lg-6 mt-3">
                <Head>
                    <title>Promocodus Parser - История</title>
                </Head>
                <header className="text-black ms-5 mt-4">
                    <h4>История</h4>
                </header>
                <article className="ms-5 mt-5">
                    <TableComponent
                        columns={columns}
                        data={data}
                        onSortChange={handleSortChange}
                    />
                </article>

            </section>

        </>
    );
}