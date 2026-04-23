'use client';

import React, { useEffect, useState } from 'react';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import { customerProfileService } from '@/src/services/customer-service/profile/profile.service';
import { CustomerAddressJson, CustomerGender, UpdateCustomerProfileInputDto } from '@/src/services/customer-service/profile/models/input.model';
import { CustomerProfileOutputDto } from '@/src/services/customer-service/profile/models/output.model';
import { showNotificationSuccess, showNotificationError } from '@/src/@core/utils/message';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import useLTTMutation from '@/src/@core/hooks/useLTTMutation';
import { Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useLocalization } from '@/src/@core/hooks/use-localization';
import vnCityDistricts from "@/src/@core/const/location/vn-city-districts.json";

type AddressOption = {
    provinceCity: string;
    wardCommunes: string[];
};

type CityDistrictData = {
    city: string;
    wards: string[];
};

const ADDRESS_OPTIONS: AddressOption[] = (vnCityDistricts as CityDistrictData[]).map((item) => ({
    provinceCity: item.city,
    wardCommunes: item.wards,
}));

const resolveProvinceValue = (provinceCity?: string): string | undefined => {
    if (!provinceCity) {
        return undefined;
    }

    const exactMatch = ADDRESS_OPTIONS.find((option) => option.provinceCity === provinceCity);
    if (exactMatch) {
        return exactMatch.provinceCity;
    }

    const suffixMatch = ADDRESS_OPTIONS.find((option) => option.provinceCity.endsWith(provinceCity));
    if (suffixMatch) {
        return suffixMatch.provinceCity;
    }

    return provinceCity;
};

const parseAddressJson = (address?: string): CustomerAddressJson | null => {
    if (!address) {
        return null;
    }

    try {
        const parsed = JSON.parse(address);
        if (parsed && typeof parsed === "object" && parsed.provinceCity && parsed.wardCommune) {
            return {
                provinceCity: String(parsed.provinceCity),
                wardCommune: String(parsed.wardCommune),
                hamletRoad: parsed.hamletRoad ? String(parsed.hamletRoad) : "",
            };
        }
    } catch {
        const segments = address.split(",").map((segment) => segment.trim()).filter(Boolean);
        if (segments.length >= 2) {
            return {
                provinceCity: segments[0],
                wardCommune: segments[1],
                hamletRoad: segments[2] ?? "",
            };
        }
    }

    return null;
};

const stringifyAddressJson = (provinceCity?: string, wardCommune?: string, hamletRoad?: string): string | undefined => {
    if (!provinceCity || !wardCommune) {
        return undefined;
    }

    return JSON.stringify({
        provinceCity,
        wardCommune,
        hamletRoad: (hamletRoad || "").trim(),
    });
};

const displayAddress = (address?: string): string => {
    if (!address) {
        return "---";
    }

    const parsed = parseAddressJson(address);
    if (!parsed) {
        return address;
    }

    return [parsed.provinceCity, parsed.wardCommune, parsed.hamletRoad].filter(Boolean).join(", ");
};

export default function AccountDetailsPage() {
    const { t } = useLocalization();
    const [profile, setProfile] = useState<CustomerProfileOutputDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const selectedProvince = Form.useWatch("addressProvinceCity", form);
    const provinceOptions = ADDRESS_OPTIONS.map((option) => ({
        label: option.provinceCity,
        value: option.provinceCity,
    }));
    const wardOptions = (ADDRESS_OPTIONS.find((option) => option.provinceCity === selectedProvince)?.wardCommunes ?? []).map((ward) => ({
        label: ward,
        value: ward,
    }));

    const {
        mutation: fetchProfile,
        isLoading: isFetchingProfile,
        isInitLoading: isFetchingProfileInit,
    } = useLTTMutation<CustomerProfileOutputDto, undefined>({
        mutationFn: () => customerProfileService.getProfileAsync(),
        onSuccess: (data) => {
            if (!data) return;
            setProfile(data);
            const parsedAddress = parseAddressJson(data.address);
            const resolvedProvince = resolveProvinceValue(parsedAddress?.provinceCity);
            form.setFieldsValue({
                ...data,
                dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
                addressProvinceCity: resolvedProvince,
                addressWardCommune: parsedAddress?.wardCommune,
                addressHamletRoad: parsedAddress?.hamletRoad,
            });
        },
        onError: () => {
            showNotificationError(t('customer.my_ltc.account_details.fetch_error'));
        },
    });

    const { mutation: updateProfile, isLoading: isUpdatingProfile } = useLTTMutation<CustomerProfileOutputDto, UpdateCustomerProfileInputDto>({
        mutationFn: (body) => customerProfileService.updateProfileAsync(body),
        onSuccess: (updatedProfile) => {
            if (!updatedProfile) return;
            setProfile(updatedProfile);
            const parsedAddress = parseAddressJson(updatedProfile.address);
            const resolvedProvince = resolveProvinceValue(parsedAddress?.provinceCity);
            form.setFieldsValue({
                ...updatedProfile,
                dateOfBirth: updatedProfile.dateOfBirth ? dayjs(updatedProfile.dateOfBirth) : null,
                addressProvinceCity: resolvedProvince,
                addressWardCommune: parsedAddress?.wardCommune,
                addressHamletRoad: parsedAddress?.hamletRoad,
            });
            showNotificationSuccess(t('customer.my_ltc.account_details.success'));
            setIsEditing(false);
        },
        onError: () => {
            showNotificationError(t('customer.my_ltc.account_details.update_error'));
        },
    });

    useEffect(() => {
        fetchProfile(undefined);
    }, []);

    const handleUpdate = async (values: Record<string, unknown>) => {
        const address = stringifyAddressJson(
            values.addressProvinceCity as string | undefined,
            values.addressWardCommune as string | undefined,
            values.addressHamletRoad as string | undefined,
        );

        await updateProfile({
            name: values.name as string,
            phoneNumber: values.phoneNumber as string | undefined,
            emailAddress: values.emailAddress as string,
            gender: values.gender as CustomerGender | undefined,
            dateOfBirth: values.dateOfBirth ? (values.dateOfBirth as dayjs.Dayjs).toISOString() : null,
            address,
        });
    };

    const rows = [
        { label: t('customer.my_ltc.account_details.fields.name'), key: 'name', value: profile?.name },
        { label: t('customer.my_ltc.account_details.fields.phone'), key: 'phoneNumber', value: profile?.phoneNumber },
        { label: t('customer.my_ltc.account_details.fields.gender'), key: 'gender', value: profile?.gender },
        { label: t('customer.my_ltc.account_details.fields.dob'), key: 'dateOfBirth', value: profile?.dateOfBirth ? dayjs(profile.dateOfBirth).format('DD/MM/YYYY') : t('customer.my_ltc.account_details.not_updated') },
        { label: t('customer.my_ltc.account_details.fields.email'), key: 'emailAddress', value: profile?.emailAddress },
        { label: t('customer.my_ltc.account_details.fields.address'), key: 'address', value: profile?.address ? displayAddress(profile.address) : t('customer.my_ltc.account_details.not_updated') },
        {
            label: "Profile QR URL",
            key: 'profileQRUrl',
            value: profile?.profileQRUrl ? (
                <img
                    src={profile.profileQRUrl}
                    alt="Profile QR code"
                    className="w-28 h-28 object-contain bg-white rounded-lg border border-gray-200 p-1"
                    loading="lazy"
                />
            ) : "---",
            readOnly: true
        },
    ];

    if ((isFetchingProfile || isFetchingProfileInit) && !profile) {
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
                                    <Select.Option value="Male">{t('customer.my_ltc.account_details.gender_options.male')}</Select.Option>
                                    <Select.Option value="Female">{t('customer.my_ltc.account_details.gender_options.female')}</Select.Option>
                                    <Select.Option value="Other">{t('customer.my_ltc.account_details.gender_options.other')}</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-gray-700 uppercase text-xs tracking-wider">{t('customer.my_ltc.account_details.fields.dob')}</span>}
                                name="dateOfBirth"
                            >
                                <DatePicker className="w-full rounded-lg border-gray-300 h-[40px]" size="large" format="DD/MM/YYYY" placeholder={t('customer.my_ltc.account_details.placeholders.dob')} />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Province/City</span>}
                                name="addressProvinceCity"
                                rules={[{ required: true, message: "Province/City is required." }]}
                            >
                                <Select
                                    size="large"
                                    options={provinceOptions}
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    className="w-full rounded-lg outline-none [&_.ant-select-selector]:!rounded-lg"
                                    getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                                    placeholder="Select province/city"
                                    onChange={() => form.setFieldValue("addressWardCommune", undefined)}
                                    filterOption={(inputValue, option) =>
                                        String(option?.label ?? "").toLowerCase().includes(inputValue.toLowerCase())
                                    }
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Ward/Commune</span>}
                                name="addressWardCommune"
                                rules={[{ required: true, message: "Ward/Commune is required." }]}
                            >
                                <Select
                                    size="large"
                                    options={wardOptions}
                                    allowClear
                                    showSearch
                                    disabled={!selectedProvince}
                                    optionFilterProp="label"
                                    className="w-full rounded-lg outline-none [&_.ant-select-selector]:!rounded-lg"
                                    getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                                    placeholder={selectedProvince ? "Select ward/commune" : "Please select province/city first"}
                                    filterOption={(inputValue, option) =>
                                        String(option?.label ?? "").toLowerCase().includes(inputValue.toLowerCase())
                                    }
                                />
                            </Form.Item>

                            <div className="md:col-span-2">
                                <Form.Item
                                    label={<span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Hamlet/Road (optional)</span>}
                                    name="addressHamletRoad"
                                >
                                    <Input
                                        size="large"
                                        className="rounded-lg border-gray-300 focus:border-[#cc3434] focus:ring-0"
                                        placeholder="Enter hamlet/road"
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
                                loading={isUpdatingProfile}
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
