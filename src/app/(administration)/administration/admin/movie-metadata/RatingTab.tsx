"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck, RefreshCw } from "lucide-react";
import { Popconfirm } from "antd";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogHeader,
    LTTDialogTitle,
    LTTDialogFooter
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { movieService } from "@/src/services/administration-service/movie/movie.service";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { CreateRatingInputDto, UpdateRatingInputDto } from "@/src/services/administration-service/movie/models/input.model";
import { RatingOutputDto } from "@/src/services/administration-service/movie/models/output.model";
import { useLocalization } from "@/src/@core/hooks/use-localization";

let ratingItemsCache: RatingOutputDto[] | null = null;
let ratingItemsRequest: Promise<RatingOutputDto[]> | null = null;

const loadRatingItems = async () => {
    if (ratingItemsCache !== null) {
        return ratingItemsCache;
    }

    if (!ratingItemsRequest) {
        ratingItemsRequest = movieService.getRatingsAsync().then((res) => {
            ratingItemsCache = res?.items ?? [];
            return ratingItemsCache;
        }).finally(() => {
            ratingItemsRequest = null;
        });
    }

    return ratingItemsRequest;
};

export default function RatingTab() {
    const { t } = useLocalization();
    const [items, setItems] = useState<RatingOutputDto[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<RatingOutputDto | null>(null);
    const [form, setForm] = useState<CreateRatingInputDto>({ code: "", name: "", description: "" });

    const listMutation = useLTTMutation<PagedResultDto<RatingOutputDto> | undefined, void>({
        mutationFn: () => movieService.getRatingsAsync(),
        onSuccess: (res) => {
            const nextItems = res?.items ?? [];
            ratingItemsCache = nextItems;
            setItems(nextItems);
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.ratings.fetch_error"))
    });

    const createMutation = useLTTMutation<RatingOutputDto, CreateRatingInputDto>({
        mutationFn: (body) => movieService.createRatingAsync(body),
        onSuccess: () => {
            toast.success(t("admin.movie_metadata.common.add_success"));
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.common.add_error"))
    });

    const updateMutation = useLTTMutation<RatingOutputDto, { id: string, body: UpdateRatingInputDto }>({
        mutationFn: (input) => movieService.updateRatingAsync(input.id, input.body),
        onSuccess: () => {
            toast.success(t("admin.movie_metadata.common.update_success"));
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.common.update_error"))
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => movieService.deleteRatingAsync(id),
        onSuccess: () => {
            toast.success(t("admin.movie_metadata.common.delete_success"));
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.common.delete_error"))
    });

    useEffect(() => {
        let active = true;

        void loadRatingItems().then((nextItems) => {
            if (active) {
                setItems(nextItems);
            }
        });

        return () => {
            active = false;
        };
    }, []);

    const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading;

    const handleSave = () => {
        if (!form.code.trim() || !form.name.trim()) return toast.error(t("admin.movie_metadata.ratings.code_name_required"));
        if (editing) {
            updateMutation.mutation({ id: editing.id, body: { code: form.code, name: form.name, description: form.description } });
        } else {
            createMutation.mutation({ code: form.code, name: form.name, description: form.description });
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ code: "", name: "", description: "" });
        setDialogOpen(true);
    };

    const openEdit = (item: RatingOutputDto) => {
        setEditing(item);
        setForm({ code: item.code, name: item.name, description: item.description || "" });
        setDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <LTTButton variant="outline" className="gap-2" onClick={() => listMutation.mutation()} loading={listMutation.isLoading}>
                    <RefreshCw className="h-4 w-4" /> {t("admin.movie_metadata.common.refresh")}
                </LTTButton>
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> {t("admin.movie_metadata.ratings.add")}
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold w-24">{t("admin.movie_metadata.ratings.code")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.movie_metadata.ratings.name")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.movie_metadata.ratings.description")}</th>
                            <th className="px-4 py-3 text-right font-semibold">{t("admin.movie_metadata.common.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-muted-foreground-shadcn">
                                    {t("admin.movie_metadata.ratings.loading")}
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-muted-foreground-shadcn">
                                    {t("admin.movie_metadata.ratings.empty")}
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-bold text-primary-shadcn">
                                        <LTTBadge className="bg-brand-600 text-white border-brand-700">{item.code}</LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 font-medium flex items-center gap-2 pt-4">
                                        <ShieldCheck className="h-4 w-4 text-brand-500" />
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">{item.description}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </LTTButton>
                                            <Popconfirm
                                                title={t("admin.common.delete_confirm.title")}
                                                description={t("admin.common.delete_confirm.message")}
                                                okText={t("admin.common.delete_confirm.ok")}
                                                cancelText={t("admin.common.delete_confirm.cancel")}
                                                onConfirm={() => deleteMutation.mutation(item.id)}
                                            >
                                                <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </LTTButton>
                                            </Popconfirm>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <LTTDialogContent>
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editing ? t("admin.movie_metadata.ratings.edit_title") : t("admin.movie_metadata.ratings.create_title")}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <LTTLabel htmlFor="code">{t("admin.movie_metadata.ratings.code_label")}</LTTLabel>
                                <LTTInput id="code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel htmlFor="name">{t("admin.movie_metadata.ratings.display_name_label")}</LTTLabel>
                                <LTTInput id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <LTTLabel htmlFor="desc">{t("admin.movie_metadata.ratings.description_label")}</LTTLabel>
                            <textarea
                                id="desc"
                                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.movie_metadata.common.cancel")}</LTTButton>
                        <LTTButton onClick={handleSave} loading={createMutation.isLoading || updateMutation.isLoading}>
                            {editing ? t("admin.movie_metadata.common.save") : t("admin.movie_metadata.common.create")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </div>
    );
}
