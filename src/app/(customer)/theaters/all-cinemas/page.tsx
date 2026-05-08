 "use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import { toast } from "sonner";
import TopBar from "../../_components/TopBar";
import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import PaginationControls from "../../_components/PaginationControls";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { customerCinemaService } from "@/src/services/customer-service/cinema/cinema.service";
import { CustomerCinemaOutputDto } from "@/src/services/customer-service/cinema/models/output.model";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";
import { CustomerShowtimeOutputDto } from "@/src/services/customer-service/showtime/models/output.model";
import { getLocalizedMovieTitle, getRatingTagClass } from "../../_components/movieCatalog";
import { newBookingId, saveBookingState } from "@/src/@core/booking/bookingState";

dayjs.locale("vi");

const DATE_RANGE_DAYS = 14;
const SHOWTIME_PAGE_SIZE = 10;
const FALLBACK_POSTER = "/images/movie-current-banners/470x700-us.jpg";
const PROVINCES = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Đồng Nai",
  "Hải Phòng",
  "Quảng Ninh",
  "Bà Rịa-Vũng Tàu",
  "Bình Định",
  "Bình Dương",
  "Đắk Lắk",
  "Trà Vinh",
  "Yên Bái",
  "Vĩnh Long",
  "Kiên Giang",
  "Hậu Giang",
  "Hà Tĩnh",
  "Phú Yên",
  "Đồng Tháp",
  "Bạc Liêu",
  "Hưng Yên",
  "Khánh Hòa",
  "Kon Tum",
  "Lạng Sơn",
  "Nghệ An",
  "Phú Thọ",
  "Quảng Ngãi",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Tiền Giang",
];

type GroupedMovieShowtime = {
  movieId: string;
  movieTitle: string;
  originalTitle: string;
  posterUrl: string;
  ratingCode: string;
  movieFormat: string;
  durationMins?: number;
  slots: Array<{
    id: string;
    startTime: string;
    screenName: string;
    cinemaId: string;
    screenId: string;
  }>;
};

// Send date-only to avoid timezone offset drift (GMT+7 users selecting 08/05
// should always query 08/05 server-side, not 07/05T17:00:00Z).
const mapShowtimeDateInput = (value: Dayjs) => value.format("YYYY-MM-DD");

const formatClock = (value: string) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("HH:mm") : value;
};

export default function AllCinemasPage() {
  const { t, currentLanguage } = useLocalization();
  const router = useRouter();

  const startBookingForSlot = (slot: GroupedMovieShowtime["slots"][number], movie: GroupedMovieShowtime) => {
    const bookingId = newBookingId();
    saveBookingState(bookingId, {
      showtimeId: slot.id,
      cinemaId: slot.cinemaId,
      screenId: slot.screenId,
      movieId: movie.movieId,
    });
    const query = new URLSearchParams({
      showtimeId: slot.id,
      cinemaId: slot.cinemaId,
      screenId: slot.screenId,
      movieId: movie.movieId,
    });
    router.push(`/booking/${bookingId}/seats?${query.toString()}`);
  };
  const [cinemas, setCinemas] = useState<CustomerCinemaOutputDto[]>([]);
  const [showtimes, setShowtimes] = useState<CustomerShowtimeOutputDto[]>([]);
  const [loadingCinema, setLoadingCinema] = useState(false);
  const [loadingShowtime, setLoadingShowtime] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("Hồ Chí Minh");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dateStart, setDateStart] = useState(dayjs());
  const [showtimePage, setShowtimePage] = useState(1);

  const filteredCinemas = useMemo(() => cinemas, [cinemas]);

  const selectedCinema = useMemo(
    () => filteredCinemas.find((item) => item.id === selectedCinemaId) || null,
    [filteredCinemas, selectedCinemaId],
  );

  const groupedShowtimes = useMemo<GroupedMovieShowtime[]>(() => {
    const grouped = new Map<string, GroupedMovieShowtime>();

    showtimes.forEach((item) => {
      const key = `${item.movieId}__${item.movieFormat || "-"}`;
      const movie = item.movie;
      const current = grouped.get(key) || {
        movieId: item.movieId,
        movieTitle: movie?.title || "",
        originalTitle: movie?.originalTitle || "",
        posterUrl: movie?.posterUrl || FALLBACK_POSTER,
        ratingCode: movie?.ratingCode || "",
        movieFormat: item.movieFormat || "",
        durationMins: movie?.durationMins ?? item.durationMins,
        slots: [],
      };

      current.slots.push({
        id: item.id,
        startTime: item.startTime,
        screenName: item.screenName || "",
        cinemaId: item.cinemaId,
        screenId: item.screenId,
      });
      grouped.set(key, current);
    });

    return Array.from(grouped.values())
      .map((movie) => ({
        ...movie,
        slots: movie.slots.sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()),
      }))
      .sort((a, b) => {
        const left = a.slots[0]?.startTime || "";
        const right = b.slots[0]?.startTime || "";
        return dayjs(left).valueOf() - dayjs(right).valueOf();
      });
  }, [showtimes]);

  const datesRows = useMemo(
    () => Array.from({ length: DATE_RANGE_DAYS }).map((_, index) => dateStart.add(index, "day")),
    [dateStart],
  );
  const totalShowtimePages = Math.max(1, Math.ceil(groupedShowtimes.length / SHOWTIME_PAGE_SIZE));
  const currentShowtimePage = Math.min(showtimePage, totalShowtimePages);
  const pagedGroupedShowtimes = useMemo(
    () =>
      groupedShowtimes.slice(
        (currentShowtimePage - 1) * SHOWTIME_PAGE_SIZE,
        currentShowtimePage * SHOWTIME_PAGE_SIZE,
      ),
    [groupedShowtimes, currentShowtimePage],
  );

  useEffect(() => {
    if (!selectedProvince) {
      setCinemas([]);
      return;
    }

    const fetchCinemas = async () => {
      setLoadingCinema(true);
      setSelectedCinemaId("");
      setShowtimes([]);
      try {
        const data = await customerCinemaService.getCinemaListAsync({
          city: selectedProvince,
          keyword: selectedProvince,
          page: 1,
          pageSize: 100,
        });
        setCinemas(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : t("customer.all_cinemas.messages.fetch_cinemas_error");
        toast.error(message);
      } finally {
        setLoadingCinema(false);
      }
    };

    void fetchCinemas();
  }, [selectedProvince, t]);

  useEffect(() => {
    if (!selectedCinemaId) return;
    if (!filteredCinemas.some((item) => item.id === selectedCinemaId)) {
      setSelectedCinemaId("");
    }
  }, [filteredCinemas, selectedCinemaId]);

  useEffect(() => {
    if (!selectedCinemaId) {
      setShowtimes([]);
      return;
    }

    const fetchShowtimes = async () => {
      setLoadingShowtime(true);
      try {
        const data = await customerShowtimeService.getShowtimeListAsync({
          cinemaId: selectedCinemaId,
          date: mapShowtimeDateInput(selectedDate),
        });
        setShowtimes(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : t("customer.all_cinemas.messages.fetch_showtimes_error");
        toast.error(message);
      } finally {
        setLoadingShowtime(false);
      }
    };

    void fetchShowtimes();
  }, [selectedCinemaId, selectedDate, t]);

  useEffect(() => {
    // Keep pagination intuitive: whenever user changes cinema/date, go back page 1.
    setShowtimePage(1);
  }, [selectedCinemaId, selectedDate]);

  useEffect(() => {
    if (showtimePage > totalShowtimePages) {
      setShowtimePage(totalShowtimePages);
    }
  }, [showtimePage, totalShowtimePages]);

  const canMoveDateBackward = dateStart.isAfter(dayjs(), "day");

  const moveDateWindow = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (!canMoveDateBackward) {
        return;
      }
      const nextStart = dateStart.subtract(7, "day");
      const minDate = dayjs().startOf("day");
      setDateStart(nextStart.isBefore(minDate) ? minDate : nextStart);
      return;
    }

    setDateStart((prev) => prev.add(7, "day"));
  };

  const getShowtimeTitle = (movie: GroupedMovieShowtime) => {
    const localizedTitle = getLocalizedMovieTitle(
      { title: movie.movieTitle || "", originalTitle: movie.originalTitle || "" },
      currentLanguage,
    );

    if (!movie.movieTitle || !movie.originalTitle || movie.movieTitle === movie.originalTitle) {
      return localizedTitle || movie.movieTitle || movie.originalTitle || "-";
    }

    return `${movie.movieTitle} - ${movie.originalTitle}`;
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-gray-800">
      <TopBar />
      <Header />

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">{t("customer.all_cinemas.title")}</h1>

          {/* LOCATION SELECTOR */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-base font-bold text-gray-800 flex items-center mb-6">
              <span className="material-symbols-outlined text-[#E50914] mr-2">location_on</span>
              {t("customer.all_cinemas.select_city")}
            </h2>

            <div className="flex flex-wrap gap-x-6 gap-y-4 border-b border-gray-100 pb-6 mb-6">
              {PROVINCES.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedProvince(p)}
                  className={`text-[13px] transition-colors hover:text-[#E50914] ${selectedProvince === p ? 'text-[#E50914] font-bold' : 'text-gray-600'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-medium text-gray-800 mb-4">
              {t("customer.all_cinemas.cinemas_at", { city: selectedProvince || "-" })}
            </h3>
            <div className="flex flex-wrap gap-3">
              {loadingCinema ? (
                <div className="w-full flex flex-col items-center justify-center py-6">
                  <div className="loader" aria-label={t("customer.all_cinemas.loading_cinemas")} />
                  <p className="text-sm text-gray-500 m-0 mt-6">{t("customer.all_cinemas.loading_cinemas")}</p>
                </div>
              ) : filteredCinemas.length === 0 ? (
                <p className="text-sm text-gray-500 m-0">{t("customer.all_cinemas.no_cinemas")}</p>
              ) : filteredCinemas.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCinemaId(c.id)}
                  className={`px-4 py-2 border rounded-md text-[13px] transition-colors cursor-pointer ${selectedCinemaId === c.id
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
                <div className="text-[13px] text-gray-500 mb-2 flex items-center">
                  <span className="material-symbols-outlined text-[16px] mr-1">location_on</span>
                  {selectedCinema.address}
                </div>
                <div className="text-[13px] text-gray-500 mb-6 flex items-center">
                  <span className="material-symbols-outlined text-[16px] mr-1">call</span>
                  {selectedCinema.phoneNumber || "-"}
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
                  {t("customer.all_cinemas.schedule_title")}
                </h2>

                <div className="border-b border-gray-200 pb-4 mb-6">
                  <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => moveDateWindow("prev")}
                    disabled={!canMoveDateBackward}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:border-[#cd1e25] hover:text-[#cd1e25] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined block text-[18px] leading-none">chevron_left</span>
                  </button>
                  <div className="flex flex-1 justify-center">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {datesRows.map((date, idx) => {
                    const isSelected = selectedDate.isSame(date, 'day');
                    const dayOfWeek = date.day() === 0 ? 'CN' : `T${date.day() + 1}`;
                    return (
                        <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center min-w-[50px] h-[65px] border rounded transition-colors cursor-pointer ${isSelected
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
                  </div>
                  <button
                    type="button"
                    onClick={() => moveDateWindow("next")}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:border-[#cd1e25] hover:text-[#cd1e25]"
                  >
                    <span className="material-symbols-outlined block text-[18px] leading-none">chevron_right</span>
                  </button>
                  </div>
                </div>

                {loadingShowtime ? (
                  <div className="text-center text-gray-400 text-sm py-8">{t("customer.all_cinemas.loading_showtimes")}</div>
                ) : groupedShowtimes.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">{t("customer.all_cinemas.no_showtimes")}</div>
                ) : (
                  <div className="space-y-6">
                    {pagedGroupedShowtimes.map((movie) => (
                      <div key={`${movie.movieId}-${movie.movieFormat}`} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex gap-4">
                          <div className="w-[96px] shrink-0">
                            <div className="relative w-full rounded-md overflow-hidden bg-gray-100">
                              {movie.ratingCode && (
                                <span className={`absolute left-2 top-2 px-2 py-1 rounded text-xs font-bold ${getRatingTagClass(movie.ratingCode)}`}>
                                  {movie.ratingCode}
                                </span>
                              )}
                              <img src={movie.posterUrl || FALLBACK_POSTER} alt={movie.movieTitle} className="w-full h-[136px] object-cover" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 m-0 mb-1">{getShowtimeTitle(movie)}</h3>
                            <p className="text-base font-semibold text-gray-900 m-0 mb-3">{movie.movieFormat || "-"}</p>
                            <div className="flex flex-wrap gap-2">
                              {movie.slots.map((slot) => (
                                <button
                                  type="button"
                                  key={slot.id}
                                  onClick={() => startBookingForSlot(slot, movie)}
                                  className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-800 hover:border-[#cd1e25] hover:bg-[#cd1e25] hover:text-white transition-colors"
                                >
                                  {formatClock(slot.startTime)} - {slot.screenName || t("customer.all_cinemas.screen_unknown")}
                                </button>
                              ))}
                            </div>
                            <p className="text-sm text-gray-500 m-0 mt-3">
                              {t("customer.all_cinemas.duration_label")}: {movie.durationMins || 0} {t("customer.all_cinemas.minutes")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-end">
                      <PaginationControls
                        currentPage={currentShowtimePage}
                        totalPages={totalShowtimePages}
                        onPrevious={() => setShowtimePage((prev) => Math.max(1, prev - 1))}
                        onNext={() => setShowtimePage((prev) => Math.min(totalShowtimePages, prev + 1))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {selectedCinema && (
            <>
          {/* TICKET PRICE */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 overflow-x-auto">
            <h2 className="text-base font-bold text-gray-800 mb-6">Bảng Giá Vé</h2>

            {/* Standard 2D Table */}
            <div className="mb-8 min-w-[800px]">
              <div className="bg-[#cd1e25] text-white text-center py-2 font-bold text-[13px] rounded-t-lg">TICKET PRICE</div>
              <table className="w-full text-center text-[12px] border-collapse border border-gray-200">
                <thead>
                  <tr>
                    <th className="border border-gray-200 py-3 bg-gray-50/50 w-1/4">From Monday To<br />Sunday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Monday, Tuesday, Thursday</th>
                    <th className="border border-gray-200 py-3 w-[12%]">Happy<br />Wednesday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Friday, Saturday, Sunday,<br />& Public Holiday</th>
                  </tr>
                  <tr className="text-gray-500 font-normal">
                    <th className="border border-gray-200 py-2"></th>
                    <th className="border border-gray-200 py-2 px-2">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2">Members 23<br />Years Old & Under</th>
                    <th className="border border-gray-200 py-2 px-2">Adult</th>
                    <th className="border border-gray-200 py-2"></th>
                    <th className="border border-gray-200 py-2 px-2">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2">Members 23<br />Years Old & Under</th>
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
                    <th className="border border-gray-200 py-3 bg-gray-50/50 w-1/4">From Monday To<br />Sunday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Monday, Tuesday, Thursday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Friday, Saturday, Sunday,<br />& Public Holiday</th>
                  </tr>
                  <tr className="text-gray-500 font-normal">
                    <th className="border border-gray-200 py-2"></th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Members 23<br />Years Old & Under</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Adult</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Members 23<br />Years Old & Under</th>
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
                    <th className="border border-gray-200 py-3 bg-gray-50/50 w-1/4">From Monday To<br />Sunday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Monday, Tuesday, Thursday</th>
                    <th className="border border-gray-200 py-2" colSpan={3}>Friday, Saturday, Sunday,<br />& Public Holiday</th>
                  </tr>
                  <tr className="text-gray-500 font-normal">
                    <th className="border border-gray-200 py-2"></th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Members 23<br />Years Old & Under</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Adult</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Senior, Child</th>
                    <th className="border border-gray-200 py-2 px-2 w-[12.5%]">Members 23<br />Years Old & Under</th>
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
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
