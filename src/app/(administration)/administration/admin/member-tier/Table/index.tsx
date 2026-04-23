"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, RefreshCw, Pencil } from "lucide-react";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogHeader,
    LTTDialogTitle,
    LTTDialogDescription,
    LTTDialogFooter,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
import LTTUnsavedChangesDialog from "@/src/@core/component/LTTUnsavedChangesDialog";
import AdminTablePagination from "../../_components/AdminTablePagination";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { memberTierService } from "@/src/services/administration-service/member-tier/member-tier.service";
import { CreateMemberTierInputDto, UpdateMemberTierInputDto } from "@/src/services/administration-service/member-tier/models/input.model";
import { MemberTierOutputDto } from "@/src/services/administration-service/member-tier/models/output.model";

type MemberTierFormState = {
    name: string;
    minPoints: string;
    discountPercentage: string;
    pointMultiplier: string;
};

const createEmptyForm = (): MemberTierFormState => ({
    name: "",
    minPoints: "0",
    discountPercentage: "0",
    pointMultiplier: "1",
});

export default function MemberTierListPage() {
    const [items, setItems] = useState<MemberTierOutputDto[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [editing, setEditing] = useState<MemberTierOutputDto | null>(null);
    const [form, setForm] = useState<MemberTierFormState>(createEmptyForm());

    const listMutation = useLTTMutation<PagedResultDto<MemberTierOutputDto>, { skipCount: number; maxResultCount: number }>({
        mutationFn: (params) => memberTierService.getMemberTierListAsync(params),
        onSuccess: (res) => {
            setItems(res.items || []);
            setTotalCount(res.totalCount || 0);
        },
        onError: (err) => toast.error(err.message || "Failed to fetch member tiers."),
    });

    const createMutation = useLTTMutation<MemberTierOutputDto, CreateMemberTierInputDto>({
        mutationFn: (body) => memberTierService.createMemberTierAsync(body),
        onSuccess: () => {
            toast.success("Member tier created successfully.");
            closeDialog();
            fetchData();
        },
        onError: (err) => toast.error(err.message || "Failed to create member tier."),
    });

    const updateMutation = useLTTMutation<MemberTierOutputDto, { id: string; body: UpdateMemberTierInputDto }>({
        mutationFn: (input) => memberTierService.updateMemberTierAsync(input.id, input.body),
        onSuccess: () => {
            toast.success("Member tier updated successfully.");
            closeDialog();
            fetchData();
        },
        onError: (err) => toast.error(err.message || "Failed to update member tier."),
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => memberTierService.deleteMemberTierAsync(id),
        onSuccess: () => {
            toast.success("Member tier deleted successfully.");
            fetchData();
        },
        onError: (err) => toast.error(err.message || "Failed to delete member tier."),
    });

    const fetchData = () => {
        listMutation.mutation({
            skipCount: (page - 1) * pageSize,
            maxResultCount: pageSize,
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const filteredItems = useMemo(() => {
        const keyword = debouncedSearch.trim().toLowerCase();
        if (!keyword) return items;

        return items.filter((item) => {
            return (
                item.name.toLowerCase().includes(keyword) ||
                String(item.minPoints).includes(keyword) ||
                String(item.discountPercentage).includes(keyword) ||
                String(item.pointMultiplier).includes(keyword)
            );
        });
    }, [items, debouncedSearch]);

    const closeDialog = () => {
        setDialogOpen(false);
        setExitConfirmOpen(false);
        setIsDirty(false);
        setEditing(null);
        setForm(createEmptyForm());
    };

    const handleDialogOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setDialogOpen(true);
            return;
        }

        if (isDirty) {
            setExitConfirmOpen(true);
            return;
        }

        closeDialog();
    };

    const openCreate = () => {
        setEditing(null);
        setForm(createEmptyForm());
        setIsDirty(false);
        setExitConfirmOpen(false);
        setDialogOpen(true);
    };

    const openEdit = (item: MemberTierOutputDto) => {
        setEditing(item);
        setForm({
            name: item.name || "",
            minPoints: String(item.minPoints ?? 0),
            discountPercentage: String(item.discountPercentage ?? 0),
            pointMultiplier: String(item.pointMultiplier ?? 1),
        });
        setIsDirty(false);
        setExitConfirmOpen(false);
        setDialogOpen(true);
    };

    const handleSave = () => {
        if (!form.name.trim()) {
            toast.error("Tier name is required.");
            return;
        }

        const payload: CreateMemberTierInputDto = {
            name: form.name.trim(),
            minPoints: Number(form.minPoints),
            discountPercentage: Number(form.discountPercentage),
            pointMultiplier: Number(form.pointMultiplier),
        };

        if (editing) {
            updateMutation.mutation({ id: editing.id, body: payload as UpdateMemberTierInputDto });
        } else {
            createMutation.mutation(payload);
        }
    };

    const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">Member Tier</h1>
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Create Tier
                </LTTButton>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder="Search member tier..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <LTTButton variant="outline" className="gap-2" onClick={fetchData} loading={listMutation.isLoading}>
                    <RefreshCw className="h-4 w-4" /> Refresh
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">Tier Name</th>
                            <th className="px-4 py-3 text-right font-semibold">Min Points</th>
                            <th className="px-4 py-3 text-right font-semibold">Discount (%)</th>
                            <th className="px-4 py-3 text-right font-semibold">Point Multiplier</th>
                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-muted-foreground-shadcn">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-muted-foreground-shadcn">
                                    No member tiers found.
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-semibold">{item.name}</td>
                                    <td className="px-4 py-3 text-right">{item.minPoints.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">{item.discountPercentage}</td>
                                    <td className="px-4 py-3 text-right">{item.pointMultiplier}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </LTTButton>
                                            <LTTConfirmDialog
                                                title="Delete member tier"
                                                description={`Delete tier "${item.name}"?`}
                                                confirmText="Delete"
                                                cancelText="Cancel"
                                                onConfirm={() => deleteMutation.mutation(item.id)}
                                                loading={deleteMutation.isLoading}
                                                trigger={
                                                    <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </LTTButton>
                                                }
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AdminTablePagination
                totalCount={totalCount}
                page={page}
                pageSize={pageSize}
                loading={listMutation.isLoading}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPage(1);
                    setPageSize(size);
                }}
            />

            <LTTDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-xl p-0 gap-0 grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] sm:max-h-[90vh]">
                    <LTTDialogHeader className="px-6 pt-6 pb-4 border-b border-border-shadcn">
                        <LTTDialogTitle>{editing ? "Edit Member Tier" : "Create Member Tier"}</LTTDialogTitle>
                        <LTTDialogDescription>
                            {editing ? "Update member tier settings." : "Create a new member tier."}
                        </LTTDialogDescription>
                    </LTTDialogHeader>
                    <div className="overflow-y-auto px-6 py-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <LTTLabel>Tier Name</LTTLabel>
                                <LTTInput value={form.name} onChange={(e) => { setIsDirty(true); setForm({ ...form, name: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Min Points</LTTLabel>
                                <LTTInput type="number" value={form.minPoints} onChange={(e) => { setIsDirty(true); setForm({ ...form, minPoints: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Discount Percentage</LTTLabel>
                                <LTTInput type="number" value={form.discountPercentage} onChange={(e) => { setIsDirty(true); setForm({ ...form, discountPercentage: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Point Multiplier</LTTLabel>
                                <LTTInput type="number" step="0.01" value={form.pointMultiplier} onChange={(e) => { setIsDirty(true); setForm({ ...form, pointMultiplier: e.target.value }); }} />
                            </div>
                        </div>
                    </div>
                    <LTTDialogFooter className="px-6 py-4 border-t border-border-shadcn">
                        <LTTButton variant="outline" onClick={() => handleDialogOpenChange(false)}>Cancel</LTTButton>
                        <LTTButton onClick={handleSave} loading={createMutation.isLoading || updateMutation.isLoading}>
                            {editing ? "Save changes" : "Create tier"}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTUnsavedChangesDialog
                open={exitConfirmOpen}
                onOpenChange={setExitConfirmOpen}
                title="Unsaved changes"
                messageBefore="You have "
                messageHighlight="unsaved changes"
                messageAfter=". Do you want to exit without saving?"
                stayText="Stay"
                exitText="Exit"
                onExit={closeDialog}
            />
        </div>
    );
}
