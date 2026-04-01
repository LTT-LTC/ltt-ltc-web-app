'use client';

import React, { useMemo, useState } from 'react';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTTable from '@/src/@core/component/AntD/LTTTable';
import { customerMockData } from '../_mock/data';

export default function PointsPage() {
    const { transactions, customer } = customerMockData;
    const [pointPagination, setPointPagination] = useState({ page: 1, fetch: 3 });

    const pagedTransactions = useMemo(() => {
        const start = (pointPagination.page - 1) * pointPagination.fetch;
        return transactions.slice(start, start + pointPagination.fetch);
    }, [transactions, pointPagination]);

    const columns = [
        {
            title: 'Transaction ID',
            dataIndex: 'id',
            key: 'id',
            width: '15%',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: '35%',
        },
        {
            title: 'Points',
            dataIndex: 'points',
            key: 'points',
            width: '20%',
            render: (text: string) => {
                const isPositive = text.startsWith('+');
                return (
                    <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {text} P
                    </span>
                );
            },
        },
        {
            title: 'Time',
            dataIndex: 'date',
            key: 'date',
            width: '30%',
            render: (text: string, record: any) => (
                <span className="text-gray-500">
                    {text} {record.time}
                </span>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6 animate-fade-in-up w-full">
            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Reward Points</h2>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-16 mb-8 border-b pb-8 border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Current points</p>
                        <p className="text-4xl font-bold text-[#cc3434]">{customer.currentPoints}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Total points used</p>
                        <p className="text-4xl font-bold text-gray-800">{customer.totalSpent}</p>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-4 text-gray-800">Point transaction history</h3>
                <LTTTable
                    columns={columns}
                    dataSource={pagedTransactions}
                    rowKey="id"
                    className="border border-gray-100 rounded-lg shadow-sm"
                    pagination={{
                        totalCount: transactions.length,
                        page: pointPagination.page,
                        fetch: pointPagination.fetch,
                        onChange: (page: number, fetch: number) => {
                            setPointPagination({ page, fetch });
                        },
                    }}
                />
            </LTTCard>
        </div>
    );
}

