'use client';

import React, { useEffect, useState } from 'react';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import { partyService, CustomerProfileOutputDto } from '@/src/services/customer-management/party/party.service';
import { showNotificationSuccess, showNotificationError } from '@/src/@core/utils/message';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import { Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useLocalization } from '@/src/@core/hooks/use-localization';

export default function AccountDetailsPage() {
    const { t } = useLocalization();
    const [profile, setProfile] = useState<CustomerProfileOutputDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await partyService.getProfileAsync();
            setProfile(data);
            form.setFieldsValue({
                ...data,
                dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null
            });
        } catch (error) {
            showNotificationError(t('customer.my_ltc.account_details.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values: any) => {
        try {
            setLoading(true);
            const updatedProfile = await partyService.updateProfileAsync({
                ...values,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null
            });
            setProfile(updatedProfile);
            showNotificationSuccess(t('customer.my_ltc.account_details.success'));
            setIsEditing(false);
        } catch (error) {
            showNotificationError(t('customer.my_ltc.account_details.update_error'));
        } finally {
            setLoading(false);
        }
    };

    const rows = [
        { label: t('customer.my_ltc.account_details.fields.name'), key: 'name', value: profile?.name },
        { label: t('customer.my_ltc.account_details.fields.phone'), key: 'phoneNumber', value: profile?.phoneNumber },
        { label: t('customer.my_ltc.account_details.fields.gender'), key: 'gender', value: profile?.gender },
        { label: t('customer.my_ltc.account_details.fields.dob'), key: 'dateOfBirth', value: profile?.dateOfBirth ? dayjs(profile.dateOfBirth).format('DD/MM/YYYY') : t('customer.my_ltc.account_details.not_updated') },
        { label: t('customer.my_ltc.account_details.fields.email'), key: 'emailAddress', value: profile?.emailAddress },
        { label: t('customer.my_ltc.account_details.fields.address'), key: 'address', value: profile?.address || t('customer.my_ltc.account_details.not_updated') },
        { label: t('customer.my_ltc.account_details.fields.member_code'), key: 'memberCode', value: profile?.memberCode, readOnly: true },
    ];

    if (loading && !profile) {
        return <div className="p-8 text-center text-gray-500 animate-pulse font-medium">{t('customer.my_ltc.account_details.loading')}</div>;
    }

    return (
        <div className="w-full animate-[fadeInUp_0.4s_ease-out_forwards]">
            <LTTCard className="p-6 md:p-8 shadow-sm border border-gray-100 rounded-xl bg-white overflow-hidden relative">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#cc3434] rounded-full"></div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{t('customer.my_ltc.account_details.title')}</h2>
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-gray-50 hover:bg-[#fff1f1] text-[#cc3434] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-gray-100 transition-all duration-300 hover:shadow-md active:scale-95 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit_square</span>
                            {t('customer.my_ltc.account_details.edit')}
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-500 hover:text-gray-700 font-bold text-sm border-none bg-transparent cursor-pointer transition-colors"
                            >
                                {t('customer.my_ltc.account_details.cancel_text')}
                            </button>
                        </div>
                    )}
                </div>

                {!isEditing ? (
                    <div className="flex flex-col gap-0 divide-y divide-gray-50">
                        {rows.map((row, index) => (
                            <div
                                key={index}
                                className={`flex flex-col md:flex-row py-5 group transition-colors duration-200 hover:bg-gray-50/50 px-4 -mx-4 rounded-xl`}
                            >
                                <div className="w-full md:w-1/3 mb-1 md:mb-0 text-gray-500 font-semibold text-sm uppercase tracking-wide">
                                    {row.label}
                                </div>
                                <div className={`w-full md:w-2/3 font-bold text-gray-900 ${row.readOnly ? 'text-gray-400 font-mono tracking-wider' : ''}`}>
                                    {row.value || '---'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdate}
                        className="max-w-3xl"
                        requiredMark={false}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <Form.Item
                                label={<span className="font-bold text-gray-700 uppercase text-xs tracking-wider">{t('customer.my_ltc.account_details.fields.name')}</span>}
                                name="name"
                                rules={[{ required: true, message: t('customer.my_ltc.account_details.validation.name_required') }]}
                            >
                                <Input size="large" className="rounded-lg border-gray-300 focus:border-[#cc3434] focus:ring-0" placeholder={t('customer.my_ltc.account_details.placeholders.name')} />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-gray-700 uppercase text-xs tracking-wider">{t('customer.my_ltc.account_details.fields.phone')}</span>}
                                name="phoneNumber"
                                rules={[{ required: true, message: t('customer.my_ltc.account_details.validation.phone_required') }]}
                            >
                                <Input size="large" className="rounded-lg border-gray-300 focus:border-[#cc3434] focus:ring-0" placeholder={t('customer.my_ltc.account_details.placeholders.phone')} />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-gray-700 uppercase text-xs tracking-wider">{t('customer.my_ltc.account_details.fields.email')}</span>}
                                name="emailAddress"
                                rules={[{ type: 'email', message: t('customer.my_ltc.account_details.validation.email_invalid') }, { required: true, message: t('customer.my_ltc.account_details.validation.email_required') }]}
                            >
                                <Input size="large" className="rounded-lg border-gray-300 focus:border-[#cc3434] focus:ring-0" placeholder={t('customer.my_ltc.account_details.placeholders.email')} />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-gray-700 uppercase text-xs tracking-wider">{t('customer.my_ltc.account_details.fields.gender')}</span>}
                                name="gender"
                            >
                                <Select size="large" className="w-full rounded-lg outline-none [&_.ant-select-selector]:!rounded-lg" placeholder={t('customer.my_ltc.account_details.placeholders.gender')}>
                                    <Select.Option value="Nam">{t('customer.my_ltc.account_details.gender_options.male')}</Select.Option>
                                    <Select.Option value="Nữ">{t('customer.my_ltc.account_details.gender_options.female')}</Select.Option>
                                    <Select.Option value="Khác">{t('customer.my_ltc.account_details.gender_options.other')}</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-gray-700 uppercase text-xs tracking-wider">{t('customer.my_ltc.account_details.fields.dob')}</span>}
                                name="dateOfBirth"
                            >
                                <DatePicker className="w-full rounded-lg border-gray-300 h-[40px]" size="large" format="DD/MM/YYYY" placeholder={t('customer.my_ltc.account_details.placeholders.dob')} />
                            </Form.Item>

                            <div className="md:col-span-2 mt-2">
                                <Form.Item
                                    label={<span className="font-bold text-gray-700 uppercase text-xs tracking-wider">{t('customer.my_ltc.account_details.fields.address')}</span>}
                                    name="address"
                                >
                                    <Input.TextArea
                                        size="large"
                                        rows={3}
                                        className="rounded-lg border-gray-300 focus:border-[#cc3434] focus:ring-0"
                                        placeholder={t('customer.my_ltc.account_details.placeholders.address')}
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end gap-4 border-t border-gray-100 pt-8">
                            <LTTButton
                                onClick={() => setIsEditing(false)}
                                className="px-8 !bg-gray-100 !text-gray-600 !border-none hover:!bg-gray-200 transition-all font-bold uppercase tracking-wider"
                            >
                                {t('customer.my_ltc.account_details.cancel')}
                            </LTTButton>
                            <LTTButton
                                htmlType="submit"
                                loading={loading}
                                className="px-10 !bg-[#cc3434] !text-white !border-none hover:!bg-[#a51818] transition-all font-bold shadow-lg shadow-red-100 uppercase tracking-wider"
                            >
                                {t('customer.my_ltc.account_details.save')}
                            </LTTButton>
                        </div>
                    </Form>
                )}
            </LTTCard>
        </div>
    );
}
