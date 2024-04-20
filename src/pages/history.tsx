import type { NextPage } from "next";
import Head from "next/head";
import {HistoryView} from "../views";

const History: NextPage<{ style: React.CSSProperties }> = ({ style }) => {
    return (
        <div>
            <Head>
                <title>Promocodus Parser - Парсинг</title>
                <meta
                    name="parser"
                    content="Page of parser"
                />
            </Head>
            <HistoryView />
        </div>
    );
};

export default History;
