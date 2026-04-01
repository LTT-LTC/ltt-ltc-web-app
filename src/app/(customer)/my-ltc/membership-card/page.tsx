'use client';

import React, { useMemo, useState } from 'react';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import LTTModal from '@/src/@core/component/AntD/LTTModal';
import LTTTable from '@/src/@core/component/AntD/LTTTable';
import { customerMockData } from '../_mock/data';

export default function MembershipCardPage() {
    const { customer, pointHistory, tierBenefits, membershipNotes } = customerMockData;
    const [openTierInfo, setOpenTierInfo] = useState(false);
    const [pointPagination, setPointPagination] = useState({ page: 1, fetch: 3 });

    const pagedPointHistory = useMemo(() => {
        const start = (pointPagination.page - 1) * pointPagination.fetch;
        return pointHistory.slice(start, start + pointPagination.fetch);
    }, [pointHistory, pointPagination]);

    const pointHistoryColumns = [
        {
            title: 'Transaction ID',
            dataIndex: 'id',
            key: 'id',
            width: '20%'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: '30%'
        },
        {
            title: 'Points',
            dataIndex: 'points',
            key: 'points',
            width: '20%',
            render: (text: string) => (
                <span className={`font-bold ${text.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                    {text}
                </span>
            )
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: '30%',
            render: (text: string, record: { time: string }) => (
                <span className="text-gray-500">
                    {text} {record.time}
                </span>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-6 animate-fade-in-up w-full">
            {/* Digital Card Design */}
            <div className="relative w-full max-w-lg mx-auto">
                <button
                    type="button"
                    onClick={() => setOpenTierInfo(true)}
                    className="absolute -top-3 -right-3 z-20 h-10 w-10 rounded-full border-2 border-[#cc3434] bg-white text-[#cc3434] font-bold shadow-md transition-all duration-300 hover:bg-[#cc3434] hover:text-white hover:scale-105"
                    aria-label="View membership tier info"
                >
                    i
                </button>

                <div className="relative bg-gradient-to-br from-[#e03a3a] to-[#8f1919] rounded-2xl p-6 shadow-xl text-white aspect-[1.58] flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-5 rounded-full -ml-24 -mb-24"></div>

                    <div className="flex justify-between items-start z-10 w-full mb-6">
                        <div>
                            <h3 className="text-xs tracking-widest opacity-80 uppercase mb-1">LTC CINEMA</h3>
                            <h2 className="text-3xl font-black uppercase tracking-wider">{customer.memberLevel}</h2>
                        </div>
                        <div className="bg-white p-2 rounded-xl">
                            <div className="w-16 h-16 grid grid-cols-5 grid-rows-5 gap-[2px] bg-black p-1">
                                <div className="bg-white col-span-2 row-span-2"></div>
                                <div className="bg-white col-span-1 row-span-1"></div>
                                <div className="bg-white col-span-2 row-span-2 col-start-4"></div>
                                <div className="bg-white col-span-1 row-span-3 col-start-3 row-start-2"></div>
                                <div className="bg-[white] col-span-2 row-span-2 row-start-4"></div>
                                <div className="bg-[white] col-span-2 row-span-2 col-start-4 row-start-4"></div>
                            </div>
                        </div>
                    </div>

                    <div className="z-10 mt-auto">
                        <div className="font-mono text-xl md:text-2xl tracking-widest mb-6 opacity-95">
                            {customer.memberId}
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] uppercase opacity-70 mb-1">CARD HOLDER</p>
                                <p className="font-semibold text-lg">{customer.fullName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase opacity-70 mb-1">VALID THRU</p>
                                <p className="font-semibold">{customer.validThru}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white mt-4">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Current Points</p>
                        <p className="text-3xl font-bold text-[#cc3434]">{customer.currentPoints} P</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Total Spent Points</p>
                        <p className="text-3xl font-bold text-gray-800">{customer.totalSpent} P</p>
                    </div>
                </div>
            </LTTCard>

            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Card Management</h2>

                <div className="flex flex-wrap gap-4">
                    <LTTButton className="text-gray-700 bg-white hover:bg-gray-50 hover:text-black border-gray-300 px-6 font-medium">
                        Request new card
                    </LTTButton>
                    <LTTButton className="text-gray-700 bg-white hover:bg-gray-50 hover:text-black border-gray-300 px-6 font-medium">
                        Update information
                    </LTTButton>
                    <LTTButton className="text-[#cc3434] bg-white border-[#cc3434] hover:bg-[#cc3434] hover:text-white px-6 font-medium ml-0 md:ml-auto">
                        Delete card
                    </LTTButton>
                </div>
            </LTTCard>

            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Point History</h2>
                <LTTTable
                    columns={pointHistoryColumns}
                    dataSource={pagedPointHistory}
                    rowKey="id"
                    className="border border-gray-100 rounded-lg"
                    pagination={{
                        totalCount: pointHistory.length,
                        page: pointPagination.page,
                        fetch: pointPagination.fetch,
                        onChange: (page: number, fetch: number) => {
                            setPointPagination({ page, fetch });
                        },
                    }}
                />
            </LTTCard>

            <LTTModal
                open={openTierInfo}
                onCancel={() => setOpenTierInfo(false)}
                footer={null}
                width={720}
                destroyOnHidden
                title={null}
                className="[&_.ant-modal-content]:!p-0 [&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:!rounded-2xl"
            >
                <div className="bg-gradient-to-r from-[#cc3434] via-[#b92020] to-[#8f1919] px-6 py-5 text-white">
                    <h3 className="text-2xl font-bold">Membership Tier Information</h3>
                    <p className="mt-1 text-sm text-white/85">Member benefits and upgrade conditions.</p>
                    <div className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                        Current tier: {customer.memberLevel}
                    </div>
                </div>

                <div className="p-6">
                    <div className="overflow-hidden rounded-xl border border-[#f0caca]">
                        <div className="grid grid-cols-4 bg-[#cc3434] px-4 py-3 text-sm font-semibold text-white">
                            <span>Tier</span>
                            <span className="text-center">Min points</span>
                            <span className="text-center">Discount</span>
                            <span className="text-center">Multiplier</span>
                        </div>

                        {tierBenefits.map((tier, index) => {
                            const isCurrentTier = tier.tier === customer.memberLevel;
                            return (
                                <div
                                    key={tier.tier}
                                    className={`grid grid-cols-4 items-center px-4 py-3 text-sm border-t border-[#f3dede] ${index % 2 === 0 ? 'bg-[#fff9f9]' : 'bg-white'
                                        } ${isCurrentTier ? 'bg-[#ffeaea]' : ''}`}
                                >
                                    <span className={`font-semibold ${isCurrentTier ? 'text-[#a51818]' : 'text-gray-800'}`}>
                                        {tier.tier}
                                    </span>
                                    <span className="text-center text-gray-700">{tier.minPoints.toLocaleString('vi-VN')}</span>
                                    <span className="text-center text-gray-700">{tier.discount}</span>
                                    <span className="text-center text-gray-700">{tier.multiplier}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 rounded-xl border border-[#f1d0d0] bg-[#fff5f5] p-4">
                        <h4 className="mb-2 text-sm font-semibold text-[#a51818]">Point accumulation notes</h4>
                        <div className="space-y-1 text-sm text-gray-700">
                            {membershipNotes.map((note) => (
                                <p key={note}>{note}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </LTTModal>
        </div>
    );
}


