'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTTable from '@/src/@core/component/AntD/LTTTable';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import { bookingService, PaymentOutputDto } from '@/src/services/administration-service/booking/booking.service';

interface TransactionRow {
    id: string;
    date: string;
    description: string;
    amount: string;
    type: string;
    raw: PaymentOutputDto;
}

const formatVnd = (amount: number) => `${Math.round(amount || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫`;

const buildDescription = (item: PaymentOutputDto) => {
    const parts: string[] = [];
    if (item.movieTitle) parts.push(item.movieTitle);
    if (item.cinemaName) parts.push(item.cinemaName);
    if (item.customerName) parts.push(item.customerName);
    return parts.join(' • ') || `Booking ${item.id}`;
};

export default function TransactionHistoryPage() {
    const [pagination, setPagination] = useState({ page: 1, fetch: 5 });
    const [items, setItems] = useState<PaymentOutputDto[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [selected, setSelected] = useState<PaymentOutputDto | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchPage = async () => {
            setLoading(true);
            try {
                const result = await bookingService.getBookingListAsync({ page: pagination.page, pageSize: pagination.fetch });
                if (cancelled) return;
                setItems(result.items || []);
                setTotalCount(result.totalCount || 0);
            } catch (e) {
                if (!cancelled) {
                    setItems([]);
                    setTotalCount(0);
                    toast.error(e instanceof Error ? e.message : 'Failed to load transactions');
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

    const dataSource = useMemo<TransactionRow[]>(() => {
        return items.map((item) => ({
            id: item.id,
            date: item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm') : '-',
            description: buildDescription(item),
            amount: formatVnd(item.amount),
            type: item.paymentMethod || '-',
            raw: item,
        }));
    }, [items]);

    const columns = [
        { title: 'Booking ID', dataIndex: 'id', key: 'id', width: '24%', render: (text: string) => <span className="font-mono text-xs">{text}</span> },
        { title: 'Date', dataIndex: 'date', key: 'date', width: '20%' },
        { title: 'Description', dataIndex: 'description', key: 'description', width: '36%' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', width: '20%', render: (text: string) => <span className="font-bold text-gray-800">{text}</span> },
    ];

    const handleRowClick = (record: TransactionRow) => {
        setSelected(record.raw);
    };

    return (
        <div className="w-full animate-fade-in-up">
            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
                {!selected ? (
                    <>
                        <h2 className="text-2xl font-bold mb-8 border-b pb-4 text-gray-800">Transaction History</h2>
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
                            onClick={() => setSelected(null)}
                        >
                            <span className="flex items-center text-base">
                                <span className="mr-2 text-xl font-bold">←</span> Quay lại Transaction History
                            </span>
                        </LTTButton>

                        <h2 className="text-2xl font-bold mb-4 border-b pb-4 text-gray-800">Transaction Details</h2>

                        <div className="flex flex-col gap-4">
                            <DetailRow label="Booking ID" value={<span className="font-mono">{selected.id}</span>} first />
                            <DetailRow label="Date" value={selected.createdAt ? dayjs(selected.createdAt).format('DD/MM/YYYY HH:mm') : '-'} />
                            <DetailRow label="Movie" value={selected.movieTitle || '-'} />
                            <DetailRow label="Cinema" value={selected.cinemaName || '-'} />
                            <DetailRow label="Customer" value={selected.customerName || '-'} />
                            <DetailRow label="Payment method" value={selected.paymentMethod || '-'} />
                            <DetailRow label="Status" value={selected.status || '-'} />
                            <DetailRow label="Amount" value={<span className="font-bold">{formatVnd(selected.amount)}</span>} />
                        </div>
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
