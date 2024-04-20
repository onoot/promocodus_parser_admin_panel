// Next, React
import React, {FC, useEffect, useState} from 'react';
import Head from "next/head";
import TableComponent from "../../components/dynTable/ParserTable";
import { format } from 'date-fns';
import {showToast} from "../../components/Notification/ToastContainer";

export const TasksView: FC = ({ }) => {
    const [data, setData] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);

    const [shop, setShop] = useState([]);
    const [itemsShop, setSelectedShop] = useState([]);
    const [selectedShop, setItemsShop] = useState(0);

    const [deleteCount, setDeleteCount] = useState(0);
    const [lastDeleteId, setLastDeleteId] = useState<number | null>(null);

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
                            className="me-1 click"
                            type="checkbox"
                            checked={selectedCount === data.length}
                            onChange={() => handleSelectAllCheckbox()}
                        />
                        Выбрать
                    </>
                ),
                disableSortBy: true,
                accessor: 'select',
                Cell: ({ row }) => (
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
                Header: 'Шаблон',
                accessor: 'name',
            },
            {
                Header: 'Запущен',
                accessor: 'lastRun',
                Cell: ({ value }) => format(new Date(value), 'yyyy-MM-dd HH:mm:ss'),
            },
            {
                Header: 'Run',
                accessor: 'run',
                disableSortBy: true,
                Cell: ({ row }) => (
                    <button
                        className={`click btn ${row.original.run ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleButtonClick(row.original.id, row.original.run)}
                    >
                        {row.original.run ? 'Остановить' : 'Запустить'}
                    </button>
                ),
            },
            {
                Header: 'Прогресс',
                accessor: 'completed',
                Cell: ({ value }) => <ProgressBar value={value} />
            },
            {
                Header: 'Удалить',
                accessor: 'delete',
                Cell: ({ row }) => (
                    <button
                        className={`click btn btn-danger`}
                        onClick={() => handleButtonDelete(row.original.id)}
                    >
                        Удалить
                    </button>
                )
            }
        ],
        [selectedCount, selectedItems, data]
    );

    const shopColums = React.useMemo(
        () => [
            {
                Header: (
                    <>
                        <input
                            className="me-1 click"
                            type="checkbox"
                            checked={selectedCount === data.length}
                            onChange={() => handleSelectAllCheckbox()}
                        />
                        Выбрать
                    </>
                ),
                disableSortBy: true,
                accessor: 'select',
                Cell: ({ row }) => (
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
                Header: 'Шаблон',
                accessor: 'template',
            },
            {
                Header: 'Запущен',
                accessor: 'lastRun',
                Cell: ({ value }) => format(new Date(value), 'yyyy-MM-dd HH:mm:ss'),
            },
            {
                Header: 'Run',
                accessor: 'run',
                Cell: ({ row }) => (
                    <button
                        className={`click btn ${row.original.run===true ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleButtonShop(!row.original.run, row.original.id)}
                    >
                        {row.original.run===true ? 'Остановить' : 'Запустить'}
                    </button>
                ),
            },
            {
                Header: 'Прогресс',
                accessor: 'completed',
                Cell: ({ value }) => <ProgressBar value={value} />
            }
        ],
        [selectedShop, itemsShop, shop]
    );

    const ProgressBar = ({ value }) => {
        // Значение прогресса должно быть от 0 до 100
        const progressValue = Math.round(value);

        return (
            <div className="progress" style={{ height: '20px' }}>
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${progressValue||0}%` }}
                        aria-valuenow={progressValue||0} // <-- Correct type number
                        aria-valuemin={0}            // <-- Correct type number
                        aria-valuemax={100}          // <-- Correct type number
                    >
                        {`${value||0}%`}
                    </div>
            </div>
        );
    };

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
    const handleButtonClick = async (id: number, value: boolean) => {
        try {
            const requestData = {
                date: [{ template: id.toString(), value: value }],
            };
            const response = await fetch('/api/controller/tasks/set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const res = await response.json();
                if (res.data === 'ok') {
                    console.log('POST request successful');
                    showToast('Запущено', { type: 'success' });
                    await update()
                } else if (res.data === 'no') {
                    console.log('POST request successful');
                    showToast('Остановлено', { type: 'success' })
                    await update()
                } else {
                    console.error('POST request failed');
                    showToast('Сервер вернул ошибку', { type: 'warning' });
                }
            } else {
                console.error('POST request failed');
                showToast('Сервер вернул ошибку', { type: 'warning' });
            }
        } catch (error) {
            showToast('Ошибка на странице. Попробуйте обновить страницу', { type: 'error' });
            console.error('Error during POST request:', error);
        }
    };
    const handleButtonShop = async (run: boolean, id: number) => {
        try {

            if(run)
                 await fetch('/api/controller/store');
            const requestData = {
                date: { run, id },
            };
            const response = await fetch('/api/controller/tasks/shop/set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {

                const res = await response.json();

                if (res.data === 'run') {
                    await fetch('/api/controller/store');
                    showToast('Запущено', { type: 'success' });
                    await update()
                } else if (res.data === 'stop') {
                    showToast('Остановлено', { type: 'success' })
                    await update()
                } else {
                    console.error('POST request failed');
                    showToast('Сервер вернул ошибку', { type: 'warning' });
                }
            } else {
                console.error('POST request failed');
                showToast('Сервер вернул ошибку', { type: 'warning' });
            }
        } catch (error) {
            showToast('Ошибка на странице. Попробуйте обновить страницу', { type: 'error' });
            console.error('Error during POST request:', error);
        }
    };


    const handleButtonDelete = async (id: number) => {
        try {
            if (window.confirm("Удалить задачу?")) {
                const requestData = [{
                    id: id.toString(),
                }];
                const response = await fetch('/api/controller/tasks/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });
                if (response.ok) {
                    console.log(`Запись с id ${id} удалена.`);
                    showToast('Успешно удалено', { type: 'success' });
                    await update()
                } else {
                    console.error('POST request failed');
                    showToast('Сервер вернул ошибку', { type: 'warning' });
                }
            }
        } catch (error) {
            console.error('Ошибка в handleButtonDelete:', error);
            showToast('Ошибка клиента. Обновите страницу', { type: 'error' });
        }
    };


    async function update() {
            try {
                // Запрос для получения данных магазина
                const reShop = await fetch('/api/controller/tasks/shop');
                const resultShop = await reShop.json();

                // Обработка результата данных магазина
                if (resultShop.res && resultShop.data) {
                    setShop(resultShop.data);
                } else {
                    console.error('Failed to fetch shop data');
                }

                // Запрос для получения данных шаблонов
                const res = await fetch('/api/controller/tasks/get');
                const result = await res.json();

                if (result.res && result.data) {
                    setData(result.data);
                } else {
                    console.error('Failed to fetch data');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Запрос для получения данных задач
                const res = await fetch('/api/controller/tasks/get');
                const result = await res.json();

                // Обработка результата задач
                if (result.res && result.data) {
                    setData(result.data);
                } else {
                    console.error('Failed to fetch tasks data');
                }

                // Запрос для получения данных магазина
                const reShop = await fetch('/api/controller/tasks/shop');
                const resultShop = await reShop.json();

                // Обработка результата данных магазина
                if (resultShop.res && resultShop.data) {
                    setShop(resultShop.data);
                } else {
                    console.error('Failed to fetch shop data');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);


    const handleRunAllButtonClick = async (value: boolean) => {
        try {
            for (const task of data) {
                const requestData = {
                    date: [{ template: task.id.toString(), value: value }],
                };

                const response = await fetch('/api/controller/tasks/set', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (response.ok) {
                    const res = await response.json();
                    if (res.data === 'ok') {
                        console.log('POST request successful for task:', task.id);
                        showToast(`Запущено для задачи ${task.id}`, { type: 'success' });
                        await update();
                    } else if (res.data === 'no') {
                        console.log('POST request successful');
                        showToast(`Остановлено для задачи ${task.id}`, { type: 'success' })
                        await update()
                    } else {
                        console.error('POST request failed');
                        showToast(`Сервер вернул ошибку для задачи ${task.id}`, { type: 'warning' });
                    }
                } else {
                    console.error(`POST request failed for task ${task.id}`);
                    showToast(`Сервер вернул ошибку для задачи ${task.id}`, { type: 'warning' });
                }
            }

            console.log('All requests completed');
            showToast('Все запросы завершены', { type: 'info' });
        } catch (error) {
            showToast('Ошибка на странице. Попробуйте обновить страницу', { type: 'error' });
            console.error('Error during POST request:', error);
        }
    };

    return (
        <>
            {/* eslint-disable-next-line react/jsx-no-undef */}
            <section className="col-lg-6 mt-3">
                <Head>
                    <title>Promocodus Parser - Задачи</title>
                </Head>
                <header className="text-black ms-5 mt-4">
                    <h4>Задачи</h4>
                </header>
                <div className="d-flex justify-content-start ms-5 mt-5">
                    <button className="btn btn-success" onClick={()=>{handleRunAllButtonClick(false)}}>Запустить все</button>
                    <button className="btn btn-danger ms-5" onClick={()=>{handleRunAllButtonClick(true)}}>Остановить все</button>
                </div>
                <article className="ms-5 mt-4">
                    <p>Промокоды</p>
                    <TableComponent
                        columns={columns}
                        data={data}
                        onSortChange={handleSortChange}
                    />

                    <p>Магазины</p>
                    <TableComponent
                        columns={shopColums}
                        data={shop}
                        onSortChange={handleSortChange}
                    />
                </article>
            </section>

        </>
    );
}