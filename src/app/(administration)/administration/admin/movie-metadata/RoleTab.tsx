"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Briefcase, RefreshCw } from "lucide-react";
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
    LTTDialogFooter
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
import LTTUnsavedChangesDialog from "@/src/@core/component/LTTUnsavedChangesDialog";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { movieService } from "@/src/services/administration-service/movie/movie.service";
import { RoleOutputDto } from "@/src/services/administration-service/movie/role/models/output.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import AdminTablePagination from "../_components/AdminTablePagination";

export default function RoleTab() {
    const { t } = useLocalization();
    const [items, setItems] = useState<RoleOutputDto[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [editing, setEditing] = useState<RoleOutputDto | null>(null);
    const [name, setName] = useState("");

    const listMutation = useLTTMutation<PagedResultDto<RoleOutputDto> | undefined, void>({
        mutationFn: () => movieService.getRolesAsync({ page, fetch: pageSize }),
        onSuccess: (res) => {
            const nextItems = res?.items ?? [];
            setItems(nextItems);
            setTotalCount(res?.totalCount ?? 0);
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.roles.fetch_error"))
    });

    const createMutation = useLTTMutation<RoleOutputDto, { name: string }>({
        mutationFn: (body) => movieService.createRoleAsync(body),
        onSuccess: () => {
            toast.success(t("admin.movie_metadata.common.add_success"));
            setDialogOpen(false);
            setExitConfirmOpen(false);
            setIsDirty(false);
            setPage(1);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.common.add_error"))
    });

    const updateMutation = useLTTMutation<RoleOutputDto, { id: string, name: string }>({
        mutationFn: (input) => movieService.updateRoleAsync(input.id, { name: input.name }),
        onSuccess: () => {
            toast.success(t("admin.movie_metadata.common.update_success"));
            setDialogOpen(false);
            setExitConfirmOpen(false);
            setIsDirty(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.common.update_error"))
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => movieService.deleteRoleAsync(id),
        onSuccess: () => {
            toast.success(t("admin.movie_metadata.common.delete_success"));
            if (items.length === 1 && page > 1) {
                setPage(page - 1);
                // useEffect will trigger refresh due to page dependency
            } else {
                listMutation.mutation();
            }
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.common.delete_error"))
    });

    useEffect(() => {
        listMutation.mutation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading;

    const handleSave = () => {
        if (!name.trim()) return toast.error(t("admin.movie_metadata.common.name_required"));
        if (editing) {
            updateMutation.mutation({ id: editing.id, name });
        } else {
            createMutation.mutation({ name });
        }
    };

    const resetDialog = () => {
        setDialogOpen(false);
        setExitConfirmOpen(false);
        setIsDirty(false);
        setEditing(null);
        setName("");
    };

    const openCreate = () => {
        setEditing(null);
        setName("");
        setIsDirty(false);
        setDialogOpen(true);
    };

    const openEdit = (item: RoleOutputDto) => {
        setEditing(item);
        setName(item.name);
        setIsDirty(false);
        setDialogOpen(true);
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

        resetDialog();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <LTTButton variant="outline" className="gap-2" onClick={() => listMutation.mutation()} loading={listMutation.isLoading}>
                    <RefreshCw className="h-4 w-4" /> {t("admin.movie_metadata.common.refresh")}
                </LTTButton>
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> {t("admin.movie_metadata.roles.add")}
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.movie_metadata.roles.name")}</th>
                            <th className="px-4 py-3 text-right font-semibold">{t("admin.movie_metadata.common.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={2} className="py-12 text-center text-muted-foreground-shadcn">
                                    {t("admin.movie_metadata.roles.loading")}
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="py-12 text-center text-muted-foreground-shadcn">
                                    {t("admin.movie_metadata.roles.empty")}
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-primary-shadcn" />
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </LTTButton>
                                            <LTTConfirmDialog
                                                title={t("admin.common.delete_confirm.title")}
                                                description={t("admin.common.delete_confirm.message")}
                                                confirmText={t("admin.common.delete_confirm.ok")}
                                                cancelText={t("admin.common.delete_confirm.cancel")}
                                                onConfirm={() => deleteMutation.mutation(item.id)}
                                                loading={deleteMutation.isLoading}
                                                trigger={
                                                    <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPage(1);
                    setPageSize(size);
                }}
                loading={listMutation.isLoading}
            />

            <LTTDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <LTTDialogContent>
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editing ? t("admin.movie_metadata.roles.edit_title") : t("admin.movie_metadata.roles.create_title")}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-4 space-y-2">
                        <LTTLabel htmlFor="name">{t("admin.movie_metadata.roles.name_label")}</LTTLabel>
                        <LTTInput id="name" value={name} onChange={e => { setIsDirty(true); setName(e.target.value); }} />
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => handleDialogOpenChange(false)}>{t("admin.movie_metadata.common.cancel")}</LTTButton>
                        <LTTButton onClick={handleSave} loading={createMutation.isLoading || updateMutation.isLoading}>
                            {editing ? t("admin.movie_metadata.common.save") : t("admin.movie_metadata.common.create")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTUnsavedChangesDialog
                open={exitConfirmOpen}
                onOpenChange={setExitConfirmOpen}
                title={t("admin.common.unsaved_changes_dialog.title")}
                messageBefore={t("admin.common.unsaved_changes_dialog.message_before")}
                messageHighlight={t("admin.common.unsaved_changes_dialog.message_highlight")}
                messageAfter={t("admin.common.unsaved_changes_dialog.message_after")}
                stayText={t("admin.common.unsaved_changes_dialog.stay")}
                exitText={t("admin.common.unsaved_changes_dialog.exit")}
                onExit={resetDialog}
            />
        </div>
    );
}
