"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Eye } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
  LTTSelect,
  LTTSelectContent,
  LTTSelectItem,
  LTTSelectTrigger,
  LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import {
  LTTDialog,
  LTTDialogContent,
  LTTDialogHeader,
  LTTDialogTitle,
  LTTDialogFooter,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { LTTTextarea } from "@/src/@core/component/LTTShadcnUI/LTTTextarea";
import { formatDateTimeGmt7 } from "@/src/@core/utils/date";
import { toast } from "sonner";
import { Incident, mockIncidents, mockStaff } from "@/src/@core/const/mock/adminMockData";

const typeLabel: Record<string, string> = {
  complaint: "Khiếu nại",
  feedback: "Góp ý",
  inquiry: "Hỏi đáp",
  technical: "Kỹ thuật",
  refund_request: "Yêu cầu hoàn tiền",
};
const typeColor: Record<string, string> = {
  complaint: "bg-red-100 text-red-700",
  feedback: "bg-green-100 text-green-700",
  inquiry: "bg-blue-100 text-blue-700",
  technical: "bg-amber-100 text-amber-700",
  refund_request: "bg-purple-100 text-purple-700",
};
const priorityColor: Record<string, string> = {
  low: "bg-muted-shadcn text-muted-foreground-shadcn",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};
const statusColor: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-muted-shadcn text-muted-foreground-shadcn",
};
const statusLabel: Record<string, string> = {
  open: "Mới",
  in_progress: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
};

export default function CRMPage() {
  const [items, setItems] = useState<Incident[]>(mockIncidents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewItem, setViewItem] = useState<Incident | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Incident | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    type: "complaint" as Incident["type"],
    subject: "",
    description: "",
    cinemaName: "",
    priority: "medium" as Incident["priority"],
    status: "open" as Incident["status"],
    assignedTo: "",
  });

  const filtered = useMemo(() => {
    let list = items;
    if (statusFilter !== "all")
      list = list.filter((i) => i.status === statusFilter);
    if (typeFilter !== "all") list = list.filter((i) => i.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.subject.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, search, statusFilter, typeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      type: "complaint",
      subject: "",
      description: "",
      cinemaName: "",
      priority: "medium",
      status: "open",
      assignedTo: "",
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.subject.trim()) {
      toast.error("Tiêu đề không được để trống");
      return;
    }
    const now = formatDateTimeGmt7();
    if (editing) {
      setItems((p) =>
        p.map((i) => (i.id === editing.id ? { ...i, ...form, updatedAt: now } : i))
      );
      toast.success("Cập nhật thành công");
    } else {
      setItems((p) => [
        ...p,
        {
          id: `INC-${String(p.length + 1).padStart(3, "0")}`,
          ...form,
          cinemaId: "all",
          createdAt: now,
          updatedAt: now,
        },
      ]);
      toast.success("Tạo mới thành công");
    }
    setDialogOpen(false);
  };

  const updateStatus = (id: string, status: Incident["status"]) => {
    const now = formatDateTimeGmt7();
    setItems((p) =>
      p.map((i) => (i.id === id ? { ...i, status, updatedAt: now } : i))
    );
    toast.success(`Cập nhật trạng thái: ${statusLabel[status]}`);
    if (viewItem?.id === id)
      setViewItem((v) => (v ? { ...v, status, updatedAt: now } : null));
  };

  const countByStatus = (s: string) => items.filter((i) => i.status === s).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">CRM & Sự cố</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Tạo sự cố
        </LTTButton>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {(["open", "in_progress", "resolved", "closed"] as const).map((s) => (
          <div
            key={s}
            className="rounded-lg border border-border-shadcn bg-card p-3 cursor-pointer hover:bg-muted-shadcn/30"
            onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
          >
            <p className="text-xs text-muted-foreground-shadcn">{statusLabel[s]}</p>
            <p className="text-2xl font-bold">{countByStatus(s)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm theo ID, tiêu đề, khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <LTTSelect value={statusFilter} onValueChange={setStatusFilter}>
          <LTTSelectTrigger className="w-44">
            <LTTSelectValue placeholder="Trạng thái" />
          </LTTSelectTrigger>
          <LTTSelectContent>
            <LTTSelectItem value="all">Tất cả</LTTSelectItem>
            {Object.entries(statusLabel).map(([k, v]) => (
              <LTTSelectItem key={k} value={k}>
                {v}
              </LTTSelectItem>
            ))}
          </LTTSelectContent>
        </LTTSelect>
        <LTTSelect value={typeFilter} onValueChange={setTypeFilter}>
          <LTTSelectTrigger className="w-44">
            <LTTSelectValue placeholder="Loại" />
          </LTTSelectTrigger>
          <LTTSelectContent>
            <LTTSelectItem value="all">Tất cả loại</LTTSelectItem>
            {Object.entries(typeLabel).map(([k, v]) => (
              <LTTSelectItem key={k} value={k}>
                {v}
              </LTTSelectItem>
            ))}
          </LTTSelectContent>
        </LTTSelect>
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="px-4 py-3 text-left font-semibold">Mã</th>
              <th className="px-4 py-3 text-left font-semibold">Khách hàng</th>
              <th className="px-4 py-3 text-left font-semibold">Tiêu đề</th>
              <th className="px-4 py-3 text-left font-semibold">Loại</th>
              <th className="px-4 py-3 text-left font-semibold">Ưu tiên</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-left font-semibold">Phụ trách</th>
              <th className="px-4 py-3 text-left font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground-shadcn">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30">
                  <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3 font-medium">{item.customerName}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{item.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColor[item.type]}`}>
                      {typeLabel[item.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityColor[item.priority]}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[item.status]}`}>
                      {statusLabel[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{item.assignedTo || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground-shadcn">{item.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(item)}>
                        <Eye className="h-4 w-4" />
                      </LTTButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LTTDialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>Chi tiết sự cố #{viewItem?.id}</LTTDialogTitle>
          </LTTDialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground-shadcn">Khách hàng:</span>{" "}
                  <strong>{viewItem.customerName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground-shadcn">Email:</span>{" "}
                  {viewItem.customerEmail}
                </div>
                <div>
                  <span className="text-muted-foreground-shadcn">SĐT:</span>{" "}
                  {viewItem.customerPhone}
                </div>
                <div>
                  <span className="text-muted-foreground-shadcn">Rạp:</span>{" "}
                  {viewItem.cinemaName}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">{viewItem.subject}</p>
                <p className="text-sm text-muted-foreground-shadcn">{viewItem.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground-shadcn">Cập nhật trạng thái:</span>
                {(["open", "in_progress", "resolved", "closed"] as const).map((s) => (
                  <LTTButton
                    key={s}
                    size="sm"
                    variant={viewItem.status === s ? "default" : "outline"}
                    className="text-xs h-7"
                    onClick={() => updateStatus(viewItem.id, s)}
                  >
                    {statusLabel[s]}
                  </LTTButton>
                ))}
              </div>
            </div>
          )}
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>Tạo sự cố mới</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <LTTLabel>Khách hàng *</LTTLabel>
              <LTTInput value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <LTTLabel>Email</LTTLabel>
              <LTTInput value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
            </div>
            <div className="space-y-2">
              <LTTLabel>SĐT</LTTLabel>
              <LTTInput value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <LTTLabel>Loại</LTTLabel>
              <LTTSelect value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {Object.entries(typeLabel).map(([k, v]) => (
                    <LTTSelectItem key={k} value={k}>
                      {v}
                    </LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Tiêu đề *</LTTLabel>
              <LTTInput value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Mô tả</LTTLabel>
              <LTTTextarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <LTTLabel>Ưu tiên</LTTLabel>
              <LTTSelect value={form.priority} onValueChange={(v: any) => setForm({ ...form, priority: v })}>
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="low">Low</LTTSelectItem>
                  <LTTSelectItem value="medium">Medium</LTTSelectItem>
                  <LTTSelectItem value="high">High</LTTSelectItem>
                  <LTTSelectItem value="urgent">Urgent</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2">
              <LTTLabel>Phụ trách</LTTLabel>
              <LTTSelect value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder="Chọn nhân viên" />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {mockStaff.map((s) => (
                    <LTTSelectItem key={s.id} value={s.fullname}>
                      {s.fullname}
                    </LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </LTTButton>
            <LTTButton onClick={save}>Tạo mới</LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}

