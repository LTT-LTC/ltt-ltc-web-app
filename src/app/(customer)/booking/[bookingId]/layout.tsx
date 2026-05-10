"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import TopBar from "../../_components/TopBar";
import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import BookingStepper, { BookingStep } from "../_components/BookingStepper";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { clearBookingState } from "@/src/@core/booking/bookingState";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogFooter,
    LTTDialogHeader,
    LTTDialogTitle,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";

/** Resolve step from URL; works with `trailingSlash: true` (`/booking/id/extras/`). */
const STEP_FROM_PATH = (pathname: string): BookingStep => {
    const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    const prev = segments[segments.length - 2];
    if (last === "otp" && prev === "payment") {
        return "payment";
    }
    switch (last) {
        case "seats":
            return "seats";
        case "confirm-seats":
            return "confirm-seats";
        case "extras":
            return "extras";
        case "summary":
            return "summary";
        case "payment":
            return "payment";
        case "processing":
            return "processing";
        default:
            return "seats";
    }
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
    const { t } = useLocalization();
    const pathname = usePathname() || "";
    const activeStep = STEP_FROM_PATH(pathname);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [pendingLeaveHref, setPendingLeaveHref] = useState<string | null>(null);
    const bookingId = useMemo(() => {
        const match = pathname.match(/^\/booking\/([^/]+)/);
        return match?.[1] ?? "";
    }, [pathname]);
    const bookingBasePath = useMemo(() => {
        const match = pathname.match(/^\/booking\/([^/]+)/);
        return match ? `/booking/${match[1]}` : "/booking";
    }, [pathname]);

    const confirmLeave = () => {
        if (bookingId) {
            clearBookingState(bookingId);
        }
        const nextHref = pendingLeaveHref;
        setLeaveDialogOpen(false);
        setPendingLeaveHref(null);
        if (nextHref) {
            window.location.assign(nextHref);
        }
    };

    const cancelLeave = () => {
        setLeaveDialogOpen(false);
        setPendingLeaveHref(null);
    };

    useEffect(() => {
        const clickHandler = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
            if (!anchor) return;
            if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            let nextUrl: URL;
            try {
                nextUrl = new URL(anchor.href, window.location.origin);
            } catch {
                return;
            }

            const isSameOrigin = nextUrl.origin === window.location.origin;
            const isInsideCurrentBooking = isSameOrigin && nextUrl.pathname.startsWith(bookingBasePath);

            if (isInsideCurrentBooking) return;

            event.preventDefault();
            event.stopPropagation();
            setPendingLeaveHref(nextUrl.toString());
            setLeaveDialogOpen(true);
        };

        document.addEventListener("click", clickHandler, true);

        return () => {
            document.removeEventListener("click", clickHandler, true);
        };
    }, [bookingBasePath]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="bg-[#f5f6f8] text-slate-900 min-h-screen flex flex-col">
            <TopBar />
            <Header />

            <main className="flex-grow container mx-auto px-4 py-6 max-w-6xl">
                <BookingStepper activeStep={activeStep} />
                {children}
            </main>

            <Footer />

            <LTTDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                <LTTDialogContent className="sm:max-w-sm bg-white">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{t("customer.booking.exit_confirm.title")}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-2 text-sm text-muted-foreground-shadcn leading-relaxed">
                        {t("customer.booking.exit_confirm.message")}
                    </div>
                    <LTTDialogFooter className="gap-3">
                        <LTTButton variant="outline" onClick={cancelLeave} className="flex-1">
                            {t("customer.booking.exit_confirm.stay")}
                        </LTTButton>
                        <LTTButton variant="destructive" onClick={confirmLeave} className="flex-1">
                            {t("customer.booking.exit_confirm.exit_discard")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </div>
    );
}
