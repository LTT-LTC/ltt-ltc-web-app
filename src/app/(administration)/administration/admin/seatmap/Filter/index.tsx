import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";
import { useEffect, useState } from "react";
import { cinemaService, CinemaOutputDto } from "@/src/services/administration-service/cinema/cinema.service";

const SeatmapFilter = () => {
  const [cinemas, setCinemas] = useState<CinemaOutputDto[]>([]);

  useEffect(() => {
    fetchCinemas();
  }, []);

  const fetchCinemas = async () => {
    try {
      const res = await cinemaService.getCinemaListAsync({ page: 1, fetch: 100 });
      if (res.items) {
        setCinemas(res.items);
      }
    } catch (error) {
      console.error("Failed to load cinemas", error);
    }
  };

  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem phong chieu",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "cinema",
      title: "Rap",
      type: "multiSelect",
      className: "w-[230px]",
      options: cinemas.map(c => ({ label: c.name, value: c.id })),
    },
    {
      key: "type",
      title: "Loai phong",
      type: "multiSelect",
      className: "w-[230px]",
      options: [
        { label: "2D", value: "2D" },
        { label: "3D", value: "3D" },
        { label: "IMAX", value: "IMAX" }
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

export default SeatmapFilter;
