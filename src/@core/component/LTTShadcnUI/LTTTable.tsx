import * as React from "react";

import { cn } from "@/src/@core/utils/cn";

const LTTTable = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
);
LTTTable.displayName = "LTTTable";

const LTTTableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b border-border-shadcn", className)} {...props} />,
);
LTTTableHeader.displayName = "LTTTableHeader";

const LTTTableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
);
LTTTableBody.displayName = "LTTTableBody";

const LTTTableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t border-border-shadcn bg-muted-shadcn/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  ),
);
LTTTableFooter.displayName = "LTTTableFooter";

const LTTTableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-b border-border-shadcn transition-colors data-[state=selected]:bg-muted-shadcn hover:bg-muted-shadcn/50", className)}
      {...props}
    />
  ),
);
LTTTableRow.displayName = "LTTTableRow";

const LTTTableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground-shadcn [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  ),
);
LTTTableHead.displayName = "LTTTableHead";

const LTTTableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
  ),
);
LTTTableCell.displayName = "LTTTableCell";

const LTTTableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground-shadcn", className)} {...props} />
  ),
);
LTTTableCaption.displayName = "LTTTableCaption";

export { LTTTable, LTTTableHeader, LTTTableBody, LTTTableFooter, LTTTableHead, LTTTableRow, LTTTableCell, LTTTableCaption };
