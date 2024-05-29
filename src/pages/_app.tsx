import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import React from "react";
// import { ThemeProvider } from "@mui/material";
// import { themeOptions } from '../styles/theme';

import { api } from "~/utils/api";



const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      {/* <ThemeProvider theme={themeOptions}> */}
        <Component {...pageProps} />
      {/* </ThemeProvider> */}
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
