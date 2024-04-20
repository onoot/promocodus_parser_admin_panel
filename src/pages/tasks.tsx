import type { NextPage } from "next";
import Head from "next/head";
import {TasksView} from "../views";

const Tasks: NextPage<{ style: React.CSSProperties }> = ({ style }) => {
    return (
        <div>
            <Head>
                <title>Promocodus Parser - Парсинг</title>
                <meta
                    name="parser"
                    content="Page of parser"
                />
            </Head>
            <TasksView />
        </div>
    );
};

export default Tasks;
