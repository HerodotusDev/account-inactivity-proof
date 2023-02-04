import type { AppProps } from "next/app";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

import { globalStyles } from "../shared/styles";

const cache = createCache({ key: "next" });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CacheProvider value={cache}>
      {globalStyles}
      <Component {...pageProps} />
    </CacheProvider>
  );
}
