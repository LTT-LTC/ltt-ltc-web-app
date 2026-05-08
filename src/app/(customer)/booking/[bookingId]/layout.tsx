"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopBar from "../../_components/TopBar";
import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import BookingStepper, { BookingStep } from "../_components/BookingStepper";

const STEP_FROM_PATH = (pathname: string): BookingStep => {
    if (pathname.endsWith("/seats")) return "seats";
    if (pathname.endsWith("/confirm-seats")) return "confirm-seats";
    if (pathname.endsWith("/extras")) return "extras";
    if (pathname.endsWith("/summary")) return "summary";
    if (pathname.endsWith("/payment")) return "payment";
    if (pathname.endsWith("/processing")) return "processing";
    return "seats";
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "";
    const activeStep = STEP_FROM_PATH(pathname);

    return (
        <div className="bg-[#f5f6f8] text-slate-900 min-h-screen flex flex-col">
            <TopBar />
            <Header />

            <main className="flex-grow container mx-auto px-4 py-6 max-w-6xl">
                <BookingStepper activeStep={activeStep} />
                {children}
            </main>

            <Footer />
        </div>
    );
}
