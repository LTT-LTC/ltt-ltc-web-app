'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTTable from '@/src/@core/component/AntD/LTTTable';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import { useLocalization } from '@/src/@core/hooks/use-localization';
import {
    customerBookingService,
    pickBookingSeatCodes,
    pickBookingSnapshotJson,
    type BookingOutputDto,
} from '@/src/services/customer-service/booking/booking.service';
import { customerShowtimeService } from '@/src/services/customer-service/showtime/showtime.service';
import type { CustomerShowtimeOutputDto } from '@/src/services/customer-service/showtime/models/output.model';
import { customerCinemaService } from '@/src/services/customer-service/cinema/cinema.service';
import type { CustomerCinemaOutputDto } from '@/src/services/customer-service/cinema/models/output.model';

interface TransactionRow {
    id: string;
    date: string;
    description: string;
    amount: string;
    type: string;
    raw: BookingOutputDto;
}

/** Mirrors JSON saved at prepare-for-payment (`summary/page.tsx`). */
type BookingSnapshot = {
    bookingId?: string;
    grandTotal?: number;
    ticketTotal?: number;
    extrasTotal?: number;
    discount?: number;
    seats?: string[];
    fnb?: { id: string; quantity: number }[];
    combos?: { id: string; quantity: number }[];
};

const formatVnd = (amount: number) =>
    `${Math.round(amount || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫`;

function parseSnapshot(json?: string | null): BookingSnapshot | null {
    if (!json?.trim()) return null;
    try {
        return JSON.parse(json) as BookingSnapshot;
    } catch {
        return null;
    }
}

const formatShowtimeRange = (start?: string, end?: string, emptyPlaceholder = '—') => {
    const fmt = (value?: string) => {
        if (!value) return '';
        const parsed = dayjs(value);
        return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : value;
    };
    const left = fmt(start);
    const right = fmt(end);
    if (!left) return emptyPlaceholder;
    if (!right) return left;
    return `${left} ~ ${right}`;
};

/** Paid time: prefer UpdatedAt per product rule. */
const displayPaidTime = (item: BookingOutputDto) => item.updatedAt ?? item.createdAt;

const displayAmountNumber = (item: BookingOutputDto) => {
    const paid = item.paidAmount ?? 0;
    if (paid > 0) return paid;
    return item.totalPrice ?? 0;
};

const displayStatus = (item: BookingOutputDto) =>
    [item.paymentStatus, item.bookingStatus].filter(Boolean).join(' · ') || '—';

const seatsDisplay = (item: BookingOutputDto, snap: BookingSnapshot | null) => {
    if (snap?.seats?.length) return snap.seats.join(', ');
    const codes = pickBookingSeatCodes(item);
    return codes ?? '';
};

function buildDescription(
    item: BookingOutputDto,
    snap: BookingSnapshot | null,
    t: (key: string, opt?: Record<string, string>) => string,
): string {
    const seats = seatsDisplay(item, snap);
    const statusParts = [item.bookingStatus, item.paymentStatus].filter(Boolean);
    const bookingLabel = t('customer.my_ltc.transaction_history.description.booking_label');
    if (seats) {
        return `${statusParts.join(' · ') || bookingLabel} — ${seats}`;
    }
    if (statusParts.length) return statusParts.join(' • ');
    const shortId = item.id.length > 8 ? `${item.id.slice(0, 8)}…` : item.id;
    return t('customer.my_ltc.transaction_history.description.booking_ref', { id: shortId });
}

export default function TransactionHistoryPage() {
    const { t } = useLocalization();
    const [pagination, setPagination] = useState({ page: 1, fetch: 5 });
    const [items, setItems] = useState<BookingOutputDto[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [detailBooking, setDetailBooking] = useState<BookingOutputDto | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailShowtime, setDetailShowtime] = useState<CustomerShowtimeOutputDto | null>(null);
    const [detailCinema, setDetailCinema] = useState<CustomerCinemaOutputDto | null>(null);
    const [venueLoading, setVenueLoading] = useState(false);

    const loadVenueForBooking = useCallback(
        async (booking: BookingOutputDto, cancelledRef: { current: boolean }) => {
            setDetailShowtime(null);
            setDetailCinema(null);
            if (!booking.showtimeId) return;
            setVenueLoading(true);
            try {
                const showtime = await customerShowtimeService.getShowtimeByIdAsync(booking.showtimeId);
                if (cancelledRef.current) return;
                setDetailShowtime(showtime);
                try {
                    const cinema = await customerCinemaService.getCinemaByIdAsync(showtime.cinemaId);
                    if (!cancelledRef.current) setDetailCinema(cinema);
                } catch {
                    if (!cancelledRef.current) setDetailCinema(null);
                }
            } catch {
                if (!cancelledRef.current) {
                    setDetailShowtime(null);
                    setDetailCinema(null);
                    toast.error(t('customer.my_ltc.transaction_history.venue_fetch_error'));
                }
            } finally {
                if (!cancelledRef.current) setVenueLoading(false);
            }
        },
        [t],
    );

    useEffect(() => {
        let cancelled = false;
        const fetchPage = async () => {
            setLoading(true);
            try {
                const result = await customerBookingService.getBookingListAsync({
                    page: pagination.page,
                    fetch: pagination.fetch,
                    sorting: 'UpdatedAt DESC',
                });
                if (cancelled) return;
                setItems(result.items || []);
                setTotalCount(result.totalCount || 0);
            } catch (e) {
                if (!cancelled) {
                    setItems([]);
                    setTotalCount(0);
                    toast.error(e instanceof Error ? e.message : t('customer.my_ltc.transaction_history.list_fetch_error'));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void fetchPage();
        return () => {
            cancelled = true;
        };
    }, [pagination.page, pagination.fetch, t]);

    useEffect(() => {
        if (!detailId) {
            setDetailBooking(null);
            setDetailLoading(false);
            setDetailShowtime(null);
            setDetailCinema(null);
            setVenueLoading(false);
            return;
        }
        const cancelledRef = { current: false };
        setDetailBooking(null);
        setDetailShowtime(null);
        setDetailCinema(null);
        setDetailLoading(true);
        void customerBookingService
            .getBookingByIdAsync(detailId)
            .then(async (b) => {
                if (cancelledRef.current) return;
                setDetailBooking(b);
                setDetailLoading(false);
                await loadVenueForBooking(b, cancelledRef);
            })
            .catch((e) => {
                if (!cancelledRef.current) {
                    setDetailBooking(null);
                    toast.error(e instanceof Error ? e.message : t('customer.my_ltc.transaction_history.booking_detail_error'));
                    setDetailId(null);
                    setDetailLoading(false);
                }
            });
        return () => {
            cancelledRef.current = true;
        };
    }, [detailId, loadVenueForBooking, t]);

    const dataSource = useMemo<TransactionRow[]>(() => {
        return items.map((item) => {
            const snap = parseSnapshot(pickBookingSnapshotJson(item));
            const paidAt = displayPaidTime(item);
            return {
                id: item.id,
                date: paidAt ? dayjs(paidAt).format('DD/MM/YYYY HH:mm') : '—',
                description: buildDescription(item, snap, t),
                amount: formatVnd(displayAmountNumber(item)),
                type: item.paymentMethod || '—',
                raw: item,
            };
        });
    }, [items, t]);

    const columns = useMemo(
        () => [
            {
                title: t('customer.my_ltc.transaction_history.columns.booking_id'),
                dataIndex: 'bookingId',
                key: 'bookingId',
                width: '24%',
                render: (_: string, row: TransactionRow) => (
                    <span className="font-mono text-xs">{row.raw.id}</span>
                ),
            },
            {
                title: t('customer.my_ltc.transaction_history.columns.date'),
                dataIndex: 'date',
                key: 'date',
                width: '20%',
            },
            {
                title: t('customer.my_ltc.transaction_history.columns.description'),
                dataIndex: 'description',
                key: 'description',
                width: '36%',
            },
            {
                title: t('customer.my_ltc.transaction_history.columns.amount'),
                dataIndex: 'amount',
                key: 'amount',
                width: '20%',
                render: (text: string) => <span className="font-bold text-gray-800">{text}</span>,
            },
        ],
        [t],
    );

    const handleRowClick = (record: TransactionRow) => {
        setDetailId(record.raw.id);
    };

    const selected = detailBooking;
    const detailSnap = selected ? parseSnapshot(pickBookingSnapshotJson(selected)) : null;

    const movieTitle =
        detailShowtime?.movie?.title ?? detailShowtime?.movie?.originalTitle ?? '—';
    const cinemaName = detailCinema?.name ?? '—';
    const screenLabel = detailShowtime?.screenName?.trim()
        ? detailShowtime.screenName
        : detailShowtime?.screenId
          ? `${t('customer.booking.room')} ${detailShowtime.screenId}`
          : '—';
    const formatLabel = detailShowtime?.movieFormat?.trim() ? detailShowtime.movieFormat : '—';
    const showtimeRange =
        detailShowtime &&
        formatShowtimeRange(detailShowtime.startTime, detailShowtime.endTime, '—');

    return (
        <div className="w-full animate-fade-in-up">
            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
                {!detailId ? (
                    <>
                        <h2 className="text-2xl font-bold mb-8 border-b pb-4 text-gray-800">
                            {t('customer.my_ltc.transaction_history.title')}
                        </h2>
                        <LTTTable
                            columns={columns}
                            dataSource={dataSource}
                            rowKey="id"
                            loading={loading}
                            className="border border-gray-100 rounded-lg shadow-sm cursor-pointer"
                            onRow={(record) => ({
                                onClick: () => handleRowClick(record as TransactionRow),
                            })}
                            rowClassName="hover:bg-gray-50 transition-colors"
                            pagination={{
                                totalCount,
                                page: pagination.page,
                                fetch: pagination.fetch,
                                onChange: (page: number, fetch: number) => {
                                    setPagination({ page, fetch });
                                },
                            }}
                        />
                    </>
                ) : (
                    <div className="flex flex-col gap-6 animate-fade-in-up">
                        <LTTButton
                            variant="outline"
                            className="w-fit text-[#cc3434] bg-white hover:bg-gray-50 !pl-0 border-none transition-colors"
                            onClick={() => setDetailId(null)}
                        >
                            <span className="flex items-center text-base">
                                <span className="mr-2 text-xl font-bold">←</span>{' '}
                                {t('customer.my_ltc.transaction_history.detail.back')}
                            </span>
                        </LTTButton>

                        {detailLoading || !selected ? (
                            <p className="text-gray-600">
                                {detailLoading ? t('customer.my_ltc.transaction_history.detail.loading_booking') : ''}
                            </p>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mb-4 border-b pb-4 text-gray-800">
                                    {t('customer.my_ltc.transaction_history.detail.title')}
                                </h2>

                                <div className="flex flex-col gap-4">
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.booking_id')}
                                        value={<span className="font-mono">{selected.id}</span>}
                                        first
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.paid_time')}
                                        value={
                                            displayPaidTime(selected)
                                                ? dayjs(displayPaidTime(selected)).format('DD/MM/YYYY HH:mm')
                                                : '—'
                                        }
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.movie')}
                                        value={
                                            venueLoading ? (
                                                <span className="text-gray-500">{t('customer.my_ltc.transaction_history.detail.loading_venue')}</span>
                                            ) : (
                                                movieTitle
                                            )
                                        }
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.cinema')}
                                        value={
                                            venueLoading ? (
                                                <span className="text-gray-500">{t('customer.my_ltc.transaction_history.detail.loading_venue')}</span>
                                            ) : (
                                                cinemaName
                                            )
                                        }
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.screen')}
                                        value={
                                            venueLoading ? (
                                                <span className="text-gray-500">{t('customer.my_ltc.transaction_history.detail.loading_venue')}</span>
                                            ) : (
                                                screenLabel
                                            )
                                        }
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.format')}
                                        value={
                                            venueLoading ? (
                                                <span className="text-gray-500">{t('customer.my_ltc.transaction_history.detail.loading_venue')}</span>
                                            ) : (
                                                formatLabel
                                            )
                                        }
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.showtime')}
                                        value={
                                            venueLoading ? (
                                                <span className="text-gray-500">{t('customer.my_ltc.transaction_history.detail.loading_venue')}</span>
                                            ) : (
                                                showtimeRange || '—'
                                            )
                                        }
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.showtime_id')}
                                        value={<span className="font-mono">{selected.showtimeId}</span>}
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.seats')}
                                        value={seatsDisplay(selected, detailSnap) || '—'}
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.payment_method')}
                                        value={selected.paymentMethod || '—'}
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.status')}
                                        value={displayStatus(selected)}
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.detail.amount')}
                                        value={<span className="font-bold">{formatVnd(displayAmountNumber(selected))}</span>}
                                    />
                                    {detailSnap && (
                                        <>
                                            <DetailRow
                                                label={t('customer.my_ltc.transaction_history.detail.ticket_extras_discount')}
                                                value={
                                                    <span className="text-sm">
                                                        {formatVnd(detailSnap.ticketTotal ?? 0)} /{' '}
                                                        {formatVnd(detailSnap.extrasTotal ?? 0)} /{' '}
                                                        {formatVnd(detailSnap.discount ?? 0)}
                                                    </span>
                                                }
                                            />
                                            {(detailSnap.fnb?.length ?? 0) > 0 && (
                                                <DetailRow
                                                    label={t('customer.my_ltc.transaction_history.detail.fnb_title')}
                                                    value={
                                                        <ul className="list-disc pl-5 text-sm">
                                                            {detailSnap.fnb!.map((x) => (
                                                                <li key={`${x.id}-${x.quantity}`}>
                                                                    {x.id} × {x.quantity}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    }
                                                />
                                            )}
                                            {(detailSnap.combos?.length ?? 0) > 0 && (
                                                <DetailRow
                                                    label={t('customer.my_ltc.transaction_history.detail.combos_title')}
                                                    value={
                                                        <ul className="list-disc pl-5 text-sm">
                                                            {detailSnap.combos!.map((x) => (
                                                                <li key={`${x.id}-${x.quantity}`}>
                                                                    {x.id} × {x.quantity}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    }
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </LTTCard>
        </div>
    );
}

function DetailRow({ label, value, first }: { label: string; value: React.ReactNode; first?: boolean }) {
    return (
        <div className={`flex flex-col md:flex-row py-3${first ? '' : ' border-t border-gray-100'}`}>
            <span className="w-full md:w-1/3 text-gray-500 font-medium text-sm mb-1">{label}</span>
            <span className="w-full md:w-2/3 text-gray-800">{value}</span>
        </div>
    );
}
