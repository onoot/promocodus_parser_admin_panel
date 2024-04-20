import type { NextPage } from "next";
import Head from "next/head";
import {GiftView} from "../views";

const Coupons: NextPage<{ style: React.CSSProperties }> = ({ style }) => {
    return (
        <div>
            <Head>
                <title>Promocodus Parser - Парсинг</title>
                <meta
                    name="parser"
                    content="Page of parser"
                />
            </Head>
            <GiftView />
        </div>
    );
};

export default Coupons;
