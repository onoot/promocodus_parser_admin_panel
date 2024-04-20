import {AppProps} from 'next/app';
import Head from 'next/head';
import {FC, useEffect, useRef, useState} from 'react';
import {AppBar} from '../components/AppBar';
import {showToast, ToastContainer} from '../components/Notification/ToastContainer'

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {useRouter} from "next/router";

//Страницы
import Home from './index'
import Tasks from "./tasks";
import Shop from "./shop";
import Coupons from "./gift";
import History from "./history";
import Terminal from "./terminal";

require('../styles/globals.css');


const App: FC<AppProps> = ({Component, pageProps}) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [open, setOpen] = useState(6);
    const appBarRef = useRef<HTMLDivElement>(null);

    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const handleStart = () => setLoading(true);
        const handleComplete = () => setLoading(false);

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    }, [router]);


    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            setOpen(1)
            // Вы можете также отправить запрос к серверу для проверки токена
        } else {
            setOpen(6)
        }
    }, []);


    const handleLogin = async () => {
        // Отправка токена на сервер для проверки (ваша логика на сервере)
        const response = await fetch('/api/controller/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({password}),
        });

        const data = await response.json();

        if (data.success) {
            // Если авторизация успешна, сохраняем токен и перенаправляем пользователя
            localStorage.setItem('token', data.token);
            showToast('Авторизованы', {type: 'success', onDismiss: () => router.reload()})
            setOpen(1)
        } else {
            showToast('Неверный пароль', {type: 'warning'})
            // Если авторизация не удалась, обработка ошибки (например, показ сообщения)
            console.error('Ошибка авторизации');
            setOpen(6)
        }
    };

    const handleLogout = () => {
        // Очистка токена при выходе
        localStorage.removeItem('token');
        setToken('');
        setOpen(6)
    };

    return (
        <>
            <Head>
                <title>Promocodus Parser</title>
            </Head>

            <section className="d-flex flex-row vh-100">
                <ToastContainer/>
                {open !== 6 && (
                    <AppBar open={open} setOpen={setOpen} appBarRef={appBarRef}/>
                )}
                {/*<button onClick={handleLogout}>Выйти</button>*/}

                {open!==6 && (
                    <div ref={appBarRef} className="col-lg-9 col-md-8 col-sm-7" style={{overflowY: 'auto'}}>
                        {open == 1 && (
                            <Home style={{maxHeight: appBarRef.current?.offsetHeight, overflowY: 'auto'}}/>
                        )}
                        {open == 2 && (
                            <Tasks style={{maxHeight: appBarRef.current?.offsetHeight, overflowY: 'auto'}}/>
                        )}
                        {open == 3 && (
                            <Shop style={{maxHeight: appBarRef.current?.offsetHeight, overflowY: 'auto'}}/>
                        )}
                        {open == 4 && (
                            <Coupons style={{maxHeight: appBarRef.current?.offsetHeight, overflowY: 'auto'}}/>
                        )}
                        {open == 5 && (
                            <History style={{maxHeight: appBarRef.current?.offsetHeight, overflowY: 'auto'}}/>
                        )}
                        {open == 7 && (
                            <Terminal style={{maxHeight: appBarRef.current?.offsetHeight, overflowY: 'auto'}}/>
                        )}
                    </div>
                )}
                {open == 6 && (
                    <div className="d-flex justify-content-center align-items-center vw-100 vh-100">
                        <div className="col-lg-6 col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <h2 className="card-title text-center mb-4">Авторизация</h2>
                                    <form>
                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">
                                                Пароль
                                            </label>
                                            <input
                                                type="password"
                                                id="password"
                                                className="form-control"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="d-grid">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleLogin}
                                            >
                                                Войти
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

export default App;
