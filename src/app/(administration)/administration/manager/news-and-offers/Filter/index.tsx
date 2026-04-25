import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const NewsAndOffersFilter = () => {
    const filterItems = [
        {
            key: "keyword",
            title: "Tìm kiếm tin tức/ưu đãi",
            type: "keyword",
            className: "w-[380px] py-3!",
        },
        {
            key: "status",
            title: "Trạng thái",
            type: "multiSelect",
            className: "w-[230px]",
            options: [
                { label: "Đang hiển thị", value: "active" },
                { label: "Bản nháp", value: "draft" },
                { label: "Đã lưu trữ", value: "archived" },
            ],
        },
    ] as FilterProps[];

    return (
        <LTTFilter
            filterItems={filterItems}
            onChange={(allValues) => {
                // Will dispatch filter action when store is connected
            }}
        />
    );
};

export default NewsAndOffersFilter;
