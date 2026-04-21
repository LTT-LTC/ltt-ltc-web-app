"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, ShieldCheck, RefreshCw, Inbox } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogHeader,
    LTTDialogTitle,
    LTTDialogFooter
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import LTTSwitch from "@/src/@core/component/AntD/LTTSwitch";
import {
    LTTSelect,
    LTTSelectContent,
    LTTSelectItem,
    LTTSelectTrigger,
    LTTSelectValue
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { movieService } from "@/src/services/administration-service/movie/movie.service";
import { MovieDistributionOutputDto, MovieOutputDto } from "@/src/services/administration-service/movie/models/output.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import {
    CreateDistributionInputDto,
    UpdateDistributionInputDto,
} from "@/src/services/administration-service/movie/models/input.model";
import { useLocalization } from "@/src/@core/hooks/use-localization";

export default function DistributionTable() {
    const { t, currentLanguage } = useLocalization();
    const [items, setItems] = useState<MovieDistributionOutputDto[]>([]);
    const [movies, setMovies] = useState<MovieOutputDto[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<MovieDistributionOutputDto | null>(null);
    const [page, setPage] = useState(1);
    const [fetch, setFetch] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        movieId: "",
        licenseStartDate: "",
        licenseEndDate: "",
        isExclusive: false
    });
    const [moviesLoaded, setMoviesLoaded] = useState(false);

    const normalizeDistributionPayload = () => ({
        movieId: form.movieId,
        licenseStartDate: form.licenseStartDate || null,
        licenseEndDate: form.licenseEndDate || null,
        isExclusive: form.isExclusive,
    });

    const listMutation = useLTTMutation<PagedResultDto<MovieDistributionOutputDto> | undefined, void>({
        mutationFn: () => movieService.getDistributionsAsync({
            skipCount: (page - 1) * fetch,
            maxResultCount: fetch,
        }),
        onSuccess: (res) => {
            if (res && res.items) {
                setItems(res.items);
                setTotalCount(res.totalCount ?? res.items.length);
                setError(null);
            }
        },
        onError: (err) => {
            const errorMsg = typeof err?.message === "string" && err.message.trim()
                ? err.message
                : t("admin.movies.distribution.fetch_distribution_error");
            setError(errorMsg);
            toast.error(errorMsg);
        }
    });

    const moviesMutation = useLTTMutation<PagedResultDto<MovieOutputDto> | undefined, void>({
        mutationFn: () => movieService.getMovieListAsync({ page: 1, fetch: 1000 }),
        onSuccess: (res) => {
            if (res && res.items) {
                setMovies(res.items);
                setMoviesLoaded(true);
            }
        },
        onError: (err) => toast.error(err.message || t("admin.movies.distribution.fetch_movie_error"))
    });

    const createMutation = useLTTMutation<MovieDistributionOutputDto, CreateDistributionInputDto>({
        mutationFn: (body) => movieService.createDistributionAsync(body),
        onSuccess: () => {
            toast.success(t("admin.movies.distribution.create_success"));
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movies.distribution.create_error"))
    });

    const updateMutation = useLTTMutation<MovieDistributionOutputDto, { id: string, body: UpdateDistributionInputDto }>({
        mutationFn: (input) => movieService.updateDistributionAsync(input.id, input.body),
        onSuccess: () => {
            toast.success(t("admin.movies.distribution.update_success"));
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movies.distribution.update_error"))
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => movieService.deleteDistributionAsync(id),
        onSuccess: () => {
            toast.success(t("admin.movies.distribution.delete_success"));
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movies.distribution.delete_error"))
    });

    useEffect(() => {
        listMutation.mutation();
    }, [page, fetch]);

    const handleSave = () => {
        if (!form.movieId) return toast.error(t("admin.movies.distribution.select_movie_required"));
        const payload = normalizeDistributionPayload();

        if (editing) {
            const { movieId, ...body } = payload; // Don't update movieId
            updateMutation.mutation({ id: editing.id, body });
        } else {
            createMutation.mutation(payload);
        }
    };

    const openCreate = () => {
        if (!moviesLoaded && !moviesMutation.isLoading) {
            moviesMutation.mutation();
        }
        setEditing(null);
        setForm({ movieId: "", licenseStartDate: "", licenseEndDate: "", isExclusive: false });
        setDialogOpen(true);
    };

    const openEdit = (item: MovieDistributionOutputDto) => {
        if (!moviesLoaded && !moviesMutation.isLoading) {
            moviesMutation.mutation();
        }
        setEditing(item);
        setForm({
            movieId: item.movieId,
            licenseStartDate: item.licenseStartDate ? item.licenseStartDate.split('T')[0] : "",
            licenseEndDate: item.licenseEndDate ? item.licenseEndDate.split('T')[0] : "",
            isExclusive: item.isExclusive
        });
        setDialogOpen(true);
    };

    const fetchData = () => {
        listMutation.mutation();
    };

    useEffect(() => {
        if (!dialogOpen || !!editing || form.movieId || movies.length === 0) {
            return;
        }

        setForm((prev) => ({ ...prev, movieId: movies[0].id }));
    }, [dialogOpen, editing, form.movieId, movies]);

    const totalPages = Math.max(1, Math.ceil((totalCount || items.length) / fetch));
    const dateLocale = currentLanguage === "en" ? "en-US" : "vi-VN";

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <LTTButton variant="outline" className="gap-2" onClick={fetchData} loading={listMutation.isLoading}>
                    <RefreshCw className="h-4 w-4" /> {t("admin.movies.distribution.refresh")}
                </LTTButton>
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> {t("admin.movies.distribution.add")}
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.movies.distribution.movie_name")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.movies.distribution.start_date")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.movies.distribution.end_date")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.movies.distribution.exclusive")}</th>
                            <th className="px-4 py-3 text-right font-semibold">{t("admin.movies.distribution.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {error ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center">
                                    <div className="space-y-2">
                                        <p className="text-sm text-destructive font-medium">{error}</p>
                                        <LTTButton
                                            size="sm"
                                            onClick={fetchData}
                                            loading={listMutation.isLoading}
                                            className="mx-auto"
                                        >
                                            {t("admin.movies.distribution.retry")}
                                        </LTTButton>
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-muted-foreground-shadcn">
                                    {listMutation.isLoading ? t("admin.movies.distribution.loading") : t("admin.movies.distribution.empty")}
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">{item.movieTitle}</td>
                                    <td className="px-4 py-3 text-xs">
                                        {item.licenseStartDate ? new Date(item.licenseStartDate).toLocaleDateString(dateLocale) : "---"}
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        {item.licenseEndDate ? new Date(item.licenseEndDate).toLocaleDateString(dateLocale) : "---"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.isExclusive ? (
                                            <LTTBadge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t("admin.movies.distribution.exclusive_badge")}</LTTBadge>
                                        ) : (
                                            <LTTBadge variant="outline">{t("admin.movies.distribution.standard_badge")}</LTTBadge>
                                        )}
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

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border-shadcn bg-card px-4 py-3 my-3">
                <div className="text-sm text-muted-foreground-shadcn">
                    {t("admin.movies.distribution.total_records", { count: totalCount || items.length })}
                </div>
                <div className="flex items-center gap-2">
                    <LTTSelect value={String(fetch)} onValueChange={(value) => {
                        setPage(1);
                        setFetch(Number(value));
                    }}>
                        <LTTSelectTrigger className="w-24">
                            <LTTSelectValue />
                        </LTTSelectTrigger>
                        <LTTSelectContent>
                            <LTTSelectItem value="10">10</LTTSelectItem>
                            <LTTSelectItem value="20">20</LTTSelectItem>
                            <LTTSelectItem value="50">50</LTTSelectItem>
                        </LTTSelectContent>
                    </LTTSelect>
                    <LTTButton
                        variant="outline"
                        onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                        disabled={page === 1 || listMutation.isLoading}
                    >
                        {t("admin.movies.distribution.previous")}
                    </LTTButton>
                    <span className="text-sm">{t("admin.movies.distribution.page", { page, totalPages })}</span>
                    <LTTButton
                        variant="outline"
                        onClick={() => setPage((currentPage) => currentPage + 1)}
                        disabled={page >= totalPages || listMutation.isLoading}
                    >
                        {t("admin.movies.distribution.next")}
                    </LTTButton>
                </div>
            </div>

            <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <LTTDialogContent className="sm:max-w-md">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editing ? t("admin.movies.distribution.edit_title") : t("admin.movies.distribution.create_title")}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <LTTLabel>{t("admin.movies.distribution.movie_label")}</LTTLabel>
                                <LTTButton
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1"
                                    onClick={() => moviesMutation.mutation()}
                                    loading={moviesMutation.isLoading}
                                    disabled={!!editing}
                                >
                                    <RefreshCw className="h-3.5 w-3.5" /> {t("admin.movies.distribution.load_movie_list")}
                                </LTTButton>
                            </div>
                            <LTTSelect
                                value={form.movieId}
                                onValueChange={(v) => setForm({ ...form, movieId: v })}
                                disabled={!!editing}
                            >
                                <LTTSelectTrigger>
                                    <LTTSelectValue placeholder={t("admin.movies.distribution.movie_placeholder")} />
                                </LTTSelectTrigger>
                                <LTTSelectContent>
                                    {moviesMutation.isLoading ? (
                                        <div className="px-3 py-2 text-xs text-muted-foreground-shadcn">{t("admin.movies.distribution.movie_loading")}</div>
                                    ) : movies.length === 0 ? (
                                        <div className="px-3 py-6 flex flex-col items-center justify-center text-center text-muted-foreground-shadcn gap-2">
                                            <Inbox className="h-5 w-5" />
                                            <span className="text-xs">{t("admin.movies.distribution.movie_empty")}</span>
                                        </div>
                                    ) : (
                                        movies.map((m) => (
                                            <LTTSelectItem key={m.id} value={m.id}>{m.title}</LTTSelectItem>
                                        ))
                                    )}
                                </LTTSelectContent>
                            </LTTSelect>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.movies.distribution.license_start_date")}</LTTLabel>
                                <LTTInput type="date" value={form.licenseStartDate} onChange={e => setForm({ ...form, licenseStartDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.movies.distribution.license_end_date")}</LTTLabel>
                                <LTTInput type="date" value={form.licenseEndDate} onChange={e => setForm({ ...form, licenseEndDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <LTTSwitch
                                checked={form.isExclusive}
                                onChange={(v) => setForm({ ...form, isExclusive: v })}
                            />
                            <LTTLabel>{t("admin.movies.distribution.exclusive_toggle")}</LTTLabel>
                        </div>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.movies.distribution.cancel")}</LTTButton>
                        <LTTButton onClick={handleSave} loading={createMutation.isLoading || updateMutation.isLoading}>
                            {editing ? t("admin.movies.distribution.save") : t("admin.movies.distribution.grant")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </div>
    );
}
