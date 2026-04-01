'use client';

import React from 'react';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import { customerMockData } from '../_mock/data';

export default function AccountDetailsPage() {
    const { customer } = customerMockData;

    const rows = [
        { label: 'Full Name', value: customer.fullName },
        { label: 'Phone', value: customer.phone },
        { label: 'City/Province', value: customer.city },
        { label: 'District', value: customer.district },
        { label: 'Detailed Address', value: customer.address },
        { label: 'Gender', value: customer.gender },
        { label: 'Date of Birth', value: customer.dob },
        { label: 'Email', value: customer.email },
        { label: 'Membership ID', value: customer.memberId },
    ];

    return (
        <div className="w-full animate-fade-in-up">
            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Account Information</h2>
                    <button className="text-[#cc3434] hover:text-[#a52626] font-medium flex items-center gap-2">
                        Thay đổi
                    </button>
                </div>

                <div className="flex flex-col gap-0 border-t border-gray-100">
                    {rows.map((row, index) => (
                        <div
                            key={index}
                            className={`flex flex-col md:flex-row py-4 border-b border-gray-100 transition duration-200 hover:bg-gray-50 px-2`}
                        >
                            <div className="w-full md:w-1/3 mb-1 justify-center md:mb-0 text-gray-600 font-medium">
                                {row.label}
                            </div>
                            <div className="w-full md:w-2/3 text-gray-800">
                                {row.value}
                            </div>
                        </div>
                    ))}
                </div>
            </LTTCard>
        </div>
    );
}

