// Next, React
import React, {FC, useEffect, useState} from 'react';
import Head from "next/head";
import TableComponent from "../../components/dynTable/ParserTable";
import {format} from "date-fns";
import {showToast} from "../../components/Notification/ToastContainer";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {Dropdown} from "react-bootstrap";


export const GiftView: FC = ({}) => {
    const [data, setData] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);
    const allcount = data.length

    const [matches, setMatches] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDate, setShowDate] = useState(true);
    const [inputText, setInputText] = useState('');

    const preDate = showDate ? data : matches;


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
                Header: 'Coupon id',
                accessor: 'coupon_id',
            },
            {
                Header: 'Магазин',
                accessor: 'store_name',
            },
            {
                Header: 'Описание',
                accessor: 'description',
                Cell: ({cell: {value}}) => <DescriptionCell value={value}/>,

            },
            {
                Header: 'Имя',
                accessor: 'name',
            },
            {
                Header: 'Ссылка из купона',
                accessor: 'coupon_link',
            },
            {
                Header: 'Тип акции',
                accessor: 'species',
            },
            {
                Header: 'Промокод',
                accessor: 'promocode',
            },
            {
                Header: 'Ссылка на Магазин',
                accessor: 'store_url',
            },
            {
                Header: 'Дата окончания',
                accessor: 'date_end',
                Cell: ({value}) => {
                    return<span className="d-flex justify-content-center" style={{fontWeight:500}}>
                        {value}
                    </span>;
                },
            },
            {
                Header: 'Новый',
                accessor: 'new',
                Cell: ({value}) =>
                    <button type="button" className={`btn ${value ? 'btn-success' : 'btn-secondary'}`}>
                        {value ? 'Новый' : 'Старый'}
                    </button>
            },
            {
                Header: 'Удален',
                accessor: 'deleted',
                Cell: ({value}) =>
                    <button type="button" className={`btn ${value ? 'btn-danger' : 'btn-primary'}`}>
                        {value ? 'Удален' : 'Не удален'}
                    </button>
            },
            {
                Header: 'Статус код',
                accessor: 'status_code',
            },
            {
                Header: 'Дата Парсинга',
                accessor: 'createdAt',
                Cell: ({value}) => format(new Date(value), 'yyyy-MM-dd HH:mm:ss'),

            },
            {
                Header: 'Обновление',
                accessor: 'updatedAt',
                Cell: ({value}) => format(new Date(value), 'yyyy-MM-dd HH:mm:ss'),

            }
        ],
        [selectedCount, selectedItems, preDate]
    );

    const handleCheckboxChange = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));

        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };
    const handleSelectAllCheckbox = () => {
        if (selectedCount === preDate.length) {
            setSelectedItems([]);
            setSelectedCount(0);
        } else {
            const allIds = preDate.map(item => item.id);
            setSelectedItems(allIds);
            setSelectedCount(allIds.length);
        }
    };

    const DescriptionCell: React.FC<{ value: string }> = ({ value }) => {
        const [showModal, setShowModal] = useState(false);
        const isString = typeof value === 'string';

        // Удаление "Подробнее" с конца строки если оно там есть.
        const valueWithoutMore = isString ? value.replace(/ Подробнее$/, '') : value;

        const truncated =
            isString && valueWithoutMore.length > 40
                ? `${valueWithoutMore.substring(0, 40)}...`
                : valueWithoutMore;

        return (
            <>
                {truncated}
                <Button onClick={() => setShowModal(true)} variant="primary" size="sm">
                    ...
                </Button>

                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Полное описание</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{valueWithoutMore}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Закрыть
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                    const res = await fetch('/api/controller/promocode/get'); // Замените 'yourEndpoint' на ваш реальный эндпоинт
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

    async function clear() {
        try {
            for (const promocode of data) {
                const requestData = {
                    date: [{name: promocode.name.toString()}],
                };

                const response = await fetch('/api/controller/promocode/clear', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (response.ok) {
                    const res = await response.json();
                    if (res.data === 'ok') {
                        console.log('POST request successful for task:', promocode.id);
                        showToast('Очищено', {type: 'success'})
                    } else if (res.data === 'no') {
                        console.log('POST request successful');
                        showToast('Не выполнено', {type: 'warning'});
                    } else {
                        console.error('POST request failed');
                        showToast(`Сервер вернул ошибку для задачи ${promocode.id}`, {type: 'warning'});
                    }
                } else {
                    console.error(`POST request failed for task ${promocode.id}`);
                    showToast(`Сервер вернул ошибку для задачи ${promocode.id}`, {type: 'warning'});
                }
            }
        } catch (e) {
            showToast('Ошибка', {type: 'error'})
        }
    }


    async function upLoad(par: number, rout?: number){
        try{
            if(par==1) {
                const api = '/api/controller/upload/promocode/all'

                const res = await fetch(api, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    throw new Error('Network response was not ok');
                    showToast('Ошибка при выгрузке', {type: 'error'});
                }

                // Извлечение имени файла из заголовков ответа
                const contentDisposition = res.headers.get('content-disposition');
                const fileNameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
                const fileName = fileNameMatch ? fileNameMatch[1] : 'downloaded-file.csv';

                showToast('Выгрузка началась...', {type: 'success'});

                // Создание ссылки для скачивания
                return res.blob().then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                });
            }else if(par==2) {
                showToast('Пожалуйста, подождите',  {type: 'success'})
                const api = '/api/controller/upload/select'

                const requestData = {
                    data: {
                        id: selectedItems,
                        rout:rout,
                    }
                };
                const res = await fetch(api, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (!res.ok) {
                    throw new Error('Network response was not ok');
                    showToast('Ошибка при выгрузке', {type: 'error'});
                }

                // Извлечение имени файла из заголовков ответа
                const contentDisposition = res.headers.get('content-disposition');
                const fileNameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
                const fileName = fileNameMatch ? fileNameMatch[1] : 'downloaded-file.csv';

                showToast('Выгрузка началась...', {type: 'success'});

                // Создание ссылки для скачивания
                return res.blob().then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                });
            }else if(par==3){

            }

        }catch (e) {
            console.log(e)
        }
    }

    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };
    const handleSearch = (res) => {
        if (res) {
            const searchTexts = inputText.split('\n').map(text => text.trim());
            const foundMatches = data.filter(item => {
                return searchTexts.some(searchText => {
                    const isUrl = searchText.startsWith('http://') || searchText.startsWith('https://');

                    if (item && (isUrl && item.store_url && item.store_url.includes(searchText)) || (!isUrl && item.store_name && item.store_name.includes(searchText))) {
                        return true;
                    }

                    return false;
                });
            });

            setMatches(foundMatches);
            setShowDate(false);
        } else {
            setShowDate(true);
            setMatches([]);
        }
        setShowModal(false);
    };


    return (
        <>
            {/* eslint-disable-next-line react/jsx-no-undef */}
            <section className="col-lg-12 mt-3">
                <Head>
                    <title>Promocodus Parser - Купоны</title>
                </Head>
                <header className="text-black ms-5 mt-4">
                    <h4>Купоны</h4>
                </header>
                <section className="d-flex ms-5 mt-4">
                    <article>
                        <p>В таблице:
                        <button className="btn">
                            {allcount}
                        </button></p>
                        <p>Выбрано: {selectedItems.length > 0 && (
                            <button className="btn">
                                {selectedItems.length}
                            </button>
                        )||0}</p>
                    </article>
                    <article className="d-flex flex-column">
                        <button className="btn btn-primary ms-5" onClick={() => setShowModal(true)}>
                            Поиск в таблице
                        </button>
                        <button className="btn btn-success mt-3 ms-5" onClick={() => upLoad(1)}>
                            Скачать все
                        </button>
                        {matches.length > 0 && (
                            <button className="btn btn-danger" onClick={() => handleSearch(false)}>
                                <i className="bi bi-backspace"></i>
                            </button>
                        )}

                        {matches.length > 0 && (
                            <button className="btn ms-5">
                                Найдено: {matches.length}
                            </button>
                        )}
                    </article>
                    <article className="d-flex flex-column">
                        <Dropdown>
                            <Dropdown.Toggle variant={`btn ${selectedItems.length > 0 ? 'btn-success' : 'btn-secondary'} ms-5`} id="dropdown-basic">
                                Скачать выбранное
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() => upLoad(2, 1)}
                                    className="dropdown-item-custom"
                                >
                                    Купоны
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => upLoad(2, 2)}
                                    className="dropdown-item-custom"
                                >
                                    Магазины
                                </Dropdown.Item>
                            </Dropdown.Menu>

                        </Dropdown>
                    </article>


                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Введите строки для поиска</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <textarea
                                className="form-control"
                                value={inputText}
                                onChange={handleInputChange}
                                placeholder="Введите каждую строку на новой строке."
                            />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Закрыть
                            </Button>
                            <Button variant="primary" onClick={() => handleSearch(true)}>
                                Выполнить поиск
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    {/*<button className="btn btn-danger" onClick={()=>{clear()}}>*/}
                    {/*    Очистить*/}
                    {/*</button>*/}
                </section>
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