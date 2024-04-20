import type { NextPage } from "next";
import Head from "next/head";
import { StoreView } from "../views";

const Shop: NextPage <{ style: React.CSSProperties }> = ({ style }) => {
  return (
    <div>
      <Head>
        <title>ТЕст</title>
        <meta
          name="BD STORE"
          content="Shop"
        />
      </Head>
      <StoreView />
    </div>
  );
};

export default Shop;
