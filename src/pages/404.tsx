// 404.tsx
import React from 'react';
import Image from 'next/image';
import nextjsLogo from '../../public/next.svg';
import Head from "next/head";


const NotFoundPage: React.FC = () => {
    return (
        <>
            <Head>
                <title>404</title>
                <meta
                    name="404"
                    content="404"
                />
            </Head>
            <div className="container d-flex flex-column align-items-center justify-content-center cstGradient p-0 m-0">
                <Image
                    src={nextjsLogo}
                    alt="Error Image"
                    width={400}
                    height={400}
                />
                <h1 className="">404 - Страница не найдена</h1>
                <div className="mt-3">
                    <a className="btn btn-primary" href="/">Домой</a>
                </div>
            </div>
        </>

    );
};

export default NotFoundPage;
