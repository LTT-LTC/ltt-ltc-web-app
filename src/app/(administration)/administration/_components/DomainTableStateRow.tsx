type DomainTableState = "loading" | "empty" | "error";

interface DomainTableStateRowProps {
  state: DomainTableState;
  colSpan: number;
  loadingText?: string;
  emptyText?: string;
  errorText?: string;
  className?: string;
}

const defaultLoadingText = "Đang tải dữ liệu...";
const defaultEmptyText = "Không có dữ liệu";
const defaultErrorText = "Có lỗi xảy ra. Vui lòng thử lại.";

export default function DomainTableStateRow({
  state,
  colSpan,
  loadingText = defaultLoadingText,
  emptyText = defaultEmptyText,
  errorText = defaultErrorText,
  className = "py-12 text-center text-muted-foreground-shadcn",
}: DomainTableStateRowProps) {
  if (state === "loading") {
    return (
      <tr>
        <td colSpan={colSpan} className={className}>
          <div className="flex flex-col items-center justify-center gap-3">
            <img
              src="/images/main/LTTAppLoading.gif"
              alt={loadingText}
              className="h-10 w-10 object-contain"
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={colSpan} className={className}>
        {state === "empty" ? emptyText : errorText}
      </td>
    </tr>
  );
}
