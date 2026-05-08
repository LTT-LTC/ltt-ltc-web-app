"use client";
import ThemeProvider from "../@core/provider/theme-provider";
import { SidebarProvider } from "../@core/provider/sidebar-provider";
import viVN from "antd/locale/vi_VN";
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import "material-symbols/outlined.css";
import "@/public/css/globals.css";
import "@/public/css/pages/loading.css";
import { useMessageInit } from "../@core/utils/message";
import { Provider } from "react-redux";
import { store } from "../stores";
import { Index } from "../@core/provider/localization-provider";
import { LTTToaster } from "../@core/component/LTTShadcnUI/LTTSonner";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const MessageInitializer = ({ children }: { children: React.ReactNode }) => {
        useMessageInit();
        return <>{children}</>;
    };

    return (
        <html lang="en">
            <head>
                <title>LTC-Cinema</title>
                <link rel="icon" type="image/png" href="/images/main/app-logo-transparent.png"></link>
            </head>
            <body className={`dark:bg-gray-900`} suppressHydrationWarning>
                <Provider store={store}>
                    <StyleProvider hashPriority="low">
                        <ConfigProvider
                            locale={viVN}
                            theme={{
                                token: {
                                    fontFamily: 'var(--font-outfit, "Be Vietnam Pro", sans-serif)',
                                    colorPrimary: '#cc3434',
                                },
                            }}
                        >
                            <ThemeProvider>
                                <Index>
                                    <MessageInitializer>
                                        <SidebarProvider>{children}</SidebarProvider>
                                        <LTTToaster />
                                    </MessageInitializer>
                                </Index>
                            </ThemeProvider>
                        </ConfigProvider>
                    </StyleProvider>
                </Provider>
            </body>
        </html>
    );
}
