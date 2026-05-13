'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTTable from '@/src/@core/component/AntD/LTTTable';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import { useLocalization } from '@/src/@core/hooks/use-localization';
import { customerBookingService, type BookingOutputDto } from '@/src/services/customer-service/booking/booking.service';
import {
    customerShowtimeService,
    type CustomerShowtimeOutputDto,
} from '@/src/services/customer-service/showtime/showtime.service';
import {
    customerCinemaService,
    type CustomerCinemaOutputDto,
} from '@/src/services/customer-service/cinema/cinema.service';

interface TransactionRow {
    id: string;
    date: string;
    description: string;
    amount: string;
    type: string;
    raw: BookingOutputDto;
}

const formatVnd = (amount: number | undefined) => `${Math.round(amount || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫`;

const displayDate = (item: BookingOutputDto) => item.createdAt;

const displayStatus = (item: BookingOutputDto) => item.paymentStatus ?? item.bookingStatus ?? '-';

const buildDescription = (item: BookingOutputDto, t: any) => {
    const seatCount = (item.seatCodes || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean).length;

    if (seatCount > 0) {
        return `${t('customer.my_ltc.transaction_history.desc_booking', 'Booking')} • ${seatCount} ${t('customer.my_ltc.transaction_history.seats', 'seats')}`;
    }

    return `${t('customer.my_ltc.transaction_history.desc_booking', 'Booking')} ${item.id}`;
};

interface SnapshotFnbLine { name?: string; quantity?: number; unitPrice?: number; lineTotal?: number; }
interface BookingSnapshotForDetail {
    fnbLines?: SnapshotFnbLine[];
    comboLines?: SnapshotFnbLine[];
    ticketTotal?: number;
    extrasTotal?: number;
    grandTotal?: number;
    discount?: number;
}
const parseSnapshotForDetail = (json?: string | null): BookingSnapshotForDetail => {
    if (!json) return {};
    try { return JSON.parse(json) as BookingSnapshotForDetail; } catch { return {}; }
};

export default function TransactionHistoryPage() {
    const { t } = useLocalization();
    const [pagination, setPagination] = useState({ page: 1, fetch: 5 });
    const [items, setItems] = useState<BookingOutputDto[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [detailBooking, setDetailBooking] = useState<BookingOutputDto | null>(null);
    const [detailShowtime, setDetailShowtime] = useState<CustomerShowtimeOutputDto | null>(null);
    const [detailCinema, setDetailCinema] = useState<CustomerCinemaOutputDto | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetchPage = async () => {
            setLoading(true);
            try {
                const result = await customerBookingService.getBookingListAsync({
                    page: pagination.page,
                    fetch: pagination.fetch,
                });
                if (cancelled) return;

                setItems(result.items || []);
                setTotalCount(result.totalCount || 0);
            } catch (e) {
                if (!cancelled) {
                    setItems([]);
                    setTotalCount(0);
                    toast.error(e instanceof Error ? e.message : t('customer.my_ltc.transaction_history.fetch_failed', 'Failed to load transactions'));
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
            setDetailShowtime(null);
            setDetailCinema(null);
            setDetailLoading(false);
            return;
        }
        let cancelled = false;
        setDetailBooking(null);
        setDetailShowtime(null);
        setDetailCinema(null);
        setDetailLoading(true);
        void (async () => {
            try {
                const booking = await customerBookingService.getBookingAsync(detailId);
                if (cancelled) return;
                setDetailBooking(booking);

                if (!booking.showtimeId) return;

                const showtime = await customerShowtimeService.getShowtimeByIdAsync(booking.showtimeId).catch(() => null);
                if (cancelled) return;
                setDetailShowtime(showtime);

                if (!showtime?.cinemaId) return;

                const cinema = await customerCinemaService.getCinemaByIdAsync(showtime.cinemaId).catch(() => null);
                if (!cancelled) setDetailCinema(cinema);
            } catch (e) {
                if (!cancelled) {
                    setDetailBooking(null);
                    toast.error(e instanceof Error ? e.message : t('customer.my_ltc.transaction_history.fetch_detail_failed', 'Failed to load booking details'));
                    setDetailId(null);
                }
            } finally {
                if (!cancelled) setDetailLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [detailId, t]);

    const dataSource = useMemo<TransactionRow[]>(() => {
        return items.map((item) => ({
            id: item.id,
            date: displayDate(item) ? dayjs(displayDate(item)).format('DD/MM/YYYY HH:mm') : '-',
            description: buildDescription(item, t),
            amount: formatVnd(item.paidAmount || item.totalPrice),
            type: item.paymentMethod || '-',
            raw: item,
        }));
    }, [items, t]);

    const columns = [
        {
            title: t('customer.my_ltc.transaction_history.booking_id'),
            dataIndex: 'bookingId',
            key: 'bookingId',
            width: '24%',
            render: (_: string, row: TransactionRow) => (
                <span className="font-mono text-xs break-all wrap-break-word whitespace-normal">{row.raw.id}</span>
            ),
        },
        { title: t('customer.my_ltc.transaction_history.date'), dataIndex: 'date', key: 'date', width: '20%' },
        { title: t('customer.my_ltc.transaction_history.description'), dataIndex: 'description', key: 'description', width: '36%', render: (text: string) => <span className="wrap-break-word whitespace-normal">{text}</span> },
        { title: t('customer.my_ltc.transaction_history.amount'), dataIndex: 'amount', key: 'amount', width: '20%', render: (text: string) => <span className="font-bold text-gray-800">{text}</span> },
    ];

    const handleRowClick = (record: TransactionRow) => {
        setDetailId(record.raw.id);
    };

    const booking = detailBooking;
    const showtime = detailShowtime;
    const cinema = detailCinema;
    const snapshot = parseSnapshotForDetail(booking?.snapshotJson);
    const seatCodes = (booking?.seatCodes || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const snackLines = [...(snapshot.fnbLines ?? []), ...(snapshot.comboLines ?? [])];
    const bookingCreatedAt = booking?.createdAt;
    const paidAt = booking?.paymentStatus === 'PAID' ? booking?.updatedAt : undefined;
    const paymentMethod = booking?.paymentMethod;
    const paymentStatus = booking ? displayStatus(booking) : '-';
    const discountAmount = booking?.discountAmount ?? snapshot.discount ?? 0;
    const totalAmount = booking?.totalPrice ?? 0;
    const amountPaid = booking?.paidAmount ?? booking?.totalPrice ?? 0;
    const bookingHeaderMovie = showtime?.movie?.title || '-';
    const bookingHeaderCinema = cinema?.name || '-';
    const bookingRoom = showtime?.screenName || '-';
    const bookingShowtimeLabel = showtime ? `${dayjs(showtime.startTime).format('DD/MM/YYYY HH:mm')} - ${dayjs(showtime.endTime).format('HH:mm')}` : '-';

    return (
        <div className="w-full animate-fade-in-up">
            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
                {!detailId ? (
                    <>
                        <h2 className="text-2xl font-bold mb-8 border-b pb-4 text-gray-800">{t('customer.my_ltc.transaction_history.title', 'Transaction History')}</h2>
                        <div className="overflow-x-auto">
                            <LTTTable
                                columns={columns}
                                dataSource={dataSource}
                                rowKey="id"
                                loading={loading}
                                className="border border-gray-100 rounded-lg shadow-sm cursor-pointer min-w-175"
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
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-6 animate-fade-in-up">
                        <LTTButton
                            variant="outline"
                            className="w-fit text-primary bg-white hover:bg-gray-50 pl-0! border-none transition-colors"
                            onClick={() => setDetailId(null)}
                        >
                            <span className="flex items-center text-base">
                                <span className="mx-3 text-xl font-bold">←</span> {t('customer.my_ltc.transaction_history.back_button', 'Back to Transaction History')}
                            </span>
                        </LTTButton>

                        {detailLoading || !booking ? (
                            <p className="text-gray-600">{detailLoading ? t('customer.my_ltc.transaction_history.loading', 'Loading...') : ''}</p>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mb-4 border-b pb-4 text-gray-800">{t('customer.my_ltc.transaction_history.details_title', 'Transaction Details')}</h2>

                                <div className="flex flex-col gap-4">
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.booking_id', 'Booking ID')}
                                        value={<span className="font-mono">{booking.id}</span>}
                                        first
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.movie', 'Movie')}
                                        value={bookingHeaderMovie}
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.cinema', 'Cinema')}
                                        value={bookingHeaderCinema}
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.room', 'Room')}
                                        value={bookingRoom}
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.showtime', 'Showtime')}
                                        value={bookingShowtimeLabel}
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.booking_date', 'Booking date')}
                                        value={
                                            bookingCreatedAt
                                                ? dayjs(bookingCreatedAt).format('DD/MM/YYYY HH:mm')
                                                : '-'
                                        }
                                    />
                                    <DetailRow label={t('customer.my_ltc.transaction_history.customer', 'Customer')} value="-" />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.seats', 'Seats')}
                                        value={seatCodes.join(', ') || '-'}
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.paid_date', 'Paid date')}
                                        value={paidAt ? dayjs(paidAt).format('DD/MM/YYYY HH:mm') : '-'}
                                    />
                                    <DetailRow label={t('customer.my_ltc.transaction_history.payment_method', 'Payment method')} value={paymentMethod || '-'} />
                                    <DetailRow label={t('customer.my_ltc.transaction_history.status', 'Status')} value={paymentStatus || '-'} />
                                    {snackLines.length > 0 && (
                                        <DetailRow
                                            label={t('customer.my_ltc.transaction_history.snacks', 'Snacks & Combos')}
                                            value={
                                                <ul className="list-none space-y-0.5">
                                                    {snackLines.map((line, i) => (
                                                        <li key={i} className="text-sm">
                                                            {line.name || '-'} × {line.quantity ?? 1}{line.lineTotal != null ? ` — ${formatVnd(line.lineTotal)}` : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            }
                                        />
                                    )}
                                    {discountAmount > 0 && (
                                        <DetailRow
                                            label={t('customer.my_ltc.transaction_history.discount', 'Discount')}
                                            value={<span className="text-emerald-600">-{formatVnd(discountAmount)}</span>}
                                        />
                                    )}
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.total', 'Total')}
                                        value={<span className="font-bold">{formatVnd(totalAmount)}</span>}
                                    />
                                    <DetailRow label={t('customer.my_ltc.transaction_history.amount', 'Amount paid')} value={<span className="font-bold">{formatVnd(amountPaid)}</span>} />
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
