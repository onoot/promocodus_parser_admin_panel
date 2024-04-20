import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { showToast } from "../../components/Notification/ToastContainer";

export function TerminalView() {
    const [terminalData, setTerminalData] = useState('');
    const terminalRef = useRef(null);
    const [status, setStatus] = useState(true); // Статус терминала (по умолчанию - true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/controller/terminal');
                const text = await response.text();
                setTerminalData(text);
            } catch (error) {
                setStatus(false); // Установка статуса в false в случае ошибки
                console.error('Ошибка запроса:', error);
            }
        };

        const interval = setInterval(fetchData, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }

        if (!status) {
            showToast('Терминал давно не отправлял данные', { type: 'warning' });
        }
    }, [terminalData, status]); // Добавление status в зависимости

    const applyStyle = (text) => {
        let style = {};
        let cleanedText = text.replace(/\x1B\[[0-9;]*[mGKH]/g, '');
        cleanedText = cleanedText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" <a class="link" target="_blank">$1</a>'); // Найти все ссылки и обернуть их в тег <a>

        const linkStyle = { color: 'blue', textDecoration: 'underline' };
        const emptyLinkStyle = { color: 'grey', textDecoration: 'underline' };

        if (cleanedText.includes('ready')) {
            style = { color: 'green' };
        } else if (cleanedText.includes('info')) {
            style = { color: 'cyan' };
        } else if (cleanedText.includes('event')) {
            style = { color: 'blue' };
        } else if (cleanedText.includes('warn')) {
            style = { color: 'yellow' };
        } else if (cleanedText.includes('error')) {
            style = { color: 'red' };
        }

        return (
            <span style={style} dangerouslySetInnerHTML={{ __html: cleanedText }}></span>
        );
    };

    return (
        <>
            <section className={`col-lg-11 mt-3`}>
                <Head>
                    <title>Promocodus Parser - Терминал</title>
                </Head>
                <header className="text-black ms-5 mt-4">
                    <h4>Терминал</h4>
                </header>
                <article className="ms-5 mt-4">
                    {/* Окно терминала */}
                    <pre ref={terminalRef} className={`${!status ? 'red-border' : ''}`} style={{ backgroundColor: 'black', color: 'white', padding: '10px', minHeight: '100svh', overflowY: 'auto' }}>
                         {terminalData.split('\n').map((line, index) => (
                             <div key={index}>{applyStyle(line)}</div>
                         ))}
                    </pre>
                </article>
            </section>
            <style jsx>{`
                .red-border {
                    border: 10px solid red; 
                }
            `}</style>
        </>
    );
}
