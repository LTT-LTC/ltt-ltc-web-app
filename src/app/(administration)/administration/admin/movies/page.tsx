"use client";

import ManagerMoviesPage from "../../manager/movies/page";
import DistributionTable from "./DistributionTable";
import { useLocalization } from "@/src/@core/hooks/use-localization";

export default function MoviesPage() {
  const { t } = useLocalization();

  return (
    <div className="space-y-8">
      <section>
        <ManagerMoviesPage />
      </section>

      <section className="pt-8 border-t border-border-shadcn">
        <div className="mb-4">
          <h2 className="font-heading text-xl font-bold">{t("admin.movies.distribution.section_title")}</h2>
          <p className="text-sm text-muted-foreground-shadcn">{t("admin.movies.distribution.section_description")}</p>
        </div>
        <DistributionTable />
      </section>
    </div>
  );
}
