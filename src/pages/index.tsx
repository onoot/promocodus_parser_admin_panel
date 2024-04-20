import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage<{ style: React.CSSProperties }> = ({ style }) => {
  return (
    <div style={style}>
        <Head>
            <title>Promocodus Parser - Парсинг</title>
            <meta
                name="parser"
                content="Page of parser"
            />
        </Head>
      <HomeView />
    </div>
  );
};

export default Home;
