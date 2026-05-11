'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTTable from '@/src/@core/component/AntD/LTTTable';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import { useLocalization } from '@/src/@core/hooks/use-localization';
import {
    customerPaymentService,
    PaymentOutputDto,
} from '@/src/services/customer-service/payment/payment.service';

interface TransactionRow {
    id: string;
    date: string;
    description: string;
    amount: string;
    type: string;
    raw: PaymentOutputDto;
}

const formatVnd = (amount: number) => `${Math.round(amount || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫`;

const displayDate = (item: PaymentOutputDto) =>
    item.paidTime ?? item.createdAt;

const displayStatus = (item: PaymentOutputDto) => item.paymentStatus ?? item.status ?? '-';

const buildDescription = (item: PaymentOutputDto, t: any) => {
    const parts: string[] = [];
    if (item.movieTitle) parts.push(item.movieTitle);
    if (item.cinemaName) parts.push(item.cinemaName);
    if (item.customerName) parts.push(item.customerName);
    if (parts.length) return parts.join(' • ');
    if (item.gatewayTransactionId) return `${t('customer.my_ltc.transaction_history.desc_transaction', 'Transaction')} ${item.gatewayTransactionId}`;
    if (item.bookingId) return `${t('customer.my_ltc.transaction_history.desc_booking', 'Booking')} ${item.bookingId}`;
    return `${t('customer.my_ltc.transaction_history.desc_payment', 'Payment')} ${item.id}`;
};

export default function TransactionHistoryPage() {
    const { t } = useLocalization();
    const [pagination, setPagination] = useState({ page: 1, fetch: 5 });
    const [items, setItems] = useState<PaymentOutputDto[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [detailPayment, setDetailPayment] = useState<PaymentOutputDto | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetchPage = async () => {
            setLoading(true);
            try {
                const result = await customerPaymentService.getMyPaymentsAsync({
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
    }, [pagination.page, pagination.fetch]);

    useEffect(() => {
        if (!detailId) {
            setDetailPayment(null);
            setDetailLoading(false);
            return;
        }
        let cancelled = false;
        setDetailPayment(null);
        setDetailLoading(true);
        void customerPaymentService
            .getMyPaymentByIdAsync(detailId)
            .then((p) => {
                if (!cancelled) setDetailPayment(p);
            })
            .catch((e) => {
                if (!cancelled) {
                    setDetailPayment(null);
                    toast.error(e instanceof Error ? e.message : t('customer.my_ltc.transaction_history.fetch_detail_failed', 'Failed to load payment details'));
                    setDetailId(null);
                }
            })
            .finally(() => {
                if (!cancelled) setDetailLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [detailId]);

    const dataSource = useMemo<TransactionRow[]>(() => {
        return items.map((item) => ({
            id: item.id,
            date: displayDate(item) ? dayjs(displayDate(item)).format('DD/MM/YYYY HH:mm') : '-',
            description: buildDescription(item, t),
            amount: formatVnd(item.amount),
            type: item.paymentMethod || '-',
            raw: item,
        }));
    }, [items, t]);

    const columns = [
        {
            title: t('customer.my_ltc.transaction_history.booking_id', 'Booking ID'),
            dataIndex: 'bookingId',
            key: 'bookingId',
            width: '24%',
            render: (_: string, row: TransactionRow) => (
                <span className="font-mono text-xs break-all break-words whitespace-normal">{row.raw.bookingId ?? row.raw.id}</span>
            ),
        },
        { title: t('customer.my_ltc.transaction_history.date', 'Date'), dataIndex: 'date', key: 'date', width: '20%' },
        { title: t('customer.my_ltc.transaction_history.description', 'Description'), dataIndex: 'description', key: 'description', width: '36%', render: (text: string) => <span className="break-words whitespace-normal">{text}</span> },
        { title: t('customer.my_ltc.transaction_history.amount', 'Amount'), dataIndex: 'amount', key: 'amount', width: '20%', render: (text: string) => <span className="font-bold text-gray-800">{text}</span> },
    ];

    const handleRowClick = (record: TransactionRow) => {
        setDetailId(record.raw.id);
    };

    const selected = detailPayment;

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
                                className="border border-gray-100 rounded-lg shadow-sm cursor-pointer min-w-[700px]"
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
                            className="w-fit text-[#cc3434] bg-white hover:bg-gray-50 !pl-0 border-none transition-colors"
                            onClick={() => setDetailId(null)}
                        >
                            <span className="flex items-center text-base">
                                <span className="mx-3 text-xl font-bold">←</span> {t('customer.my_ltc.transaction_history.back_button', 'Back to Transaction History')}
                            </span>
                        </LTTButton>

                        {detailLoading || !selected ? (
                            <p className="text-gray-600">{detailLoading ? t('customer.my_ltc.transaction_history.loading', 'Loading...') : ''}</p>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mb-4 border-b pb-4 text-gray-800">{t('customer.my_ltc.transaction_history.details_title', 'Transaction Details')}</h2>

                                <div className="flex flex-col gap-4">
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.booking_id', 'Booking ID')}
                                        value={<span className="font-mono">{selected.bookingId ?? selected.id}</span>}
                                        first
                                    />
                                    <DetailRow
                                        label={t('customer.my_ltc.transaction_history.date', 'Date')}
                                        value={
                                            displayDate(selected)
                                                ? dayjs(displayDate(selected)).format('DD/MM/YYYY HH:mm')
                                                : '-'
                                        }
                                    />
                                    <DetailRow label={t('customer.my_ltc.transaction_history.movie', 'Movie')} value={selected.movieTitle || '-'} />
                                    <DetailRow label={t('customer.my_ltc.transaction_history.cinema', 'Cinema')} value={selected.cinemaName || '-'} />
                                    <DetailRow label={t('customer.my_ltc.transaction_history.customer', 'Customer')} value={selected.customerName || '-'} />
                                    <DetailRow label={t('customer.my_ltc.transaction_history.payment_method', 'Payment method')} value={selected.paymentMethod || '-'} />
                                    <DetailRow label={t('customer.my_ltc.transaction_history.status', 'Status')} value={displayStatus(selected)} />
                                    <DetailRow label={t('customer.my_ltc.transaction_history.amount', 'Amount')} value={<span className="font-bold">{formatVnd(selected.amount)}</span>} />
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
