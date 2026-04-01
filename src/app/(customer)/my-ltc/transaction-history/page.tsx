'use client';

import React, { useMemo, useState } from 'react';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTTable from '@/src/@core/component/AntD/LTTTable';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import { customerMockData } from '../_mock/data';

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: string;
    type: string;
    time: string;
    points: string;
}

export default function TransactionHistoryPage() {
    const { transactions } = customerMockData;
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
    const [transactionPagination, setTransactionPagination] = useState({ page: 1, fetch: 3 });

    const pagedTransactions = useMemo(() => {
        const start = (transactionPagination.page - 1) * transactionPagination.fetch;
        return transactions.slice(start, start + transactionPagination.fetch);
    }, [transactions, transactionPagination]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '20%',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: '20%',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: '40%',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: '20%',
            render: (text: string) => <span className="font-bold text-gray-800">{text}</span>,
        },
    ];

    const handleRowClick = (record: Transaction) => {
        setSelectedTxn(record);
    };

    return (
        <div className="w-full animate-fade-in-up">
            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
                {!selectedTxn ? (
                    <>
                        <h2 className="text-2xl font-bold mb-8 border-b pb-4 text-gray-800">Transaction History</h2>
                        <LTTTable
                            columns={columns}
                            dataSource={pagedTransactions}
                            rowKey="id"
                            className="border border-gray-100 rounded-lg shadow-sm cursor-pointer"
                            onRow={(record) => ({
                                onClick: () => handleRowClick(record as Transaction),
                            })}
                            rowClassName="hover:bg-gray-50 transition-colors"
                            pagination={{
                                totalCount: transactions.length,
                                page: transactionPagination.page,
                                fetch: transactionPagination.fetch,
                                onChange: (page: number, fetch: number) => {
                                    setTransactionPagination({ page, fetch });
                                },
                            }}
                        />
                    </>
                ) : (
                    <div className="flex flex-col gap-6 animate-fade-in-up">
                        <LTTButton
                            variant="outline"
                            className="w-fit text-[#cc3434] bg-white hover:bg-gray-50 !pl-0 border-none transition-colors"
                            onClick={() => setSelectedTxn(null)}
                        >
                            <span className="flex items-center text-base">
                                <span className="mr-2 text-xl font-bold">←</span> Quay lại Transaction History
                            </span>
                        </LTTButton>

                        <h2 className="text-2xl font-bold mb-4 border-b pb-4 text-gray-800">Transaction Details</h2>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row py-3">
                                <span className="w-full md:w-1/3 text-gray-500 font-medium font-sm mb-1">Transaction ID</span>
                                <span className="w-full md:w-2/3 text-gray-800 font-medium">{selectedTxn.id}</span>
                            </div>
                            <div className="flex flex-col md:flex-row py-3 border-t border-gray-100">
                                <span className="w-full md:w-1/3 text-gray-500 font-medium font-sm mb-1">Date</span>
                                <span className="w-full md:w-2/3 text-gray-800">{selectedTxn.date}</span>
                            </div>
                            <div className="flex flex-col md:flex-row py-3 border-t border-gray-100">
                                <span className="w-full md:w-1/3 text-gray-500 font-medium font-sm mb-1">Description</span>
                                <span className="w-full md:w-2/3 text-gray-800">{selectedTxn.description}</span>
                            </div>
                            <div className="flex flex-col md:flex-row py-3 border-t border-gray-100">
                                <span className="w-full md:w-1/3 text-gray-500 font-medium font-sm mb-1">Amount</span>
                                <span className="w-full md:w-2/3 text-gray-800 font-bold">{selectedTxn.amount}</span>
                            </div>
                            <div className="flex flex-col md:flex-row py-3 border-t border-gray-100">
                                <span className="w-full md:w-1/3 text-gray-500 font-medium font-sm mb-1">Type</span>
                                <span className="w-full md:w-2/3 text-gray-800">{selectedTxn.type}</span>
                            </div>
                            {selectedTxn.points && (
                                <div className="flex flex-col md:flex-row py-3 border-t border-gray-100">
                                    <span className="w-full md:w-1/3 text-gray-500 font-medium font-sm mb-1">Accumulated points</span>
                                    <span className={`w-full md:w-2/3 font-bold ${selectedTxn.points.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                                        {selectedTxn.points}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </LTTCard>
        </div>
    );
}

