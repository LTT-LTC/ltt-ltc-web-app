"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogFooter,
    LTTDialogHeader,
    LTTDialogTitle,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { LTTTextarea } from "@/src/@core/component/LTTShadcnUI/LTTTextarea";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
import {
    LTTSelect,
    LTTSelectContent,
    LTTSelectItem,
    LTTSelectTrigger,
    LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import AdminPosterDropzone from "@/src/@core/component/LTTManager/AdminPosterDropzone";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { ComboProductLineDto } from "@/src/services/administration-service/product/models/input.model";
import {
    CategoryOutputDto,
    ComboOutputDto,
    ProductOutputDto,
} from "@/src/services/administration-service/product/models/output.model";

const toSafeImageUrl = (value?: string) => {
    const raw = value?.trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) return raw;
    return "";
};

interface ProductFormState {
    name: string;
    productCategoryId: string;
    basePrice: number;
    sellPrice: number;
    description: string;
    imageUrl: string;
    imageFile?: File;
    isActive: boolean;
}

interface CategoryFormState {
    name: string;
    description: string;
    isActive: boolean;
}

interface ComboFormState {
    name: string;
    description: string;
    totalPrice: number;
    isActive: boolean;
    imageUrl: string;
    imageFile?: File;
    products: ComboProductLineDto[];
}

const dialogShellClass =
    "p-0 gap-0 grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] sm:max-h-[90vh]";

interface FnbDialogsProps {
    categories: CategoryOutputDto[];
    products: ProductOutputDto[];
    editingProduct: ProductOutputDto | null;
    editingCategory: CategoryOutputDto | null;
    editingCombo: ComboOutputDto | null;
    productForm: ProductFormState;
    categoryForm: CategoryFormState;
    comboForm: ComboFormState;
    productDialogOpen: boolean;
    categoryDialogOpen: boolean;
    comboDialogOpen: boolean;
    productDeleteDialogOpen: boolean;
    categoryDeleteDialogOpen: boolean;
    comboDeleteDialogOpen: boolean;
    isProductSaving: boolean;
    isCategorySaving: boolean;
    isComboSaving: boolean;
    formatVnd: (amount: number) => string;
    onProductDialogOpenChange: (open: boolean) => void;
    onCategoryDialogOpenChange: (open: boolean) => void;
    onComboDialogOpenChange: (open: boolean) => void;
    onProductDeleteDialogOpenChange: (open: boolean) => void;
    onCategoryDeleteDialogOpenChange: (open: boolean) => void;
    onComboDeleteDialogOpenChange: (open: boolean) => void;
    setProductForm: (updater: (prev: ProductFormState) => ProductFormState) => void;
    setCategoryForm: (updater: (prev: CategoryFormState) => CategoryFormState) => void;
    setComboForm: (updater: (prev: ComboFormState) => ComboFormState) => void;
    onSaveProduct: () => void;
    onSaveCategory: () => void;
    onSaveCombo: () => void;
    onConfirmDeleteProduct: () => void;
    onConfirmDeleteCategory: () => void;
    onConfirmDeleteCombo: () => void;
}

export default function FnbDialogs(props: FnbDialogsProps) {
    const { t } = useLocalization();
    const {
        categories,
        products,
        editingProduct,
        editingCategory,
        editingCombo,
        productForm,
        categoryForm,
        comboForm,
        productDialogOpen,
        categoryDialogOpen,
        comboDialogOpen,
        productDeleteDialogOpen,
        categoryDeleteDialogOpen,
        comboDeleteDialogOpen,
        isProductSaving,
        isCategorySaving,
        isComboSaving,
        formatVnd,
        onProductDialogOpenChange,
        onCategoryDialogOpenChange,
        onComboDialogOpenChange,
        onProductDeleteDialogOpenChange,
        onCategoryDeleteDialogOpenChange,
        onComboDeleteDialogOpenChange,
        setProductForm,
        setCategoryForm,
        setComboForm,
        onSaveProduct,
        onSaveCategory,
        onSaveCombo,
        onConfirmDeleteProduct,
        onConfirmDeleteCategory,
        onConfirmDeleteCombo,
    } = props;

    const [comboRemoveLineIndex, setComboRemoveLineIndex] = useState<number | null>(null);

    const productById = useMemo(
        () =>
            products.reduce<Record<string, ProductOutputDto>>((acc, p) => {
                acc[p.id] = p;
                return acc;
            }, {}),
        [products],
    );

    const comboComputedBasePrice = useMemo(() => {
        return comboForm.products.reduce((sum, line) => {
            if (!line.productId) return sum;
            const p = productById[line.productId];
            if (!p) return sum;
            const qty = Math.max(1, Number(line.quantity) || 1);
            return sum + Number(p.basePrice) * qty;
        }, 0);
    }, [comboForm.products, productById]);

    const hasComboLinesWithoutPrice =
        comboForm.products.some((line) => line.productId && !productById[line.productId]);

    const addComboProductLine = () => {
        setComboForm((prev) => ({
            ...prev,
            products: [...prev.products, { productId: products[0]?.id ?? "", quantity: 1 }],
        }));
    };

    const updateComboProductLine = (index: number, patch: Partial<ComboProductLineDto>) => {
        setComboForm((prev) => ({
            ...prev,
            products: prev.products.map((line, i) => (i === index ? { ...line, ...patch } : line)),
        }));
    };

    const removeComboProductLine = (index: number) => {
        setComboForm((prev) => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index),
        }));
    };

    const requestCloseComboRemoveLine = () => {
        if (comboRemoveLineIndex === null) return;
        removeComboProductLine(comboRemoveLineIndex);
        setComboRemoveLineIndex(null);
    };

    return (
        <>
            <LTTDialog open={productDialogOpen} onOpenChange={onProductDialogOpenChange}>
                <LTTDialogContent className={`sm:max-w-3xl ${dialogShellClass}`}>
                    <LTTDialogHeader className="px-6 pt-6 pb-4 border-b border-border-shadcn">
                        <LTTDialogTitle>
                            {editingProduct ? t("admin.fnb.form.edit_title") : t("admin.fnb.form.create_title")}
                        </LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="overflow-y-auto px-6 py-5">
                        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
                            <AdminPosterDropzone
                                remoteUrl={toSafeImageUrl(productForm.imageUrl)}
                                selectedFile={productForm.imageFile ?? null}
                                onPickFile={(file) =>
                                    setProductForm((prev) =>
                                        file ? { ...prev, imageFile: file } : { ...prev, imageFile: undefined, imageUrl: "" },
                                    )
                                }
                                titleLabel={t("admin.fnb.form.image_label")}
                                hintPrimary={t("admin.fnb.form.poster_upload_click_or_drag")}
                                hintSecondary={t("admin.fnb.form.poster_upload_hint")}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <LTTLabel>{t("admin.fnb.form.name")}</LTTLabel>
                                    <LTTInput
                                        value={productForm.name}
                                        onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <LTTLabel>{t("admin.fnb.form.category")}</LTTLabel>
                                    <LTTSelect
                                        value={productForm.productCategoryId}
                                        onValueChange={(value: string) =>
                                            setProductForm((prev) => ({ ...prev, productCategoryId: value }))
                                        }
                                    >
                                        <LTTSelectTrigger>
                                            <LTTSelectValue placeholder={t("admin.fnb.form.category_placeholder")} />
                                        </LTTSelectTrigger>
                                        <LTTSelectContent>
                                            {categories.map((category) => (
                                                <LTTSelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </LTTSelectItem>
                                            ))}
                                        </LTTSelectContent>
                                    </LTTSelect>
                                </div>
                                <div className="space-y-2">
                                    <LTTLabel>{t("admin.fnb.form.base_price")}</LTTLabel>
                                    <LTTInput
                                        type="number"
                                        value={productForm.basePrice}
                                        onChange={(e) =>
                                            setProductForm((prev) => ({
                                                ...prev,
                                                basePrice: Number(e.target.value) || 0,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <LTTLabel>{t("admin.fnb.form.sell_price")}</LTTLabel>
                                    <LTTInput
                                        type="number"
                                        value={productForm.sellPrice}
                                        onChange={(e) =>
                                            setProductForm((prev) => ({
                                                ...prev,
                                                sellPrice: Number(e.target.value) || 0,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <LTTLabel>{t("admin.fnb.form.description")}</LTTLabel>
                                    <LTTTextarea
                                        value={productForm.description}
                                        rows={3}
                                        onChange={(e) =>
                                            setProductForm((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 sm:col-span-2">
                                    <LTTCheckbox
                                        checked={productForm.isActive}
                                        onCheckedChange={(checked) =>
                                            setProductForm((prev) => ({ ...prev, isActive: checked === true }))
                                        }
                                    />
                                    <LTTLabel>{t("admin.fnb.form.active")}</LTTLabel>
                                </div>
                            </div>
                        </div>
                    </div>
                    <LTTDialogFooter className="px-6 py-4 border-t border-border-shadcn">
                        <LTTButton variant="outline" onClick={() => onProductDialogOpenChange(false)}>
                            {t("admin.fnb.form.cancel")}
                        </LTTButton>
                        <LTTButton onClick={onSaveProduct} loading={isProductSaving}>
                            {editingProduct ? t("admin.fnb.form.save") : t("admin.fnb.form.create")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={categoryDialogOpen} onOpenChange={onCategoryDialogOpenChange}>
                <LTTDialogContent className={`sm:max-w-lg ${dialogShellClass}`}>
                    <LTTDialogHeader className="px-6 pt-6 pb-4 border-b border-border-shadcn">
                        <LTTDialogTitle>
                            {editingCategory
                                ? t("admin.fnb.form.category_edit_title")
                                : t("admin.fnb.form.category_create_title")}
                        </LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="overflow-y-auto px-6 py-5">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.fnb.form.category_name_label")}</LTTLabel>
                                <LTTInput
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.fnb.form.description")}</LTTLabel>
                                <LTTTextarea
                                    value={categoryForm.description}
                                    rows={3}
                                    onChange={(e) =>
                                        setCategoryForm((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <LTTCheckbox
                                    checked={categoryForm.isActive}
                                    onCheckedChange={(checked) =>
                                        setCategoryForm((prev) => ({ ...prev, isActive: checked === true }))
                                    }
                                />
                                <LTTLabel>{t("admin.fnb.form.active")}</LTTLabel>
                            </div>
                        </div>
                    </div>
                    <LTTDialogFooter className="px-6 py-4 border-t border-border-shadcn">
                        <LTTButton variant="outline" onClick={() => onCategoryDialogOpenChange(false)}>
                            {t("admin.fnb.form.cancel")}
                        </LTTButton>
                        <LTTButton onClick={onSaveCategory} loading={isCategorySaving}>
                            {editingCategory ? t("admin.fnb.form.save") : t("admin.fnb.form.create")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={comboDialogOpen} onOpenChange={onComboDialogOpenChange}>
                <LTTDialogContent className={`sm:max-w-3xl ${dialogShellClass}`}>
                    <LTTDialogHeader className="px-6 pt-6 pb-4 border-b border-border-shadcn">
                        <LTTDialogTitle>
                            {editingCombo ? t("admin.fnb.form.combo_edit_title") : t("admin.fnb.form.combo_create_title")}
                        </LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="overflow-y-auto px-6 py-5">
                        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
                            <AdminPosterDropzone
                                remoteUrl={toSafeImageUrl(comboForm.imageUrl)}
                                selectedFile={comboForm.imageFile ?? null}
                                onPickFile={(file) =>
                                    setComboForm((prev) =>
                                        file ? { ...prev, imageFile: file } : { ...prev, imageFile: undefined, imageUrl: "" },
                                    )
                                }
                                titleLabel={t("admin.fnb.form.image_label")}
                                hintPrimary={t("admin.fnb.form.poster_upload_click_or_drag")}
                                hintSecondary={t("admin.fnb.form.poster_upload_hint")}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <LTTLabel>{t("admin.fnb.form.combo_name_label")}</LTTLabel>
                                    <LTTInput
                                        value={comboForm.name}
                                        onChange={(e) => setComboForm((prev) => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <LTTLabel>{t("admin.fnb.form.description")}</LTTLabel>
                                    <LTTTextarea
                                        value={comboForm.description}
                                        rows={3}
                                        onChange={(e) =>
                                            setComboForm((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <LTTLabel>{t("admin.fnb.form.combo_products_section")}</LTTLabel>
                                        <LTTButton type="button" size="sm" variant="outline" className="gap-1" onClick={addComboProductLine}>
                                            <Plus className="h-4 w-4" /> {t("admin.fnb.form.combo_add_product")}
                                        </LTTButton>
                                    </div>
                                    <div className="space-y-2">
                                        {comboForm.products.length === 0 ? (
                                            <p className="rounded-md border border-dashed border-border-shadcn p-3 text-center text-sm text-muted-foreground-shadcn">
                                                {t("admin.fnb.form.combo_empty_hint")}
                                            </p>
                                        ) : (
                                            comboForm.products.map((line, index) => (
                                                <div
                                                    key={`${line.productId}-${index}`}
                                                    className="grid grid-cols-12 items-center gap-2 rounded-md border border-border-shadcn p-2"
                                                >
                                                    <div className="col-span-7">
                                                        <LTTSelect
                                                            value={line.productId}
                                                            onValueChange={(value: string) =>
                                                                updateComboProductLine(index, { productId: value })
                                                            }
                                                        >
                                                            <LTTSelectTrigger>
                                                                <LTTSelectValue
                                                                    placeholder={t("admin.fnb.form.combo_choose_product")}
                                                                />
                                                            </LTTSelectTrigger>
                                                            <LTTSelectContent>
                                                                {products.map((product) => (
                                                                    <LTTSelectItem key={product.id} value={product.id}>
                                                                        {product.name}
                                                                    </LTTSelectItem>
                                                                ))}
                                                            </LTTSelectContent>
                                                        </LTTSelect>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <LTTInput
                                                            type="number"
                                                            min={1}
                                                            value={line.quantity}
                                                            onChange={(e) =>
                                                                updateComboProductLine(index, {
                                                                    quantity: Math.max(1, Number(e.target.value) || 1),
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-span-2 flex justify-end">
                                                        <LTTButton
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => setComboRemoveLineIndex(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </LTTButton>
                                                    </div>
                                                    {productById[line.productId] && (
                                                        <p className="col-span-12 text-xs text-muted-foreground-shadcn">
                                                            {productById[line.productId].name} · base{" "}
                                                            {formatVnd(Number(productById[line.productId].basePrice))}
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 sm:col-span-2 rounded-md border border-border-shadcn bg-muted-shadcn/20 px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-medium text-foreground-shadcn">
                                            {t("admin.fnb.form.combo_base_price")}
                                        </span>
                                        <span className="text-base font-semibold tabular-nums">{formatVnd(comboComputedBasePrice)}</span>
                                    </div>
                                    {comboComputedBasePrice === 0 && comboForm.products.some((l) => l.productId) ? (
                                        <p className="text-xs text-muted-foreground-shadcn">{t("admin.fnb.form.combo_total_zero_hint")}</p>
                                    ) : null}
                                    {hasComboLinesWithoutPrice ? (
                                        <p className="text-xs text-muted-foreground-shadcn">{t("admin.fnb.form.combo_total_unknown_hint")}</p>
                                    ) : null}
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <LTTLabel>{t("admin.fnb.form.combo_total_price")}</LTTLabel>
                                    <LTTInput
                                        type="number"
                                        value={comboForm.totalPrice}
                                        onChange={(e) =>
                                            setComboForm((prev) => ({
                                                ...prev,
                                                totalPrice: Number(e.target.value) || 0,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 sm:col-span-2">
                                    <LTTCheckbox
                                        checked={comboForm.isActive}
                                        onCheckedChange={(checked) =>
                                            setComboForm((prev) => ({ ...prev, isActive: checked === true }))
                                        }
                                    />
                                    <LTTLabel>{t("admin.fnb.form.active")}</LTTLabel>
                                </div>
                            </div>
                        </div>
                    </div>
                    <LTTDialogFooter className="px-6 py-4 border-t border-border-shadcn">
                        <LTTButton variant="outline" onClick={() => onComboDialogOpenChange(false)}>
                            {t("admin.fnb.form.cancel")}
                        </LTTButton>
                        <LTTButton onClick={onSaveCombo} loading={isComboSaving}>
                            {editingCombo ? t("admin.fnb.form.save") : t("admin.fnb.form.create")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog
                open={comboRemoveLineIndex !== null}
                onOpenChange={(open) => {
                    if (!open) setComboRemoveLineIndex(null);
                }}
            >
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{t("admin.fnb.combo_remove_line.title")}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <p className="text-sm text-muted-foreground-shadcn">{t("admin.fnb.combo_remove_line.message")}</p>
                    <LTTDialogFooter className="gap-3">
                        <LTTButton variant="outline" className="flex-1" onClick={() => setComboRemoveLineIndex(null)}>
                            {t("admin.fnb.combo_remove_line.cancel")}
                        </LTTButton>
                        <LTTButton variant="destructive" className="flex-1" onClick={requestCloseComboRemoveLine}>
                            {t("admin.fnb.combo_remove_line.remove")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={productDeleteDialogOpen} onOpenChange={onProductDeleteDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader>
                        <LTTDialogTitle>Delete product</LTTDialogTitle>
                    </LTTDialogHeader>
                    <p className="text-sm text-muted-foreground-shadcn">Are you sure you want to delete this product?</p>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onProductDeleteDialogOpenChange(false)}>
                            Cancel
                        </LTTButton>
                        <LTTButton variant="default" onClick={onConfirmDeleteProduct}>
                            Delete
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={categoryDeleteDialogOpen} onOpenChange={onCategoryDeleteDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader>
                        <LTTDialogTitle>Delete category</LTTDialogTitle>
                    </LTTDialogHeader>
                    <p className="text-sm text-muted-foreground-shadcn">Are you sure you want to delete this category?</p>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onCategoryDeleteDialogOpenChange(false)}>
                            Cancel
                        </LTTButton>
                        <LTTButton variant="default" onClick={onConfirmDeleteCategory}>
                            Delete
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={comboDeleteDialogOpen} onOpenChange={onComboDeleteDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader>
                        <LTTDialogTitle>Delete combo</LTTDialogTitle>
                    </LTTDialogHeader>
                    <p className="text-sm text-muted-foreground-shadcn">Are you sure you want to delete this combo?</p>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onComboDeleteDialogOpenChange(false)}>
                            Cancel
                        </LTTButton>
                        <LTTButton variant="default" onClick={onConfirmDeleteCombo}>
                            Delete
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </>
    );
}
