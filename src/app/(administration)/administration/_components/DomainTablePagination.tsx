"use client";

import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import {
  LTTSelect,
  LTTSelectContent,
  LTTSelectItem,
  LTTSelectTrigger,
  LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";

type DomainTablePaginationProps = {
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
  pageSizeOptions?: number[];
  totalLabel?: (totalCount: number) => string;
  pageLabel?: (page: number, totalPages: number) => string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function DomainTablePagination({
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  totalLabel = (count) => `Total: ${count}`,
  pageLabel = (currentPage, totalPages) => `Page ${currentPage} / ${totalPages}`,
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
}: DomainTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border border-border-shadcn bg-card px-4 py-3 my-3 ${className || ""}`.trim()}
    >
      <div className="text-sm text-muted-foreground-shadcn">
        {totalLabel(totalCount)}
      </div>
      <div className="flex items-center gap-2">
        <LTTSelect
          value={String(pageSize)}
          onValueChange={(value) => {
            onPageSizeChange(Number(value));
          }}
        >
          <LTTSelectTrigger className="w-24">
            <LTTSelectValue />
          </LTTSelectTrigger>
          <LTTSelectContent>
            {pageSizeOptions.map((option) => (
              <LTTSelectItem key={option} value={String(option)}>
                {option}
              </LTTSelectItem>
            ))}
          </LTTSelectContent>
        </LTTSelect>
        <LTTButton
          variant="outline"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
        >
          {previousLabel}
        </LTTButton>
        <span className="text-sm">{pageLabel(page, totalPages)}</span>
        <LTTButton
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
        >
          {nextLabel}
        </LTTButton>
      </div>
    </div>
  );
}
