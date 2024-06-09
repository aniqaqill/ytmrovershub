import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import React from "react";
import { ThemeProvider } from "@mui/material";
import theme from "~/styles/theme"
import CssBaseline from "@mui/material/CssBaseline";
import { api } from "~/utils/api";
import Head from "next/head";




const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>YTM ROVERS</title>
        <meta name="description" content="Create By Aniq" />
        <link rel="icon" href="/logo2.png" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
