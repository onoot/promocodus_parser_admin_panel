// Next, React
import React, {FC, useCallback, useEffect, useState} from 'react';
import Head from "next/head";
import TableComponent from "../../components/dynTable/ParserTable";
import {showToast} from "../../components/Notification/ToastContainer";
import {Dropdown} from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export const StoreView: FC = () => {
    const [dataTemp, setDataTemp] = useState([]);
    const [data, setData] = useState([]);

    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);
    const [itemsToShow, setItemsToShow] = useState(50);

    const [inputText, setInputText] = useState('');
    const [matches, setMatches] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showButton, setshowButton] = useState(false);

    const [showDate, setShowDate] = useState(true);

    const [executed, setExecuted] = useState(true);
    const [imported, setImported] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
    const [reload, setReload] = useState(true);

    const preDate = showDate ? data : matches;
    const allcount = data.length

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
                            checked={selectedCount === preDate.length}
                            onChange={() => handleSelectAllCheckbox()}
                        />
                        Выбрать
                    </>
                ),
                disableSortBy: true,
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
                Header: 'Name',
                accessor: 'store_name',
            },
            {
                Header: 'Image',
                accessor: 'img',
                Cell: ({value}) => ImageCell({value})
            },
            {
                Header: 'Description',
                accessor: 'description',
                Cell: ({cell: {value}}) => <DescriptionCell value={value}/>,
            },
            {
                Header: 'H1',
                accessor: 'h1',
            },
            {
                Header: 'H2',
                accessor: 'h2',
            },
            {
                Header: 'Info',
                accessor: (row) => `${row.info}; ${row.info_addres}; ${row.info_email}; ${row.info_phone}; ${row.info_vk}`,
                Cell: ({cell: {value}}) => <DescriptionCell value={value}/>,
            },
            {
                Header: 'URL',
                accessor: 'store_url',
            },
            {
                Header: 'Active',
                accessor: 'active',
                Cell: ({value}) => (value ? 'Yes' : 'No'), // Отображение 'Yes' для true и 'No' для false
            },
            {
                Header: 'Category',
                accessor: 'category',
            },
            {
                Header: 'Sub-category',
                accessor: 'sub_category',
            },
            {
                Header: 'Shop URL',
                accessor: 'url',
            },
            {
                Header: 'Slag',
                accessor: 'slag',
            },
            {
                Header: 'New',
                accessor: 'new',
                Cell: ({row}) =>
                    <button type="button" className={`btn ${row ? 'btn-success' : 'btn-secondary'}`}>
                        {row ? 'Новый' : 'Старый'}
                    </button>
            },
            {
                Header: 'Time',
                accessor: 'time',
            },
            {
                Header: 'Imported',
                accessor: 'imported',
                Cell: ({row, value}) => {
                    return value ? (
                        <button className="btn btn-success"
                                onClick={() => handleButtonClick(row, value, 2)}>Удалить</button>
                    ) : (
                        <button className="btn btn-danger"
                                onClick={() => handleButtonClick(row, value, 2)}>Добавить</button>
                    );
                },
                sortType: (rowA, rowB) => {
                    return rowA.original.imported === rowB.original.imported ? 0 : (rowA.original.imported ? 1 : -1);
                }
            },
            {
                Header: 'Exception',
                accessor: 'exception',
                Cell: ({row, value}) => {
                    return value ? (
                        <button className="btn btn-success"
                                onClick={() => handleButtonClick(row, value, 1)}>Удалить</button>
                    ) : (
                        <button className="btn btn-danger"
                                onClick={() => handleButtonClick(row, value, 1)}>Добавить</button>
                    );
                },
                sortType: (rowA, rowB) => {
                    return rowA.original.exception === rowB.original.exception ? 0 : (rowA.original.exception ? 1 : -1);
                }
            }

        ],
        [ selectedItems, preDate,]
    );

    const handleCheckboxChange = useCallback((id) => {
        setSelectedItems((prevSelectedItems) => {
            if (prevSelectedItems.includes(id)) {
                return prevSelectedItems.filter(item => item !== id);
            } else {
                return [...prevSelectedItems, id];
            }
        });
    }, [setSelectedItems]);


    const handleSelectAllCheckbox = useCallback(() => {
        setSelectedItems((prevSelectedItems) => {
            if (prevSelectedItems.length === preDate.length) {
                return [];
            } else {
                return preDate.map(item => item.id);
            }
        });
    }, [preDate]);


    useEffect(() => {
        setSelectedCount(selectedItems.length);
    }, [selectedItems]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const templateResponse = await fetch('/api/controller/template');

                const templateResult = await templateResponse.json();

                if (templateResult.res && templateResult.data) {
                    setDataTemp(templateResult.data);
                } else {
                    showToast('Данные шаблонов не получены', {type: 'warning'});
                    console.error('Failed to fetch template data');
                }
            } catch (error) {
                showToast('Ошибка. Обновите страницу', {type: 'error'});
                console.error('Error fetching data:', error);
            }
        };

        const fetchStore = async () => {
            try {
                const response = await fetch('/api/controller/store/get');
                const dataStream = await response.body;

                const reader = dataStream.getReader();
                let result = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    result += await new TextDecoder().decode(value);
                }
                setData(JSON.parse(result));
                setIsLoading(false);
            } catch (error) {
                showToast('Ошибка. Обновите страницу', { type: 'error' });
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
        fetchStore();
    }, [ executed, imported, reload]);


    /**Для добавления или удаления из исключения**/
    async function handleButtonClick(row, value, mes) {
        const id = row.original.id;
        const requestData = {
            data: {
                bool: !value,
                items: [id],
                mes: mes,
            }
        };

        try {
            const res = await fetch('/api/controller/store/executed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const result = await res.json();

            if (result.res) {
                showToast('Обработано', {type: 'success'});

                // Обновление состояний только при успешном выполнении запроса
                if (mes === 1) {
                    setExecuted(!executed);
                } else if (mes === 2) {
                    setImported(!imported);
                }
            } else {
                showToast('Ошибка при добавлении', {type: 'error'});
            }
            setReload(!reload)
        } catch (e) {
            console.log(e);
            showToast('Произошла ошибка на странице!', {type: 'error'});
        }
    }

    // Элемент таблицы с сокращённым описанием и кнопкой для полного описания
    const DescriptionCell: React.FC<{ value: string }> = ({value}) => {
        const [showModal, setShowModal] = useState(false);
        const isString = typeof value === 'string';
        const truncated = isString && value.length > 40 ? `${value.substring(0, 40)}...` : value;

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
                    <Modal.Body>{value}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Закрыть
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    };

    const ImageCell = ({value}) => {
        const imageUrl = `https://promokodus.com${value}`;
        // const imageUrl = `${value}`;

        const copyToClipboard = async () => {
            try {
                await navigator.clipboard.writeText(imageUrl);
                if (value) {
                    showToast('Ссылка скопирована', {type: 'success'});
                    console.log('URL изображения скопирован в буфер обмена');
                } else {
                    showToast('Ссылка отсутствует', {type: 'warning'});
                    console.error('Ссылка отсутствует');
                }
            } catch (err) {
                showToast('Не удалось скопировать', {type: 'warning'});
                console.error('Не удалось скопировать URL изображения', err);
            }
        };

        return (
            <>
                <button onClick={copyToClipboard}>
                    <img src={imageUrl} alt="Preview"
                         style={{width: '50px', border: '1px solid black', borderRadius: '1px'}}/>
                </button>
            </>
        );
    };

    async function handleClick(id: number) {
        showToast('Отправлено', {type: 'success'});
        try {
            if (id === 1) {
                const res = await fetch('/api/controller/store');
                const result = await res.json();

                if (result.res) {
                    showToast('Данные будут обновлены постепенно с течением времени');
                } else {
                    showToast('Ошибка на сервере', {type: 'warning'});
                    console.error('Failed to fetch data');
                }
            } else if (id === 2) {
                const res = await fetch('/api/controller/store/gallstore');
                const result = await res.json();

                // Проверяем, имеет ли результат свойство 'res' (считаем это признаком успеха)
                if (res.ok && result.res) { // Успешный HTTP статус и наличие 'res'
                    showToast('Обновлено', {type: 'success'});
                } else {
                    showToast('Ошибка на сервере', {type: 'warning'});
                    console.error('Failed to fetch data', result.error); // Выводим ошибку из ответа, если есть
                }
            } else if (id === 3) {
                const api = '/api/controller/upload/shop/all'

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
            } else if (id === 4) {
                const api = '/api/controller/store/new'

                const res = await fetch(api, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({items: selectedItems}),
                });

                console.log(selectedItems)
                if (res.ok) {
                    showToast('Выполнено', {type: 'success'})
                } else {
                    showToast('Данные не получены', {type: 'error'})
                }
            }
        } catch (e) {
            showToast('Ошибка при выполнении запроса', {type: 'error'});
            console.log(e)
        }
    }

    async function handleSelectTemplate(name: any) {
        try {
            const requestData = {
                data: {
                    template: name,
                    items: selectedItems,
                }
            };
            const res = await fetch('/api/controller/template/stpost', {
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
                showToast('Ошибка при добавлении', {type: 'error'});
            }
        } catch (e) {
            showToast('Ошибка страницы', {type: 'error'});
        }
    }

    async function handleExecuted(bool: boolean, mes: number) {
        try {
            const requestData = {
                data: {
                    bool: bool,
                    items: selectedItems,
                    mes: mes,
                }
            };
            if (mes == 1) {
                const res = await fetch('/api/controller/store/executed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                const result = await res.json();

                if (result.res) {
                    setImported(!imported)
                    showToast('Обработано', {type: 'success'});
                } else {
                    showToast('Ошибка при добавлении', {type: 'error'});
                }
            } else if (mes == 2) {
                const res = await fetch('/api/controller/store/executed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                const result = await res.json();

                if (result.res) {
                    setExecuted(!executed)
                    showToast('Обработано', {type: 'success'});
                } else {
                    showToast('Ошибка при добавлении', {type: 'error'});
                }
            }

        } catch (e) {
            showToast('Ошибка страницы', {type: 'error'});
        }
    }

    const showMoreItems = () => {
        setItemsToShow(prevItemsToShow => prevItemsToShow + 100);
    };

    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };

    const handleSearch = (res) => {
        if (res) {
            setshowButton(true)
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
            setshowButton(false)
            setShowDate(true);
            setMatches([]);
        }
        setShowModal(false);
    };

    async function upLoad(par: number, rout?: number) {
        try {
            if (par == 1) {
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
            } else if (par == 2) {
                showToast('Пожалуйста, подождите', {type: 'success'})
                const api = '/api/controller/upload/select'

                const requestData = {
                    data: {
                        id: selectedItems,
                        rout: rout,
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
            } else if (par == 3) {

            }

        } catch (e) {
            console.log(e)
        }
    }

    return (
        <>
            <div className={`overlay ${isLoading ? 'active' : ''}`}>
                <div className="spinner">
                    <i className="bi bi-arrow-repeat fs-2"/>
                </div>
            </div>
            <section className="col-lg-12 mt-3">
                <Head>
                    <title>Promocodus Parser - Магазины</title>
                </Head>
                <header className="text-black ms-5 mt-4">
                    <h4>Магазины</h4>
                </header>
                <article className="ms-5 mt-5">
                    <article className="d-flex">
                        <button
                            className="btn btn-primary mb-4"
                            onClick={() => handleClick(2)}
                        >
                            Поиск новых
                        </button>

                        <button
                            className="btn btn-outline-danger mb-4 ms-4"
                            onClick={() => handleClick(1)}
                        >
                            Парсинг всех магазинов
                        </button>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant={`btn ${selectedItems.length > 0 ? 'btn-success' : 'btn-secondary'} ms-5`}
                                id="dropdown-basic">
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
                            <button onClick={() => handleClick(3)} className="btn btn-success ms-5">
                                Скачать все
                            </button>
                        </Dropdown>
                    </article>

                    <div className="d-flex">
                        <article className="flex-column">
                            <p>В базе: {allcount}</p>
                            <p>Выбрано: {selectedCount}</p>
                        </article>

                        <article className="d-flex mt-3 mb-5">
                            <article className="d-flex">
                                <button className="btn btn-primary ms-4" onClick={() => setShowModal(true)}>
                                    <i className="bi bi-search"></i>
                                </button>
                                <Dropdown className="ms-4">
                                    <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                                        В шаблон
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {dataTemp.map((template, index) => (
                                            <Dropdown.Item
                                                key={template.id || index}
                                                onClick={() => handleSelectTemplate(template.name)}
                                            >
                                                {template.name}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                                <button
                                    className="btn btn-outline-danger ms-4"
                                    onClick={() => handleClick(4)}
                                >
                                    Спарсить
                                </button>
                            </article>

                            {showButton && (
                                <button className="btn btn-danger" onClick={() => handleSearch(false)}>
                                    <i className="bi bi-backspace"></i>
                                </button>
                            )}

                            {matches.length > 0 && (
                                <button className="btn">
                                    Найдено: {matches.length}
                                </button>
                            )}
                            <div className="position-relative ms-4" style={{marginTop: '0px'}}>
                                <Dropdown className="ms-2" id="dropdown-basic">
                                    <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                                        Исключения
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            onClick={() => handleExecuted(true, 1)}
                                            className={`btn ${selectedItems.length > 0 ? 'btn-success' : 'btn-secondary'}`}
                                        >
                                            Добавить
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            onClick={() => handleExecuted(false, 1)}
                                            className={`btn ${selectedItems.length > 0 ? 'btn-danger' : 'btn-secondary'}`}
                                        >
                                            Удалить
                                        </Dropdown.Item>

                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>

                            <div className="position-relative" style={{marginTop: '0px'}}>
                                <Dropdown className="ms-2" id="dropdown-basic">
                                    <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                                        Импорт
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            onClick={() => handleExecuted(true, 2)}
                                            className={`btn ${selectedItems.length > 0 ? 'btn-success' : 'btn-secondary'}`}
                                        >
                                            Добавить
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            onClick={() => handleExecuted(false, 2)}
                                            className={`btn ${selectedItems.length > 0 ? 'btn-danger' : 'btn-secondary'}`}
                                        >
                                            Удалить
                                        </Dropdown.Item>

                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </article>
                    </div>

                    {/*<TableComponent columns={columns} data={preDate.slice(0, itemsToShow)}/>*/}
                    <TableComponent
                        columns={columns}
                        data={preDate.slice(0, itemsToShow)}
                        onSortChange={handleSortChange}
                    />
                    <article className="d-flex justify-content-start">
                        <button
                            className="btn btn-primary mb-4"
                            onClick={showMoreItems}
                        >
                            Показать больше
                        </button>
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
                </article>
            </section>
        </>
    );
};