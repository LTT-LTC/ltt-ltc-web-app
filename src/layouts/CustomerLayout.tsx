"use client";
import React from 'react';

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout manages the specific styles/structure for the public facing site
    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            {children}
        </div>
    );
}
