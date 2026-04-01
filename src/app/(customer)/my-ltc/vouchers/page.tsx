'use client';

import React from 'react';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import { customerMockData } from '../_mock/data';

export default function VouchersPage() {
    const { vouchers } = customerMockData;

    return (
        <div className="w-full animate-fade-in-up">
            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
                <h2 className="text-2xl font-bold mb-8 border-b pb-4 text-gray-800">Voucher & Giftcode</h2>

                <div className="flex flex-col gap-4">
                    {vouchers.map((voucher, index) => {
                        const isUsable = voucher.status === 'Có thể dùng';
                        return (
                            <div
                                key={index}
                                className={`relative flex items-center justify-between p-4 md:p-6 border rounded-xl overflow-hidden transition-all hover:shadow-md ${isUsable
                                        ? 'border-[#cc3434] bg-red-50'
                                        : 'border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex flex-col z-10 w-3/4">
                                    <h3 className={`font-bold text-lg mb-1 ${isUsable ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {voucher.code}
                                    </h3>
                                    <p className={`text-sm mb-2 ${isUsable ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {voucher.description}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        EXP: {voucher.expiry}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end z-10 w-1/4">
                                    <span className={`text-2xl md:text-3xl font-bold mb-2 ${isUsable ? 'text-[#cc3434]' : 'text-gray-400'}`}>
                                        {voucher.discount}
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isUsable ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {voucher.status}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </LTTCard>
        </div>
    );
}

