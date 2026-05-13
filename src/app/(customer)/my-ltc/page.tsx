'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import { customerMockData } from './_mock/data';
import { getCookie } from '@/src/@core/utils/cookie';
import { CUSTOMER_ACCESS_TOKEN_KEY } from '@/src/@core/const';
import { getUserInfoFromToken } from '@/src/@core/utils/jwt';
import { useLocalization } from '@/src/@core/hooks/use-localization';
import { customerProfileService } from '@/src/services/customer-service/profile/profile.service';
import { customerMemberCardService } from '@/src/services/customer-service/member-card/member-card.service';
import MembershipQrModal from '@/src/app/(customer)/my-ltc/_components/MembershipQrModal';
import { formatMemberCardNumber } from '@/src/app/(customer)/my-ltc/_lib/formatMemberCardNumber';

export default function DashboardPage() {
    const { t } = useLocalization();
    const { customer: mockCustomer } = customerMockData;
    const router = useRouter();
    const compactViewButtonClass = "bg-[#cc3434] text-white border-none rounded hover:bg-[#a52626] !h-8 !min-h-0 !px-4 !text-sm";

    const [displayName, setDisplayName] = useState(mockCustomer.fullName);
    const [profileQrUrl, setProfileQrUrl] = useState<string | null>(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [memberCardNumberRaw, setMemberCardNumberRaw] = useState<string | undefined>(undefined);

    useEffect(() => {
        const token = getCookie(CUSTOMER_ACCESS_TOKEN_KEY);
        if (token) {
            const userInfo = getUserInfoFromToken(token);
            if (userInfo?.fullName || userInfo?.userName) {
                setDisplayName(userInfo.fullName || userInfo.userName || "");
            }
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        customerProfileService
            .getProfileAsync()
            .then((profile) => {
                if (!isMounted) return;
                setProfileQrUrl(profile?.profileQRUrl || null);
                if (profile?.name) {
                    setDisplayName(profile.name);
                }
            })
            .catch(() => {
                if (!isMounted) return;
                setProfileQrUrl(null);
            });

        customerMemberCardService
            .getActiveAsync()
            .then((card) => {
                if (!isMounted) return;
                setMemberCardNumberRaw(card?.cardNumber);
            })
            .catch(() => {
                if (!isMounted) return;
                setMemberCardNumberRaw(undefined);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleCardClick = (path: string) => {
        router.push(path);
    };

    const cardNumberDisplay = formatMemberCardNumber(memberCardNumberRaw ?? mockCustomer.memberId?.replace(/\s/g, ''));

    return (
        <div className="flex flex-col gap-6 w-full animate-[fadeInUp_0.4s_ease-out_forwards]">
            <MembershipQrModal
                open={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                qrUrl={profileQrUrl}
                customerName={displayName}
                cardNumberDisplay={cardNumberDisplay}
            />

            <LTTCard className="p-6 shadow-sm border border-gray-100 rounded-xl relative">
                <h2 className="text-xl font-bold uppercase mb-6">{t('customer.my_ltc.dashboard.general_information')}</h2>

                <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex justify-center items-center overflow-hidden border border-gray-200">
                            <Image
                                src="/images/main/default_avatar.png"
                                alt="Default avatar"
                                width={96}
                                height={96}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col text-center md:text-left">
                            <h3 className="text-xl font-bold">{t('customer.my_ltc.dashboard.hello', { name: displayName })}</h3>
                            <p className="text-gray-500 mb-2">{t('customer.my_ltc.dashboard.manage_subtitle')}</p>
                            <LTTButton className="w-fit self-center md:self-start mt-2" onClick={() => router.push('/my-ltc/account-details')}>
                                {t('customer.my_ltc.dashboard.edit')}
                            </LTTButton>
                        </div>
                    </div>

                    <div
                        className="flex flex-col items-center p-4 border border-gray-100 rounded-lg bg-white shadow-sm mt-4 lg:mt-0 cursor-pointer"
                        onClick={() => handleCardClick('/my-ltc/membership-card')}
                        role="presentation"
                    >
                        <button
                            type="button"
                            className="mb-2 cursor-zoom-in border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cc3434] rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                setQrModalOpen(true);
                            }}
                            aria-label={t('customer.my_ltc.membership_card.open_qr')}
                        >
                            <div className="w-32 h-32 bg-gray-200 border pointer-events-none">
                                {profileQrUrl ? (
                                    <img
                                        src={profileQrUrl}
                                        alt=""
                                        className="w-full h-full object-contain bg-white"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full p-2 grid grid-cols-5 grid-rows-5 gap-1 bg-black">
                                        <div className="bg-white col-span-2 row-span-2"></div>
                                        <div className="bg-white col-span-1 row-span-1"></div>
                                        <div className="bg-white col-span-2 row-span-2 col-start-4"></div>
                                        <div className="bg-white col-span-1 row-span-3 col-start-3 row-start-2"></div>
                                        <div className="bg-white col-span-2 row-span-2 row-start-4"></div>
                                        <div className="bg-white col-span-2 row-span-2 col-start-4 row-start-4"></div>
                                    </div>
                                )}
                            </div>
                        </button>
                        <p className="text-xs text-center text-gray-500 tracking-wider font-mono">
                            {cardNumberDisplay}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                        <span className="text-sm text-gray-500 mb-1">{t('customer.my_ltc.dashboard.membership_tier')}</span>
                        <span className="font-bold text-lg mb-3">{mockCustomer.memberLevel}</span>
                        <LTTButton
                            className={compactViewButtonClass}
                            size="sm"
                            onClick={() => handleCardClick('/my-ltc/membership-card')}
                        >
                            {t('customer.my_ltc.dashboard.view')}
                        </LTTButton>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                        <span className="text-sm text-gray-500 mb-1">{t('customer.my_ltc.dashboard.total_spent')}</span>
                        <span className="font-bold text-lg mb-3">{mockCustomer.totalSpent}đ</span>
                        <LTTButton
                            className={compactViewButtonClass}
                            size="sm"
                            onClick={() => handleCardClick('/my-ltc/transaction-history')}
                        >
                            {t('customer.my_ltc.dashboard.view')}
                        </LTTButton>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                        <span className="text-sm text-gray-500 mb-1">{t('customer.my_ltc.dashboard.voucher')}</span>
                        <span className="font-bold text-lg mb-3">{mockCustomer.voucherCount}</span>
                        <LTTButton
                            className={compactViewButtonClass}
                            size="sm"
                            onClick={() => handleCardClick('/my-ltc/vouchers')}
                        >
                            {t('customer.my_ltc.dashboard.view')}
                        </LTTButton>
                    </div>
                </div>
            </LTTCard>
        </div>
    );
}
