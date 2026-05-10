"use client";

import * as signalR from "@microsoft/signalr";
import { TENANT_KEY } from "@/src/@core/const";
import { getCookie } from "@/src/@core/utils/cookie";
import { normalizeTenantForHeader } from "@/src/@core/utils/tenant";

const hubPath = "/administration-service/hubs/showtime-seats";

export type SeatMapDeltaPayload = {
    kind: string;
    seatCodes: string[];
    sessionKey?: string | null;
    expiresAtUtc?: string | null;
};

function hubUrl(): string {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    return `${base.replace(/\/$/, "")}${hubPath}`;
}

function tenantHeader(): Record<string, string> {
    if (typeof window === "undefined") {
        return {};
    }
    const fromStorage = window.localStorage.getItem(TENANT_KEY);
    const fromCookie = getCookie(TENANT_KEY);
    const raw = fromStorage ?? fromCookie ?? undefined;
    const normalized = normalizeTenantForHeader(raw);
    return normalized ? { [TENANT_KEY]: normalized } : {};
}

/**
 * Subscribe to live seat hold updates for a showtime (SignalR).
 * Caller should invoke JoinShowtime on the connection after start (handled here).
 */
export function subscribeShowtimeSeatMap(
    showtimeId: string,
    onDelta: (payload: SeatMapDeltaPayload) => void,
): {
    connection: signalR.HubConnection;
    start: () => Promise<void>;
    stop: () => Promise<void>;
} {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl(), {
            headers: tenantHeader(),
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

    connection.on("SeatMapDelta", (payload: SeatMapDeltaPayload) => {
        onDelta(payload);
    });

    const start = async () => {
        await connection.start();
        await connection.invoke("JoinShowtime", showtimeId);
    };

    const stop = async () => {
        try {
            await connection.invoke("LeaveShowtime", showtimeId);
        } catch {
            /* ignore */
        }
        await connection.stop();
    };

    return { connection, start, stop };
}
