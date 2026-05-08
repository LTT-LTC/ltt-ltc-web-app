"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "sonner";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";
import { CustomerShowtimeOutputDto } from "@/src/services/customer-service/showtime/models/output.model";
import { customerCinemaService } from "@/src/services/customer-service/cinema/cinema.service";
import { CustomerCinemaOutputDto } from "@/src/services/customer-service/cinema/models/output.model";

const DATE_RANGE_DAYS = 7;

const mapShowtimeDateInput = (value: Dayjs) => value.format("YYYY-MM-DD");
const formatClock = (value: string) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("HH:mm") : value;
};

interface BookingShowtimePickerModalProps {
  open: boolean;
  movieId: string;
  movieTitle: string;
  onClose: () => void;
  onSelectShowtime: (showtime: CustomerShowtimeOutputDto) => void;
}

export default function BookingShowtimePickerModal({
  open,
  movieId,
  movieTitle,
  onClose,
  onSelectShowtime,
}: BookingShowtimePickerModalProps) {
  const [weekStart, setWeekStart] = useState(dayjs().startOf("day"));
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [showtimeLoading, setShowtimeLoading] = useState(false);
  const [showtimes, setShowtimes] = useState<CustomerShowtimeOutputDto[]>([]);
  const [cinemaLookup, setCinemaLookup] = useState<Record<string, CustomerCinemaOutputDto>>({});
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");

  const bookingDates = useMemo(
    () => Array.from({ length: DATE_RANGE_DAYS }, (_, index) => weekStart.add(index, "day")),
    [weekStart],
  );
  const canMoveBookingWeekBackward = weekStart.isAfter(dayjs().startOf("day"), "day");
  const movieShowtimes = useMemo(
    () => showtimes.filter((item) => item.movieId === movieId),
    [showtimes, movieId],
  );
  const groupedByCinema = useMemo(() => {
    const grouped = new Map<string, CustomerShowtimeOutputDto[]>();
    movieShowtimes.forEach((item) => {
      if (!grouped.has(item.cinemaId)) grouped.set(item.cinemaId, []);
      grouped.get(item.cinemaId)?.push(item);
    });
    return grouped;
  }, [movieShowtimes]);

  const availableCityNames = useMemo(() => {
    const names = new Set<string>();
    groupedByCinema.forEach((_, cinemaId) => {
      const city = cinemaLookup[cinemaId]?.city?.trim();
      if (city) names.add(city);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [groupedByCinema, cinemaLookup]);

  const cinemasForSelectedCity = useMemo(() => {
    return Array.from(groupedByCinema.keys())
      .map((cinemaId) => cinemaLookup[cinemaId])
      .filter((cinema): cinema is CustomerCinemaOutputDto => !!cinema)
      .filter((cinema) => !selectedCity || cinema.city === selectedCity)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [groupedByCinema, cinemaLookup, selectedCity]);

  useEffect(() => {
    if (!open || !movieId) return;

    let active = true;
    const fetchShowtimeData = async () => {
      setShowtimeLoading(true);
      try {
        const [showtimeResult, cinemas] = await Promise.all([
          customerShowtimeService.getShowtimeListAsync({
            movieId,
            date: mapShowtimeDateInput(selectedDate),
          }),
          customerCinemaService.getCinemaListAsync({ page: 1, pageSize: 300 }),
        ]);

        if (!active) return;
        setShowtimes(showtimeResult);
        const cinemaMap = cinemas.reduce<Record<string, CustomerCinemaOutputDto>>((acc, cinema) => {
          acc[cinema.id] = cinema;
          return acc;
        }, {});
        setCinemaLookup(cinemaMap);
      } catch (err) {
        if (!active) return;
        toast.error(err instanceof Error ? err.message : "Failed to load showtimes");
        setShowtimes([]);
        setCinemaLookup({});
      } finally {
        if (active) setShowtimeLoading(false);
      }
    };

    void fetchShowtimeData();
    return () => {
      active = false;
    };
  }, [open, movieId, selectedDate]);

  useEffect(() => {
    if (!availableCityNames.length) {
      setSelectedCity("");
      setSelectedCinemaId("");
      return;
    }
    if (!selectedCity || !availableCityNames.includes(selectedCity)) {
      setSelectedCity(availableCityNames[0]);
      setSelectedCinemaId("");
    }
  }, [availableCityNames, selectedCity]);

  useEffect(() => {
    const cinemaIds = cinemasForSelectedCity.map((cinema) => cinema.id);
    if (!cinemaIds.length) {
      setSelectedCinemaId("");
      return;
    }
    if (!selectedCinemaId || !cinemaIds.includes(selectedCinemaId)) {
      setSelectedCinemaId(cinemaIds[0]);
    }
  }, [cinemasForSelectedCity, selectedCinemaId]);

  return (
    <LTTModal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1040}
      destroyOnHidden
      centered
      title={
        <div className="px-2 pt-2 pb-1 text-[28px]">
          {movieTitle ? `${movieTitle} — Book Tickets` : "Book Tickets"}
        </div>
      }
      className="booking-modal"
      styles={{
        body: {
          padding: 0,
          maxHeight: "78vh",
          overflowY: "auto",
          background: "#fff",
        },
      }}
    >
      <div className="px-7 pb-7 pt-2">
        <div className="space-y-5">
        <div className="space-y-3 border-b border-gray-200 pb-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">Select date</p>
            <p className="text-xs text-gray-500">{selectedDate.format("DD/MM/YYYY")}</p>
          </div>
          <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!canMoveBookingWeekBackward) return;
              const nextStart = weekStart.subtract(7, "day");
              const minDate = dayjs().startOf("day");
              setWeekStart(nextStart.isBefore(minDate) ? minDate : nextStart);
            }}
            disabled={!canMoveBookingWeekBackward}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition-colors hover:border-[#cd1e25] hover:text-[#cd1e25] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined block text-[18px] leading-none">chevron_left</span>
          </button>
          <div className="flex flex-1 justify-center py-1">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {bookingDates.map((date) => {
              const isSelected = selectedDate.isSame(date, "day");
              return (
                <button
                  key={date.format("YYYY-MM-DD")}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`flex min-w-[76px] flex-col items-center rounded-md border px-2 py-2 transition-all ${isSelected
                    ? "border-[#cd1e25] bg-red-50 text-[#cd1e25]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#cd1e25]"
                    }`}
                >
                  <span className="text-[10px] font-medium uppercase tracking-wide">{date.format("dd")}</span>
                  <span className="text-[22px] font-bold leading-6">{date.format("DD")}</span>
                  <span className="text-[10px] font-medium">{date.format("MM")}</span>
                </button>
              );
            })}
          </div>
          </div>
          <button
            type="button"
            onClick={() => setWeekStart((prev) => prev.add(7, "day"))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition-colors hover:border-[#cd1e25] hover:text-[#cd1e25]"
          >
            <span className="material-symbols-outlined block text-[18px] leading-none">chevron_right</span>
          </button>
          </div>
        </div>

        {showtimeLoading ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Loading showtimes...
          </div>
        ) : movieShowtimes.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            No showtimes for this date.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-3 border-b border-gray-200 pb-5">
              <p className="text-sm font-semibold text-gray-800">City</p>
              <div className="flex flex-wrap gap-2">
              {availableCityNames.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selectedCity === city
                    ? "border-[#cd1e25] bg-[#cd1e25] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#cd1e25] hover:text-[#cd1e25]"
                    }`}
                >
                  {city}
                </button>
              ))}
              </div>
            </div>

            <div className="space-y-3 border-b border-gray-200 pb-5">
              <p className="text-sm font-semibold text-gray-800">Cinema</p>
              <div className="flex flex-wrap gap-2">
              {cinemasForSelectedCity.map((cinema) => (
                <button
                  key={cinema.id}
                  type="button"
                  onClick={() => setSelectedCinemaId(cinema.id)}
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition-all ${selectedCinemaId === cinema.id
                    ? "border-[#cd1e25] bg-red-50 text-[#cd1e25]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#cd1e25] hover:text-[#cd1e25]"
                    }`}
                >
                  {cinema.name}
                </button>
              ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-800">Showtime</p>
              <div className="space-y-3">
              {(groupedByCinema.get(selectedCinemaId) || [])
                .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf())
                .map((showtimeItem) => (
                  <button
                    key={showtimeItem.id}
                    type="button"
                    onClick={() => onSelectShowtime(showtimeItem)}
                    className="mr-2 mb-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-[#cd1e25] hover:bg-[#cd1e25] hover:text-white"
                  >
                    {formatClock(showtimeItem.startTime)} - {showtimeItem.screenName || "Screen"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </LTTModal>
  );
}

