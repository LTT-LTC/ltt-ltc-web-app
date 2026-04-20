"use client";

import ManagerMoviesPage from "../../manager/movies/page";
import DistributionTable from "./DistributionTable";

export default function MoviesPage() {
  return (
    <div className="space-y-8">
      <section>
        <ManagerMoviesPage />
      </section>

      <section className="pt-8 border-t border-border-shadcn">
        <div className="mb-4">
          <h2 className="font-heading text-xl font-bold">Giấy phép Phân phối (Distribution Licenses)</h2>
          <p className="text-sm text-muted-foreground-shadcn">Quản lý thời hạn bản quyền và quyền phân phối phim.</p>
        </div>
        <DistributionTable />
      </section>
    </div>
  );
}
