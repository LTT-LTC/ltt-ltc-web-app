'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '../../_components/TopBar';
import Header from '../../_components/Header';
import Footer from '../../_components/Footer';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

// --- CONSTANTS ---
const PROVINCES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Đồng Nai', 'Hải Phòng', 'Quảng Ninh', 'Bà Rịa-Vũng Tàu', 'Bình Định', 'Bình Dương', 'Đắk Lắk', 'Trà Vinh', 'Yên Bái', 'Vĩnh Long', 'Kiên Giang', 'Hậu Giang', 'Hà Tĩnh', 'Phú Yên', 'Đồng Tháp', 'Bạc Liêu', 'Hưng Yên', 'Khánh Hòa', 'Kon Tum', 'Lạng Sơn', 'Nghệ An', 'Phú Thọ', 'Quảng Ngãi', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Nguyên', 'Tiền Giang'];

interface CinemaDetail {
  id: string;
  name: string;
  address: string;
  city: string;
}

const MOCK_CINEMAS: CinemaDetail[] = [
  {
    id: '1',
    name: 'LTC Landmark 81',
    city: 'Hồ Chí Minh',
    address: 'Tầng B1, Landmark 81, 720A Điện Biên Phủ, P. 22, Q. Bình Thạnh',
  },
  {
    id: '2',
    name: 'LTC Vincom Đồng Khởi',
    city: 'Hồ Chí Minh',
    address: 'Tầng 3, Vincom Center Đồng Khởi, Q.1',
  },
  {
    id: '3',
    name: 'LTC Hùng Vương Plaza',
    city: 'Hồ Chí Minh',
    address: 'Tầng 7, Hùng Vương Plaza, 126 Hồng Bàng, Q.5',
  }
];

export default function AllCinemasPage() {
  const [selectedProvince, setSelectedProvince] = useState('Hồ Chí Minh');
  const [selectedCinema, setSelectedCinema] = useState<CinemaDetail | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const filteredCinemas = MOCK_CINEMAS.filter(c => c.city === selectedProvince);
  const datesRows = Array.from({ length: 14 }).map((_, i) => dayjs().add(i, 'day'));

  useEffect(() => {
    const provinceCinemas = MOCK_CINEMAS.filter(c => c.city === selectedProvince);
    if (provinceCinemas.length > 0) {
      if (selectedProvince === 'Hồ Chí Minh') {
        setSelectedCinema(provinceCinemas.find(c => c.id === '2') || provinceCinemas[0]);
      } else {
        setSelectedCinema(provinceCinemas[0]);
      }
    } else {
      setSelectedCinema(null);
    }
  }, [selectedProvince]);

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-gray-800">
      <TopBar />
      <Header />

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Tất Cả Rạp Chiếu</h1>

          {/* LOCATION SELECTOR */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-base font-bold text-gray-800 flex items-center mb-6">
              <span className="material-symbols-outlined text-[#E50914] mr-2">location_on</span>
              Chọn Tỉnh/Thành Phố
            </h2>
            
            <div className="flex flex-wrap gap-x-6 gap-y-4 border-b border-gray-100 pb-6 mb-6">
              {PROVINCES.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedProvince(p)}
                  className={`text-[13px] transition-colors hover:text-[#E50914] ${
                    selectedProvince === p ? 'text-[#E50914] font-bold' : 'text-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-medium text-gray-800 mb-4">Rạp tại {selectedProvince}:</h3>
            <div className="flex flex-wrap gap-3">
              {filteredCinemas.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCinema(c)}
                  className={`px-4 py-2 border rounded-md text-[13px] transition-colors cursor-pointer ${
                    selectedCinema?.id === c.id 
                    ? 'bg-[#cd1e25] border-[#cd1e25] text-white hover:bg-[#b01a20]' 
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#cd1e25] hover:text-[#cd1e25]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {selectedCinema && (
            <>
              {/* CINEMA INFOS */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-bold text-[#cd1e25] mb-1">{selectedCinema.name}</h2>
                <div className="text-[13px] text-gray-500 mb-6 flex items-center">
                  <span className="material-symbols-outlined text-[16px] mr-1">location_on</span>
                  {selectedCinema.address}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-48 md:h-56">
                  <div className="bg-[#F5F5F5] rounded-md flex items-center justify-center text-gray-400 text-sm">Ảnh rạp 1</div>
                  <div className="bg-[#F5F5F5] rounded-md flex items-center justify-center text-gray-400 text-sm">Ảnh rạp 2</div>
                  <div className="bg-[#F5F5F5] rounded-md flex items-center justify-center text-gray-400 text-sm">Ảnh rạp 3</div>
                </div>
              </div>

              {/* SCHEDULE */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
                <h2 className="text-base font-bold text-gray-800 flex items-center mb-6">
                  <span className="material-symbols-outlined text-[#cd1e25] mr-2">schedule</span>
                  Lịch Chiếu Phim
                </h2>

                <div className="flex gap-2 border-b border-gray-200 pb-4 mb-8 overflow-x-auto no-scrollbar">
                  {datesRows.map((date, idx) => {
                    const isSelected = selectedDate.isSame(date, 'day');
                    const dayOfWeek = date.day() === 0 ? 'CN' : `T${date.day() + 1}`;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center min-w-[50px] h-[65px] border rounded transition-colors cursor-pointer ${
                          isSelected 
                          ? 'border-[#cd1e25] bg-red-50/20' 
                          : 'border-transparent hover:border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-[#cd1e25]' : 'text-gray-800'}`}>{dayOfWeek}</span>
                        <span className={`text-[17px] font-bold leading-tight ${isSelected ? 'text-[#cd1e25]' : 'text-gray-800'}`}>{date.date()}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-[#cd1e25]' : 'text-gray-400'}`}>T{date.month() + 1}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-center text-gray-400 text-sm py-8">
                  Không có suất chiếu cho ngày này.
                </div>
              </div>
            </>
          )}

          {/* TICKET PRICE */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 overflow-x-auto">
            <h2 className="text-base font-bold text-gray-800 mb-6">Bảng Giá Vé</h2>
            
            {/* Standard 2D Table */}
            <div className="mb-8 min-w-[800px]">
              <div className="bg-[#cd1e25] text-white text-center py-2 font-bold text-[13px] rounded-t-lg">TICKET PRICE</div>
              <table className="w-full text-center text-[12px] border-collapse border border-gray-200">
                <thead>
                  <tr>
                    <th className="border border-gray-200 py-3 bg-gray-50/50 w-1/4">From Monday To<br/>Sunday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Monday, Tuesday, Thursday</th>
                    <th className="border border-gray-200 py-3 w-[12%]">Happy<br/>Wednesday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Friday, Saturday, Sunday,<br/>& Public Holiday</th>
                  </tr>
                  <tr className="text-gray-500 font-normal">
                    <th className="border border-gray-200 py-2"></th>
                    <th className="border border-gray-200 py-2 px-2">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2">Members 23<br/>Years Old & Under</th>
                    <th className="border border-gray-200 py-2 px-2">Adult</th>
                    <th className="border border-gray-200 py-2"></th>
                    <th className="border border-gray-200 py-2 px-2">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2">Members 23<br/>Years Old & Under</th>
                    <th className="border border-gray-200 py-2 px-2">Adult</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-bold text-[13px]">
                    <td className="border border-gray-200 py-4"></td>
                    <td className="border border-gray-200 py-4">68.000</td>
                    <td className="border border-gray-200 py-4">70.000</td>
                    <td className="border border-gray-200 py-4">105.000</td>
                    <td className="border border-gray-200 py-4">79.000</td>
                    <td className="border border-gray-200 py-4">68.000</td>
                    <td className="border border-gray-200 py-4">83.000</td>
                    <td className="border border-gray-200 py-4">125.000</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-[11px] text-gray-500 mt-2 px-2">
                <div className="mb-0.5">Seat VIP: +5.500 (Free of charge for U22)</div>
                <div className="mb-0.5">Sweetbox: +26.000 (Monday - Sunday)</div>
                <div className="mb-0.5">3D: +32.000 (Mon-Thu), +53.000 (Fri-Sun & Public Holiday)</div>
                <div>Tet/Holiday: +11.000</div>
              </div>
            </div>

            {/* 4DX Table */}
            <div className="mb-8 min-w-[800px]">
              <div className="bg-[#cd1e25] text-white text-center py-2 font-bold text-[13px] rounded-t-lg">4DX TICKET PRICE</div>
              <table className="w-full text-center text-[12px] border-collapse border border-gray-200">
                <thead>
                  <tr>
                    <th className="border border-gray-200 py-3 bg-gray-50/50 w-1/4">From Monday To<br/>Sunday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Monday, Tuesday, Thursday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Friday, Saturday, Sunday,<br/>& Public Holiday</th>
                  </tr>
                  <tr className="text-gray-500 font-normal">
                    <th className="border border-gray-200 py-2"></th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Members 23<br/>Years Old & Under</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Adult</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Members 23<br/>Years Old & Under</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Adult</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-bold text-[13px]">
                    <td className="border border-gray-200 py-4"></td>
                    <td className="border border-gray-200 py-4">123.000</td>
                    <td className="border border-gray-200 py-4">133.000</td>
                    <td className="border border-gray-200 py-4">153.000</td>
                    <td className="border border-gray-200 py-4">153.000</td>
                    <td className="border border-gray-200 py-4">133.000</td>
                    <td className="border border-gray-200 py-4">183.000</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-[11px] text-gray-500 mt-2 px-2">
                <div className="mb-0.5">Surcharge: +32.000 (Mon-Thu), +53.000 (Fri-Sun & Public Holiday)</div>
                <div>Sweetbox: +26.000 VND, Tet/Holiday: +11.000 VND</div>
              </div>
            </div>

            {/* SCREEN-X Table */}
            <div className="min-w-[800px]">
              <div className="bg-[#cd1e25] text-white text-center py-2 font-bold text-[13px] rounded-t-lg">SCREEN-X TICKET PRICE</div>
              <table className="w-full text-center text-[12px] border-collapse border border-gray-200">
                <thead>
                  <tr>
                    <th className="border border-gray-200 py-3 bg-gray-50/50 w-1/4">From Monday To<br/>Sunday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Monday, Tuesday, Thursday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Friday, Saturday, Sunday,<br/>& Public Holiday</th>
                  </tr>
                  <tr className="text-gray-500 font-normal">
                    <th className="border border-gray-200 py-2"></th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Members 23<br/>Years Old & Under</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Adult</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Members 23<br/>Years Old & Under</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Adult</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-bold text-[13px]">
                    <td className="border border-gray-200 py-4"></td>
                    <td className="border border-gray-200 py-4">113.000</td>
                    <td className="border border-gray-200 py-4">123.000</td>
                    <td className="border border-gray-200 py-4">143.000</td>
                    <td className="border border-gray-200 py-4">143.000</td>
                    <td className="border border-gray-200 py-4">123.000</td>
                    <td className="border border-gray-200 py-4">173.000</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-[11px] text-gray-500 mt-2 px-2">
                <div className="mb-0.5">Surcharge: +32.000 (Mon-Thu), +53.000 (Fri-Sun & Public Holiday)</div>
                <div>Sweetbox: +26.000 VND</div>
              </div>
            </div>
          </div>

          {/* WARNING NOTES */}
          <div className="bg-[#FEF1F2] rounded-xl p-6 mb-6">
            <h2 className="text-base font-bold text-[#cd1e25] flex items-center mb-4">
              <span className="material-symbols-outlined text-[#cd1e25] mr-2">error</span>
              Lưu Ý Khi Đặt Vé
            </h2>
            <ul className="text-[13px] text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="material-symbols-outlined text-[16px] text-[#cd1e25] mr-2 flex-shrink-0 mt-0.5">chevron_right</span>
                Vui lòng đến trước giờ chiếu 15-30 phút để nhận vé và chọn chỗ ngồi.
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-[16px] text-[#cd1e25] mr-2 flex-shrink-0 mt-0.5">chevron_right</span>
                Trẻ em dưới 13 tuổi cần có người lớn đi kèm với phim có nhãn T13.
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-[16px] text-[#cd1e25] mr-2 flex-shrink-0 mt-0.5">chevron_right</span>
                Không mang thức ăn/đồ uống từ bên ngoài vào rạp.
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-[16px] text-[#cd1e25] mr-2 flex-shrink-0 mt-0.5">chevron_right</span>
                Vé đã mua không hoàn trả hoặc đổi sang suất chiếu khác.
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-[16px] text-[#cd1e25] mr-2 flex-shrink-0 mt-0.5">chevron_right</span>
                Giá vé có thể thay đổi vào các ngày lễ, Tết.
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
