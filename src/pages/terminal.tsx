import type { NextPage } from "next";
import Head from "next/head";
import {TerminalView} from "../views";

const Terminal: NextPage<{ style: React.CSSProperties }> = ({ style }) => {
    return (
        <div>
            <Head>
                <title>Promocodus Parser - Терминал</title>
                <meta
                    name="parser"
                    content="Page of parser"
                />
            </Head>
            <TerminalView />
        </div>
    );
};

export default Terminal;
