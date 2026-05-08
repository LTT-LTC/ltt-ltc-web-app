"use client";

import { useRef } from "react";
import { Plus, RefreshCw } from "lucide-react";
import ManagerMoviesPage from "../../manager/movies/page";
import DistributionTable from "./DistributionTable";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";

export default function MoviesPage() {
  const { t } = useLocalization();
  const distributionRef = useRef<{ openCreate: () => void; refresh: () => void }>(null);

  return (
    <div className="space-y-8">
      <section>
        <ManagerMoviesPage />
      </section>

      <section className="pt-8 border-t border-border-shadcn">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold">{t("admin.movies.distribution.section_title")}</h2>
            <p className="text-sm text-muted-foreground-shadcn">{t("admin.movies.distribution.section_description")}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <LTTButton className="gap-2" onClick={() => distributionRef.current?.openCreate()}>
              <Plus className="h-4 w-4" /> {t("admin.movies.distribution.add")}
            </LTTButton>
            <LTTButton variant="outline" className="gap-2" onClick={() => distributionRef.current?.refresh()}>
              <RefreshCw className="h-4 w-4" /> {t("admin.movies.distribution.refresh")}
            </LTTButton>
          </div>
        </div>
        <DistributionTable ref={distributionRef} />
      </section>
    </div>
  );
}
