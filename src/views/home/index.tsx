// Next, React
import React, {FC, useEffect, useState} from 'react';
import TableComponent from "../../components/dynTable/ParserTable";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {format} from "date-fns";
import {showToast} from "../../components/Notification/ToastContainer";

export const HomeView: FC = () => {

    const [data, setData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [formData, setFormData] = useState({
        id: 0,
        name: '',
        lastRun: 0,
        newAmount: 0,
        changedAmount: 0,
        oldAmount: 0,
        interval: 0,
        urls: '',
        parseUrls: false,
    });

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
            // {
            //     Header: 'ID',
            //     accessor: 'id',
            // },
            {
                Header: 'Имя',
                accessor: 'name',
                disableSortBy: true,
                Cell: ({row}) => (
                    <>
                        <button className="btn btn-secondary click"
                                onClick={() => {
                                    handleSetButtonClick(row.original.id);
                                }}>
                            <strong>{row.original.name}</strong>
                            <i className="bi bi-gear-wide-connected ms-2"></i>
                        </button>
                    </>
                ),

            },
            {
                Header: 'Последний запуск',
                accessor: 'lastRun',
                Cell: ({ value }) => {
                    // Создаем объект даты из значений lastRun.
                    const date = new Date(value);

                    // Если дата соответствует начальной точке времени Unix, возвращаем "Никогда".
                    if (date.getTime() === 0) {
                        return "Никогда";
                    }

                    // Иначе форматируем дату.
                    return format(date, 'yyyy-MM-dd HH:mm:ss');
                },
            },
            {
                Header: 'Запуск',
                accessor: 'run',
                disableSortBy: true,
                Cell: ({row}) => (
                    <>
                        <button
                            className={`btn btn-primary ms-2 click ${isButtonClicked ? 'd-none' : ''}`}
                            onClick={() => {
                                handleRunButtonClick(row.original.id);
                            }}
                        >
                            RUN
                        </button>
                    </>
                ),
            },
            {
                Header: 'Инфо',
                accessor: 'newAmount',
                accessor1: 'changedAmount',
                accessor2: 'oldAmount',
            },
            {
                Header: 'Интервал(сутки)',
                accessor: 'interval',
            },
            {
                Header: 'Выгрузка',
                accessor: 'upload',
                disableSortBy: true,
                Cell: ({row}) => (
                    <>
                        <button className="btn btn-primary ms-1 click"
                                onClick={() => handleUpLoadButtonClick(row.original.id, 'shop')}>
                            <i className="bi bi-shop"></i>
                        </button>
                        <button className="btn btn-primary ms-2 click"
                                onClick={() => handleUpLoadButtonClick(row.original.id, 'promocode')}>
                            <i className="bi bi-receipt"></i>
                        </button>
                    </>
                ),
            },
            {
                Header: 'URLs',
                accessor: 'urls',
                disableSortBy: true,
                Cell: ({row}) => {
                    // Ограничиваем отображение только первой ссылкой
                    const firstUrl = row.original.urls.split('\n')[0];

                    // Добавляем многоточие и кнопку, если есть дополнительные ссылки
                    const displayText = row.original.urls.includes('\n') ? `${firstUrl}...` : firstUrl;

                    return (
                        <div className="click">
                            {displayText}
                            {row.original.urls.includes('\n') && (
                                <button
                                    onClick={() => handleSetButtonClick(row.original.id)}
                                    style={{marginLeft: '5px', border: 'none', background: 'none', cursor: 'pointer'}}
                                >
                                    ...
                                </button>

                            )}
                        </div>
                    );
                },
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
        // Обновите счетчик при изменении выбранных элементов
        setSelectedCount(selectedItems.length);
    }, [selectedItems]);

    async function handleRunButtonClick(id: number) {
        try {
            const requestData = {
                id: id.toString(), // Преобразуйте id в строку
            };

            await addTasks(id)

            const res = await fetch('/api/controller/promocode/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const result = await res.json();

            if (result.res) {
                showToast('Обработано', {type: 'success'});
            } else {
                let message = ''
                result.error?message='Ошибка при парсинге':message='Задача уже выполняется'
                showToast(message, {type: 'error'});
            }
        } catch (e) {
            console.error("Ошибка:", e);
            showToast('Ошибка при запуске', {type: 'error'});
        } finally {
            setIsButtonClicked(false);
        }
    }

    async function addTasks(id: number) {
        const requestData = {
            date: [{template: id.toString()}],
        };

        try {
            const res = await fetch('/api/controller/tasks/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const result = await res.json();

            if (result.data === 'ok') {
                showToast('Запущено', {type: 'success'});
            } else if (result.data === 'noadd') {
                // Обработка успешного выполнения с предупреждением
                showToast('Запущено, но однократно', {type: 'warning'});
            } else {
                // Обработка ошибки
                showToast('Ошибка на сервере', {type: 'error'});
            }
        } catch (error) {
            // Обработка ошибки сети или других ошибок
            console.error('Ошибка при отправке запроса:', error);
            showToast('Ошибка при отправке запроса', {type: 'error'});
        }
    }

    async function handleSetButtonClick(id: number) {
        try {
            const res = await fetch(`/api/controller/template/?id=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await res.json();

            if (result.res) {
                // Обновляем данные в formData
                setFormData({
                    ...formData,
                    name: result.data.name,
                    lastRun: result.data.lastRun,
                    interval: result.data.interval,
                    urls: result.data.urls,
                });

                setShowModal(true);
            } else {
                // Обработка ошибки, если необходимо
            }
        } catch (error) {
            showToast('Ошибка при отправке запроса: ' + error, {type: 'error'});
            console.error('Ошибка при отправке запроса:', error);
        }
    }

    async function handleUpLoadButtonClick(id: any, text: string) {
        try {
            let api = ''
            if (text === 'shop') {
                api = '/api/controller/upload/shop'
            } else if (text === 'promocode') {
                api = '/api/controller/upload/promocode'
            }
            const res = await fetch(api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id: id}),
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
        } catch (e) {
            showToast('Ошибка при выгрузке ' + e, {type: 'error'});
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/controller/template');
                const result = await res.json();

                if (result.res && result.data) {
                    setData(result.data);
                } else {
                    console.error('Failed to fetch data');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const apiUrl = '/api/controller/template';
    const dateValue = '2023-12-31';

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            date: dateValue,
        }),
    };

    const handleClick = async (id: number, e?) => {
        if (id === 1) {
            try {
                const res = await fetch(apiUrl, requestOptions);
                const data = await res.json();
                console.log('Response:', data);
            } catch (error) {
                console.error('Error:', error);
                alert('Error occurred');
            }
        } else if (id === 2) {
            setShowModal(true)
        } else if (id === 3) {
            e.preventDefault();

            const requestData = {
                date: [formData],
            };

            try {
                const res = await fetch('/api/controller/template/post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                const result = await res.json();

                if (result.res) {
                    const fetchData = async () => {
                        try {
                            const res = await fetch('/api/controller/template');
                            const result = await res.json();

                            if (result.res && result.data) {
                                setData(result.data);
                            } else {
                                console.error('Failed to fetch data');
                            }
                        } catch (error) {
                            console.error('Error fetching data:', error);
                        }
                    };

                    await fetchData();

                    // Закрываем модальное окно после успешной отправки
                    setShowModal(false);

                } else {
                    showToast('Ошибка при отправке данных', {type: 'error'});
                }
            } catch (error) {
                showToast('Ошибка приложения', {type: 'error'});
                console.error('Error submitting data:', error);
            }
        } else if (id === 4) {
            const {id, checked} = e.target;
            setFormData((prevFormData) => ({
                ...prevFormData,
                [id]: checked,
                daysInterval: '', // Сбрасываем значение daysInterval при изменении состояния чекбокса
            }));
        } else if (id === 5) {
            const {name, value} = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        } else if (id === 6) {
            const requestData = {
                date: [{name: formData.name}],
            };
            const res = await fetch('/api/controller/template/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const result = await res.json();
            if (result.res) {
                const fetchData = async () => {
                    try {
                        const res = await fetch('/api/controller/template');
                        const result = await res.json();

                        if (result.res && result.data) {
                            setData(result.data);
                        } else {
                            console.error('Failed to fetch data');
                        }
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                };

                await fetchData();
                showToast('Удаление', {type: 'warning'});

                // Закрываем модальное окно после успешной отправки
                setShowModal(false);
            } else {
                showToast('Ошибка', {type: 'error'});
            }
        } else {
            showToast('В разработке', {type: 'warning'});
        }
    }

    return (
        <>
            <section className="col-lg-6 mt-3">
                <header className="text-black ms-5 mt-4">
                    <h4>Парсинг</h4>
                </header>
                <article className="ms-5 mt-5">
                    <button
                        className="btn btn-primary mb-4"
                        onClick={() => handleClick(2)}
                    >
                        Добавить шаблон
                    </button>
                    <p>Выбрано: {selectedCount}</p>
                    <TableComponent
                        columns={columns}
                        data={data}
                        onSortChange={handleSortChange}
                    />
                </article>
            </section>

            {/* Модальное окно */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Добавление шаблона</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => handleClick(3, e)}>
                        {/* Добавьте поля формы для каждого свойства модели */}
                        <Form.Group controlId="formName">
                            <Form.Label>Имя шаблона</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Введите имя шаблона"
                                name="name"
                                value={formData.name}
                                onChange={(e) => handleClick(5, e)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formUrls">
                            <Form.Label>Массив ссылок</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Введите ссылки, разделяя их переводом строки"
                                name="urls"
                                value={formData.urls}
                                onChange={(e) => handleClick(5, e)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="parseUrls">
                            <Form.Check
                                type="checkbox"
                                label="Расписание парсинга"
                                name="parseUrls"
                                checked={formData.parseUrls}
                                onChange={(e) => handleClick(4, e)}
                            />
                        </Form.Group>

                        {formData.parseUrls && (
                            <Form.Group className="mb-4" controlId="formDaysInterval">
                                <Form.Label>Количество дней между запусками</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Введите количество дней"
                                    name="interval"
                                    min="0"
                                    value={formData.interval}
                                    onChange={(e) => handleClick(5, e)}
                                />
                            </Form.Group>
                        )}
                        <div className="d-flex justify-content-between">
                            <Button variant="primary" type="submit">
                                Отправить
                            </Button>
                            <Button variant="danger" type="button" onClick={(e) => handleClick(6, e)}>
                                Удалить
                            </Button>
                        </div>

                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};
