"use client";
import ThemeProvider from "../@core/provider/theme-provider";
import { SidebarProvider } from "../@core/provider/sidebar-provider";
import viVN from "antd/locale/vi_VN";
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import "material-symbols/outlined.css";
import "@/public/css/globals.css";
import { useMessageInit } from "../@core/utils/message";
import { Provider } from "react-redux";
import { store } from "../stores";

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
            <body className={`dark:bg-gray-900`}>
                <Provider store={store}>
                    <StyleProvider hashPriority="low">
                        <ConfigProvider 
                            locale={viVN}
                            theme={{
                                token: {
                                    fontFamily: '"Be Vietnam Pro", sans-serif',
                                },
                            }}
                        >
                            <ThemeProvider>
                                <MessageInitializer>
                                    <SidebarProvider>{children}</SidebarProvider>
                                </MessageInitializer>
                            </ThemeProvider>
                        </ConfigProvider>
                    </StyleProvider>
                </Provider>
            </body>
        </html>
    );
}
