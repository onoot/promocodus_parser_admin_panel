import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import {ToastContainer} from "react-bootstrap";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)

    return initialProps
  }

  render() {
    return (
      <Html>
        <Head>
            <link rel="icon" href="./favicon.ico"/>
            <link rel="manifest" href="./manifest.json"/>
        </Head>
        <body className="max-content">
        <ToastContainer />
        <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
