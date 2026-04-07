"use client";
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-6">Trang không tồn tại (Page Not Found)</h2>
            <p className="mb-8 text-gray-500">Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>

            <Link
                href="/"
                className="px-6 py-3 bg-primary hover:scale-105 hover:bg-primary hover:!text-white text-white rounded-md font-medium transition-all duration-200"
            >
                Trở về trang chủ
            </Link>
        </div>
    );
}
