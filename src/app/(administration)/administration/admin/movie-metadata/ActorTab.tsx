"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, User, RefreshCw } from "lucide-react";
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
import { ActorOutputDto } from "@/src/services/administration-service/movie/actor/models/output.model";
import { CreateActorInputDto, UpdateActorInputDto } from "@/src/services/administration-service/movie/actor/models/input.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { useLocalization } from "@/src/@core/hooks/use-localization";

let actorItemsCache: ActorOutputDto[] | null = null;
let actorItemsRequest: Promise<ActorOutputDto[]> | null = null;

const loadActorItems = async () => {
    if (actorItemsCache !== null) {
        return actorItemsCache;
    }

    if (!actorItemsRequest) {
        actorItemsRequest = movieService.getActorsAsync({ page: 1, fetch: 1000 }).then((res) => {
            actorItemsCache = res?.items ?? [];
            return actorItemsCache;
        }).finally(() => {
            actorItemsRequest = null;
        });
    }

    return actorItemsRequest;
};

export default function ActorTab() {
    const { t } = useLocalization();
    const [items, setItems] = useState<ActorOutputDto[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<ActorOutputDto | null>(null);
    const [form, setForm] = useState<CreateActorInputDto>({ name: "" });

    const listMutation = useLTTMutation<PagedResultDto<ActorOutputDto> | undefined, void>({
        mutationFn: () => movieService.getActorsAsync({ page: 1, fetch: 1000 }),
        onSuccess: (res) => {
            const nextItems = res?.items ?? [];
            actorItemsCache = nextItems;
            setItems(nextItems);
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.actors.fetch_error"))
    });

    const createMutation = useLTTMutation<ActorOutputDto, CreateActorInputDto>({
        mutationFn: (body) => movieService.createActorAsync(body),
        onSuccess: () => {
            toast.success(t("admin.movie_metadata.common.add_success"));
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.common.add_error"))
    });

    const updateMutation = useLTTMutation<ActorOutputDto, { id: string, body: UpdateActorInputDto }>({
        mutationFn: (input) => movieService.updateActorAsync(input.id, input.body),
        onSuccess: () => {
            toast.success(t("admin.movie_metadata.common.update_success"));
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.common.update_error"))
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => movieService.deleteActorAsync(id),
        onSuccess: () => {
            toast.success(t("admin.movie_metadata.common.delete_success"));
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.movie_metadata.common.delete_error"))
    });

    useEffect(() => {
        let active = true;

        void loadActorItems().then((nextItems) => {
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
        if (!form.name.trim()) return toast.error(t("admin.movie_metadata.common.name_required"));
        if (editing) {
            updateMutation.mutation({ id: editing.id, body: form });
        } else {
            createMutation.mutation(form);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "" });
        setDialogOpen(true);
    };

    const openEdit = (item: ActorOutputDto) => {
        setEditing(item);
        setForm({ name: item.name });
        setDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <LTTButton variant="outline" className="gap-2" onClick={() => listMutation.mutation()} loading={listMutation.isLoading}>
                    <RefreshCw className="h-4 w-4" /> {t("admin.movie_metadata.common.refresh")}
                </LTTButton>
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> {t("admin.movie_metadata.actors.add")}
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.movie_metadata.actors.name")}</th>
                            <th className="px-4 py-3 text-right font-semibold">{t("admin.movie_metadata.common.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={2} className="py-12 text-center text-muted-foreground-shadcn">
                                    {t("admin.movie_metadata.actors.loading")}
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="py-12 text-center text-muted-foreground-shadcn">
                                    {t("admin.movie_metadata.actors.empty")}
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary-shadcn" />
                                        {item.name}
                                    </td>
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
                        <LTTDialogTitle>{editing ? t("admin.movie_metadata.actors.edit_title") : t("admin.movie_metadata.actors.create_title")}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <LTTLabel htmlFor="name">{t("admin.movie_metadata.actors.name_label")}</LTTLabel>
                            <LTTInput id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
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
