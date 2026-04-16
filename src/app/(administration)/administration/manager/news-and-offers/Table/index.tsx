"use client";


import { useEffect, useState } from "react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { NewsAndOffersService } from "@/src/services/administration-service/news-and-offers/news-and-offers.service";
import type { NewsAndOffersDto } from "@/src/services/administration-service/news-and-offers/models";

const statusLabel = {
    active: "Đang hiển thị",
    draft: "Bản nháp",
    archived: "Đã lưu trữ",
};

export default function NewsAndOffersTable({ search }: { search: string }) {
    const [data, setData] = useState<NewsAndOffersDto[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async (keyword = "") => {
        setLoading(true);
        try {
            const res = await NewsAndOffersService.getList({ keyword });
            setData(res.items ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(search);
    }, [search]);

    return (
        <LTTTable
            rowKey="id"
            loading={loading}
            columns={[
                { title: "Tiêu đề", dataIndex: "title", key: "title" },
                { title: "Nội dung", dataIndex: "content", key: "content" },
                { title: "Trạng thái", dataIndex: "status", key: "status", render: (v: string) => statusLabel[v] || v },
                { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt" },
            ]}
            dataSource={data}
        />
    );
}
