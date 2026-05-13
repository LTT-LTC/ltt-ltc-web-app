'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import LTTModal from '@/src/@core/component/AntD/LTTModal';
import LTTTable from '@/src/@core/component/AntD/LTTTable';
import useLTTMutation from '@/src/@core/hooks/useLTTMutation';
import { toast } from 'sonner';
import { customerMemberCardService } from '@/src/services/customer-service/member-card/member-card.service';
import { MemberCardOutputDto, PointTransactionOutputDto } from '@/src/services/customer-service/member-card/models/output.model';
import { PagedResultDto } from '@/src/@core/http/models/PagedResultDto';
import { customerProfileService } from '@/src/services/customer-service/profile/profile.service';
import { CustomerProfileOutputDto } from '@/src/services/customer-service/profile/models/output.model';
import { customerMemberTierService } from '@/src/services/customer-service/member-tier/member-tier.service';
import { MemberTierOutputDto } from '@/src/services/administration-service/member-tier/models/output.model';
import { useLocalization } from '@/src/@core/hooks/use-localization';
import MembershipQrModal from '@/src/app/(customer)/my-ltc/_components/MembershipQrModal';
import { formatMemberCardNumber } from '@/src/app/(customer)/my-ltc/_lib/formatMemberCardNumber';

const MEMBER_TIER_CACHE_KEY = "customer_member_tier_cache_v1";

const membershipNotes = [
    'Mỗi 1,000đ chi tiêu tương ứng 1 điểm cơ bản.',
    'Điểm cộng thêm được áp dụng theo hệ số nhân điểm của từng hạng.',
    'Hệ thống xét hạng định kỳ dựa trên tổng điểm tích lũy.'
];

const vietnameseSafeFontFamily =
    '"Inter", "Be Vietnam Pro", "Noto Sans", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif';
const QR_LOADING_GIF =
    "data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMbGxgAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUm2qv2Kx7AQA7";

export default function MembershipCardPage() {
    const { t } = useLocalization();
    const [openQrModal, setOpenQrModal] = useState(false);
    const [openTierInfo, setOpenTierInfo] = useState(false);
    const [pointPagination, setPointPagination] = useState({ page: 1, fetch: 5, totalCount: 0 });
    const [memberCard, setMemberCard] = useState<MemberCardOutputDto | null>(null);
    const [pointHistory, setPointHistory] = useState<PointTransactionOutputDto[]>([]);
    const [memberTiers, setMemberTiers] = useState<MemberTierOutputDto[]>([]);
    const [fullName, setFullName] = useState<string>("Member");
    const [profileQrUrl, setProfileQrUrl] = useState<string | null>(null);
    const [isQrLoading, setIsQrLoading] = useState(false);
    const [isTierLoading, setIsTierLoading] = useState(false);

    const activeCardMutation = useLTTMutation<MemberCardOutputDto, void>({
        mutationFn: () => customerMemberCardService.getActiveAsync(),
        onSuccess: setMemberCard,
    });

    const profileMutation = useLTTMutation<CustomerProfileOutputDto, void>({
        mutationFn: () => customerProfileService.getProfileAsync(),
        onSuccess: (res) => {
            setFullName(res?.name || "Member");
            setProfileQrUrl(res?.profileQRUrl || null);
            setIsQrLoading(Boolean(res?.profileQRUrl));
        },
    });

    const pointHistoryMutation = useLTTMutation<PagedResultDto<PointTransactionOutputDto>, { skipCount: number; maxResultCount: number }>({
        mutationFn: (params) => customerMemberCardService.getPointHistoryAsync(params),
        onSuccess: (res) => {
            setPointHistory(res?.items || []);
            setPointPagination((prev) => ({ ...prev, totalCount: res?.totalCount || 0 }));
        },
    });

    const cardManagementDisabledToast = () => {
        toast.error(t('customer.my_ltc.membership_card.feature_available_soon'));
    };

    const fetchPointHistory = () => {
        pointHistoryMutation.mutation({
            skipCount: (pointPagination.page - 1) * pointPagination.fetch,
            maxResultCount: pointPagination.fetch,
        });
    };

    useEffect(() => {
        activeCardMutation.mutation();
        profileMutation.mutation();
        fetchPointHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchPointHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pointPagination.page, pointPagination.fetch]);

    const tierName = useMemo(() => {
        if (!memberCard?.memberTierId || memberTiers.length === 0) {
            return "Member";
        }
        const matched = memberTiers.find((x) => x.id === memberCard.memberTierId);
        return matched?.name || "Member";
    }, [memberCard?.memberTierId, memberTiers]);

    const cardInfo = useMemo(() => {
        return {
            memberLevel: tierName.toUpperCase(),
            memberId: formatMemberCardNumber(memberCard?.cardNumber),
            fullName,
            currentPoints: memberCard?.currentPoints ?? 0,
            totalSpent: memberCard?.totalSpent ?? 0,
            validThru: memberCard?.expiryDate ? new Date(memberCard.expiryDate).toLocaleDateString("vi-VN") : "--/--/----",
            registeredAt: memberCard?.issuedDate ? new Date(memberCard.issuedDate).toLocaleDateString("vi-VN") : "--/--/----",
        };
    }, [memberCard, fullName, tierName]);

    const pointHistoryRows = useMemo(() => {
        return pointHistory.map((item) => ({
            id: item.id,
            type: item.type || "Point transaction",
            points: `${item.pointNumber >= 0 ? "+" : ""}${item.pointNumber}`,
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "-",
            time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString("vi-VN") : "",
        }));
    }, [pointHistory]);

    const pointHistoryColumns = [
        { title: 'Transaction ID', dataIndex: 'id', key: 'id', width: '20%' },
        { title: 'Type', dataIndex: 'type', key: 'type', width: '30%' },
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

    const loadTierInfoFromCacheOrApi = async () => {
        const cached = localStorage.getItem(MEMBER_TIER_CACHE_KEY);
        if (cached) {
            try {
                const parsed = JSON.parse(cached) as MemberTierOutputDto[];
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMemberTiers(parsed);
                    return;
                }
            } catch {
                localStorage.removeItem(MEMBER_TIER_CACHE_KEY);
            }
        }

        setIsTierLoading(true);
        try {
            const result = await customerMemberTierService.getMemberTierListAsync({
                skipCount: 0,
                maxResultCount: 100,
            });
            setMemberTiers(result.items || []);
            localStorage.setItem(MEMBER_TIER_CACHE_KEY, JSON.stringify(result.items || []));
        } catch (error: any) {
            toast.error(error?.message || "Failed to load member tier info.");
        } finally {
            setIsTierLoading(false);
        }
    };

    const handleOpenTierInfo = async () => {
        setOpenTierInfo(true);
        await loadTierInfoFromCacheOrApi();
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in-up w-full">
            <div className="relative w-full max-w-lg mx-auto transform hover:scale-[1.02] transition-transform duration-500">
                <button
                    type="button"
                    onClick={handleOpenTierInfo}
                    className="absolute -top-3 -right-3 z-30 h-10 w-10 rounded-full border-2 border-white bg-[#cc3434] text-white font-black shadow-lg transition-all duration-300 hover:bg-white hover:text-[#cc3434] hover:border-[#cc3434] hover:scale-110 flex items-center justify-center cursor-pointer"
                    aria-label="View membership tier info"
                >
                    <span className="material-symbols-outlined text-[20px]">info</span>
                </button>

                <div
                    className="relative bg-gradient-to-br from-[#cc3434] via-[#b22a2a] to-[#7a1414] rounded-2xl p-8 shadow-2xl text-white aspect-[1.58] flex flex-col justify-between overflow-hidden group"
                    style={{ fontFamily: vietnameseSafeFontFamily }}
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full -mr-40 -mt-40 transition-transform duration-700 group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full -ml-32 -mb-32 transition-transform duration-700 group-hover:scale-110"></div>

                    <div className="flex justify-between items-start z-10 w-full mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-[#ffc1c1] text-[20px]">movie</span>
                                <h3 className="text-[10px] font-black tracking-[0.2em] text-[#ffc1c1] uppercase">LTC CINEMA</h3>
                            </div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic">{cardInfo.memberLevel}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpenQrModal(true)}
                            className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 shadow-inner cursor-pointer transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            aria-label={t('customer.my_ltc.membership_card.open_qr')}
                        >
                            {profileQrUrl ? (
                                <div className="relative w-20 h-20 rounded-sm overflow-hidden bg-white">
                                    {isQrLoading && (
                                        <img
                                            src={QR_LOADING_GIF}
                                            alt=""
                                            className="absolute inset-0 m-auto w-8 h-8 object-contain"
                                        />
                                    )}
                                    <img
                                        src={profileQrUrl}
                                        alt=""
                                        className={`w-20 h-20 rounded-sm bg-white object-cover transition-opacity duration-200 ${isQrLoading ? 'opacity-0' : 'opacity-100'}`}
                                        loading="lazy"
                                        onLoad={() => setIsQrLoading(false)}
                                        onError={() => setIsQrLoading(false)}
                                    />
                                </div>
                            ) : (
                                <div className="w-20 h-20 grid grid-cols-5 grid-rows-5 gap-[2px] bg-black p-1 rounded-sm">
                                    <div className="bg-white col-span-2 row-span-2"></div>
                                    <div className="bg-white col-span-1 row-span-1"></div>
                                    <div className="bg-white col-span-2 row-span-2 col-start-4"></div>
                                    <div className="bg-white col-span-1 row-span-3 col-start-3 row-start-2"></div>
                                    <div className="bg-[white] col-span-2 row-span-2 row-start-4"></div>
                                    <div className="bg-[white] col-span-2 row-span-2 col-start-4 row-start-4"></div>
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="z-10 mt-auto">
                        <div className="flex flex-col mb-6">
                            <span className="text-[9px] uppercase tracking-widest text-[#ffc1c1] font-bold mb-1">MEMBERSHIP ID</span>
                            <div className="text-2xl tracking-[0.15em] font-semibold drop-shadow-md">
                                {cardInfo.memberId}
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-white/20 pt-4">
                            <div>
                                <p className="text-[9px] uppercase font-bold text-[#ffc1c1] mb-1">CARD HOLDER</p>
                                <p className="font-black text-xl tracking-tight uppercase leading-none">{cardInfo.fullName}</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <p className="text-[9px] uppercase font-bold text-[#ffc1c1] mb-1">REGISTERED</p>
                                    <p className="font-bold text-sm tracking-tighter">{cardInfo.registeredAt}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] uppercase font-bold text-[#ffc1c1] mb-1">VALID THRU</p>
                                    <p className="font-bold text-sm tracking-tighter">{cardInfo.validThru}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MembershipQrModal
                open={openQrModal}
                onClose={() => setOpenQrModal(false)}
                qrUrl={profileQrUrl}
                customerName={fullName}
                cardNumberDisplay={formatMemberCardNumber(memberCard?.cardNumber)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#cc3434]">
                            <span className="material-symbols-outlined text-[28px]">stars</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Points</p>
                            <p className="text-4xl font-black text-[#cc3434] tracking-tighter">{cardInfo.currentPoints.toLocaleString()} <span className="text-lg font-bold">P</span></p>
                        </div>
                    </div>
                </LTTCard>

                <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600">
                            <span className="material-symbols-outlined text-[28px]">payments</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Spent Points</p>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{cardInfo.totalSpent.toLocaleString()} <span className="text-lg font-bold">P</span></p>
                        </div>
                    </div>
                </LTTCard>
            </div>

            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-[#cc3434] rounded-full"></div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Point Transaction History</h2>
                </div>
                <LTTTable
                    columns={pointHistoryColumns}
                    dataSource={pointHistoryRows}
                    rowKey="id"
                    loading={pointHistoryMutation.isLoading}
                    className="border border-gray-50 rounded-xl overflow-hidden"
                    pagination={{
                        totalCount: pointPagination.totalCount,
                        page: pointPagination.page,
                        fetch: pointPagination.fetch,
                        onChange: (page: number, fetch: number) => {
                            setPointPagination((prev) => ({ ...prev, page, fetch }));
                        },
                    }}
                />
            </LTTCard>

            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white mb-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-[#cc3434] rounded-full"></div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">{t('customer.my_ltc.membership_card.card_management')}</h2>
                </div>

                <div className="flex flex-wrap gap-4">
                    <LTTButton
                        className="rounded-xl font-bold bg-white text-gray-700 border-gray-200 hover:!border-[#cc3434] hover:!text-[#cc3434] h-12 px-6"
                        onClick={cardManagementDisabledToast}
                    >
                        {t('customer.my_ltc.membership_card.request_new_card')}
                    </LTTButton>
                    <LTTButton
                        className="rounded-xl font-bold bg-white text-gray-700 border-gray-200 hover:!border-[#cc3434] hover:!text-[#cc3434] h-12 px-6"
                        onClick={cardManagementDisabledToast}
                    >
                        {t('customer.my_ltc.membership_card.update_information')}
                    </LTTButton>
                    <LTTButton
                        className="rounded-xl font-bold bg-white text-[#cc3434] border-[#cc3434] hover:!bg-[#cc3434] hover:!text-white h-12 px-6 ml-0 md:ml-auto"
                        onClick={cardManagementDisabledToast}
                    >
                        {t('customer.my_ltc.membership_card.delete_card')}
                    </LTTButton>
                </div>
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
                        Current tier: {tierName}
                    </div>
                </div>

                <div className="p-6">
                    {isTierLoading ? (
                        <div className="py-8 text-center text-gray-500">Loading tier data...</div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-[#f0caca]">
                            <div className="grid grid-cols-4 bg-[#cc3434] px-4 py-3 text-sm font-semibold text-white">
                                <span>Tier</span>
                                <span className="text-center">Min points</span>
                                <span className="text-center">Discount</span>
                                <span className="text-center">Multiplier</span>
                            </div>

                            {memberTiers.map((tier, index) => {
                                const isCurrentTier = tier.id === memberCard?.memberTierId;
                                return (
                                    <div
                                        key={tier.id}
                                        className={`grid grid-cols-4 items-center px-4 py-3 text-sm border-t border-[#f3dede] ${index % 2 === 0 ? 'bg-[#fff9f9]' : 'bg-white'
                                            } ${isCurrentTier ? 'bg-[#ffeaea]' : ''}`}
                                    >
                                        <span className={`font-semibold ${isCurrentTier ? 'text-[#a51818]' : 'text-gray-800'}`}>
                                            {tier.name}
                                        </span>
                                        <span className="text-center text-gray-700">{tier.minPoints.toLocaleString('vi-VN')}</span>
                                        <span className="text-center text-gray-700">{tier.discountPercentage}%</span>
                                        <span className="text-center text-gray-700">{tier.pointMultiplier}x</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

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
