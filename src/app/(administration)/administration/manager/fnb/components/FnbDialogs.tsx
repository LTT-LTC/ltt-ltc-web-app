"use client";

import { useMemo } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
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
import { ComboProductLineDto } from "@/src/services/administration-service/product/models/input.model";
import {
    CategoryOutputDto,
    ComboOutputDto,
    ProductOutputDto,
} from "@/src/services/administration-service/product/models/output.model";

interface ProductFormState {
    name: string;
    productCategoryId: string;
    basePrice: number;
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

    const productById = useMemo(
        () => products.reduce<Record<string, ProductOutputDto>>((acc, p) => {
            acc[p.id] = p;
            return acc;
        }, {}),
        [products],
    );

    const productImagePreview = productForm.imageFile ? URL.createObjectURL(productForm.imageFile) : productForm.imageUrl;
    const comboImagePreview = comboForm.imageFile ? URL.createObjectURL(comboForm.imageFile) : comboForm.imageUrl;

    const handleProductFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setProductForm((prev) => ({ ...prev, imageFile: file ?? undefined }));
    };

    const handleComboFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setComboForm((prev) => ({ ...prev, imageFile: file ?? undefined }));
    };

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

    return (
        <>
            <LTTDialog open={productDialogOpen} onOpenChange={onProductDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-3xl">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editingProduct ? "Edit product" : "Create product"}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="grid gap-4 py-2 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <LTTLabel>Name</LTTLabel>
                            <LTTInput value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Category</LTTLabel>
                            <LTTSelect value={productForm.productCategoryId} onValueChange={(value: string) => setProductForm((prev) => ({ ...prev, productCategoryId: value }))}>
                                <LTTSelectTrigger>
                                    <LTTSelectValue placeholder="Choose category" />
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
                            <LTTLabel>Base Price</LTTLabel>
                            <LTTInput type="number" value={productForm.basePrice} onChange={(e) => setProductForm((prev) => ({ ...prev, basePrice: Number(e.target.value) || 0 }))} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <LTTLabel>Image</LTTLabel>
                            <div className="flex items-center gap-3">
                                {productImagePreview ? (
                                    <div className="h-24 w-24 overflow-hidden rounded-md border border-border-shadcn bg-muted-shadcn/30">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={productImagePreview} alt="preview" className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-border-shadcn text-xs text-muted-foreground-shadcn">
                                        No image
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border-shadcn bg-background-shadcn px-3 py-2 text-sm hover:bg-muted-shadcn/40">
                                        <Upload className="h-4 w-4" />
                                        <span>{productForm.imageFile ? productForm.imageFile.name : "Choose image"}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleProductFile} />
                                    </label>
                                    {productForm.imageFile && (
                                        <LTTButton
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setProductForm((prev) => ({ ...prev, imageFile: undefined }))}
                                        >
                                            Clear selection
                                        </LTTButton>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <LTTLabel>Description</LTTLabel>
                            <LTTTextarea value={productForm.description} rows={3} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} />
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                            <LTTCheckbox checked={productForm.isActive} onCheckedChange={(checked) => setProductForm((prev) => ({ ...prev, isActive: checked === true }))} />
                            <LTTLabel>Active</LTTLabel>
                        </div>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onProductDialogOpenChange(false)}>Cancel</LTTButton>
                        <LTTButton onClick={onSaveProduct} loading={isProductSaving}>Save</LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={categoryDialogOpen} onOpenChange={onCategoryDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-lg">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editingCategory ? "Edit category" : "Create category"}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="space-y-2">
                            <LTTLabel>Name</LTTLabel>
                            <LTTInput value={categoryForm.name} onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Description</LTTLabel>
                            <LTTTextarea value={categoryForm.description} rows={3} onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))} />
                        </div>
                        <div className="flex items-center gap-2">
                            <LTTCheckbox checked={categoryForm.isActive} onCheckedChange={(checked) => setCategoryForm((prev) => ({ ...prev, isActive: checked === true }))} />
                            <LTTLabel>Active</LTTLabel>
                        </div>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onCategoryDialogOpenChange(false)}>Cancel</LTTButton>
                        <LTTButton onClick={onSaveCategory} loading={isCategorySaving}>Save</LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={comboDialogOpen} onOpenChange={onComboDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-3xl">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editingCombo ? "Edit combo" : "Create combo"}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="grid gap-4 py-2 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <LTTLabel>Name</LTTLabel>
                            <LTTInput value={comboForm.name} onChange={(e) => setComboForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Total Price</LTTLabel>
                            <LTTInput type="number" value={comboForm.totalPrice} onChange={(e) => setComboForm((prev) => ({ ...prev, totalPrice: Number(e.target.value) || 0 }))} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <LTTLabel>Image</LTTLabel>
                            <div className="flex items-center gap-3">
                                {comboImagePreview ? (
                                    <div className="h-24 w-24 overflow-hidden rounded-md border border-border-shadcn bg-muted-shadcn/30">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={comboImagePreview} alt="preview" className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-border-shadcn text-xs text-muted-foreground-shadcn">
                                        No image
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border-shadcn bg-background-shadcn px-3 py-2 text-sm hover:bg-muted-shadcn/40">
                                        <Upload className="h-4 w-4" />
                                        <span>{comboForm.imageFile ? comboForm.imageFile.name : "Choose image"}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleComboFile} />
                                    </label>
                                    {comboForm.imageFile && (
                                        <LTTButton
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setComboForm((prev) => ({ ...prev, imageFile: undefined }))}
                                        >
                                            Clear selection
                                        </LTTButton>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <LTTLabel>Description</LTTLabel>
                            <LTTTextarea value={comboForm.description} rows={3} onChange={(e) => setComboForm((prev) => ({ ...prev, description: e.target.value }))} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <div className="flex items-center justify-between">
                                <LTTLabel>Products in this combo</LTTLabel>
                                <LTTButton type="button" size="sm" variant="outline" className="gap-1" onClick={addComboProductLine}>
                                    <Plus className="h-4 w-4" /> Add product
                                </LTTButton>
                            </div>
                            <div className="space-y-2">
                                {comboForm.products.length === 0 ? (
                                    <p className="rounded-md border border-dashed border-border-shadcn p-3 text-center text-sm text-muted-foreground-shadcn">
                                        No products yet. Add at least one product to define the combo bundle.
                                    </p>
                                ) : (
                                    comboForm.products.map((line, index) => (
                                        <div key={`${line.productId}-${index}`} className="grid grid-cols-12 items-center gap-2 rounded-md border border-border-shadcn p-2">
                                            <div className="col-span-7">
                                                <LTTSelect value={line.productId} onValueChange={(value: string) => updateComboProductLine(index, { productId: value })}>
                                                    <LTTSelectTrigger>
                                                        <LTTSelectValue placeholder="Choose product" />
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
                                                    onChange={(e) => updateComboProductLine(index, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                                                />
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <LTTButton
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => removeComboProductLine(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </LTTButton>
                                            </div>
                                            {productById[line.productId] && (
                                                <p className="col-span-12 text-xs text-muted-foreground-shadcn">
                                                    {productById[line.productId].name} · base {productById[line.productId].basePrice.toLocaleString("vi-VN")}đ
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                            <LTTCheckbox checked={comboForm.isActive} onCheckedChange={(checked) => setComboForm((prev) => ({ ...prev, isActive: checked === true }))} />
                            <LTTLabel>Active</LTTLabel>
                        </div>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onComboDialogOpenChange(false)}>Cancel</LTTButton>
                        <LTTButton onClick={onSaveCombo} loading={isComboSaving}>Save</LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={productDeleteDialogOpen} onOpenChange={onProductDeleteDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader><LTTDialogTitle>Delete product</LTTDialogTitle></LTTDialogHeader>
                    <p className="text-sm text-muted-foreground-shadcn">Are you sure you want to delete this product?</p>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onProductDeleteDialogOpenChange(false)}>Cancel</LTTButton>
                        <LTTButton variant="default" onClick={onConfirmDeleteProduct}>Delete</LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={categoryDeleteDialogOpen} onOpenChange={onCategoryDeleteDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader><LTTDialogTitle>Delete category</LTTDialogTitle></LTTDialogHeader>
                    <p className="text-sm text-muted-foreground-shadcn">Are you sure you want to delete this category?</p>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onCategoryDeleteDialogOpenChange(false)}>Cancel</LTTButton>
                        <LTTButton variant="default" onClick={onConfirmDeleteCategory}>Delete</LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={comboDeleteDialogOpen} onOpenChange={onComboDeleteDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader><LTTDialogTitle>Delete combo</LTTDialogTitle></LTTDialogHeader>
                    <p className="text-sm text-muted-foreground-shadcn">Are you sure you want to delete this combo?</p>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onComboDeleteDialogOpenChange(false)}>Cancel</LTTButton>
                        <LTTButton variant="default" onClick={onConfirmDeleteCombo}>Delete</LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </>
    );
}
