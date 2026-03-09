"use client";
import React from 'react';
import ThemeProvider from "../@core/provider/theme-provider";
import { SidebarProvider } from "../@core/provider/sidebar-provider";
import viVN from "antd/locale/vi_VN";
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { useMessageInit } from "../@core/utils/message";

const MessageInitializer = ({ children }: { children: React.ReactNode }) => {
    useMessageInit();
    return <>{children}</>;
};

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`dark:bg-gray-900`}>
            <StyleProvider hashPriority="low">
                <ConfigProvider locale={viVN}>
                    <ThemeProvider>
                        <MessageInitializer>
                            <SidebarProvider>{children}</SidebarProvider>
                        </MessageInitializer>
                    </ThemeProvider>
                </ConfigProvider>
            </StyleProvider>
        </div>
    );
}
