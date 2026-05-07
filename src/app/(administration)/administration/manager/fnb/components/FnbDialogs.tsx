"use client";

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
import { CategoryOutputDto, ComboOutputDto, ProductOutputDto, ProductVariantOutputDto } from "@/src/services/administration-service/product/models/output.model";

interface ProductFormState {
    name: string;
    productCategoryId: string;
    basePrice: number;
    description: string;
    imageUrl: string;
    isActive: boolean;
    productType: string;
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
}

interface VariantFormState {
    name: string;
    additionalPrice: number;
    isActive: boolean;
}

interface ComboItemFormState {
    productId: string;
    quantity: number;
}

interface FnbDialogsProps {
    categories: CategoryOutputDto[];
    products: ProductOutputDto[];
    editingProduct: ProductOutputDto | null;
    editingCategory: CategoryOutputDto | null;
    editingCombo: ComboOutputDto | null;
    editingVariant: ProductVariantOutputDto | null;
    productForm: ProductFormState;
    categoryForm: CategoryFormState;
    comboForm: ComboFormState;
    variantForm: VariantFormState;
    comboItemForm: ComboItemFormState;
    productDialogOpen: boolean;
    categoryDialogOpen: boolean;
    comboDialogOpen: boolean;
    variantDialogOpen: boolean;
    comboItemDialogOpen: boolean;
    productDeleteDialogOpen: boolean;
    categoryDeleteDialogOpen: boolean;
    comboDeleteDialogOpen: boolean;
    variantDeleteDialogOpen: boolean;
    isProductSaving: boolean;
    isCategorySaving: boolean;
    isComboSaving: boolean;
    isVariantSaving: boolean;
    onProductDialogOpenChange: (open: boolean) => void;
    onCategoryDialogOpenChange: (open: boolean) => void;
    onComboDialogOpenChange: (open: boolean) => void;
    onVariantDialogOpenChange: (open: boolean) => void;
    onComboItemDialogOpenChange: (open: boolean) => void;
    onProductDeleteDialogOpenChange: (open: boolean) => void;
    onCategoryDeleteDialogOpenChange: (open: boolean) => void;
    onComboDeleteDialogOpenChange: (open: boolean) => void;
    onVariantDeleteDialogOpenChange: (open: boolean) => void;
    setProductForm: (updater: (prev: ProductFormState) => ProductFormState) => void;
    setCategoryForm: (updater: (prev: CategoryFormState) => CategoryFormState) => void;
    setComboForm: (updater: (prev: ComboFormState) => ComboFormState) => void;
    setVariantForm: (updater: (prev: VariantFormState) => VariantFormState) => void;
    setComboItemForm: (updater: (prev: ComboItemFormState) => ComboItemFormState) => void;
    onSaveProduct: () => void;
    onSaveCategory: () => void;
    onSaveCombo: () => void;
    onSaveVariant: () => void;
    onAddComboItem: () => void;
    onConfirmDeleteProduct: () => void;
    onConfirmDeleteCategory: () => void;
    onConfirmDeleteCombo: () => void;
    onConfirmDeleteVariant: () => void;
}

export default function FnbDialogs(props: FnbDialogsProps) {
    const {
        categories,
        products,
        editingProduct,
        editingCategory,
        editingCombo,
        editingVariant,
        productForm,
        categoryForm,
        comboForm,
        variantForm,
        comboItemForm,
        productDialogOpen,
        categoryDialogOpen,
        comboDialogOpen,
        variantDialogOpen,
        comboItemDialogOpen,
        productDeleteDialogOpen,
        categoryDeleteDialogOpen,
        comboDeleteDialogOpen,
        variantDeleteDialogOpen,
        isProductSaving,
        isCategorySaving,
        isComboSaving,
        isVariantSaving,
        onProductDialogOpenChange,
        onCategoryDialogOpenChange,
        onComboDialogOpenChange,
        onVariantDialogOpenChange,
        onComboItemDialogOpenChange,
        onProductDeleteDialogOpenChange,
        onCategoryDeleteDialogOpenChange,
        onComboDeleteDialogOpenChange,
        onVariantDeleteDialogOpenChange,
        setProductForm,
        setCategoryForm,
        setComboForm,
        setVariantForm,
        setComboItemForm,
        onSaveProduct,
        onSaveCategory,
        onSaveCombo,
        onSaveVariant,
        onAddComboItem,
        onConfirmDeleteProduct,
        onConfirmDeleteCategory,
        onConfirmDeleteCombo,
        onConfirmDeleteVariant,
    } = props;

    return (
        <>
            <LTTDialog open={productDialogOpen} onOpenChange={onProductDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-2xl">
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
                        <div className="space-y-2">
                            <LTTLabel>Product type</LTTLabel>
                            <LTTInput value={productForm.productType} onChange={(e) => setProductForm((prev) => ({ ...prev, productType: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Image URL</LTTLabel>
                            <LTTInput value={productForm.imageUrl} onChange={(e) => setProductForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
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
                <LTTDialogContent className="sm:max-w-lg">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editingCombo ? "Edit combo" : "Create combo"}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="space-y-2">
                            <LTTLabel>Name</LTTLabel>
                            <LTTInput value={comboForm.name} onChange={(e) => setComboForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Total Price</LTTLabel>
                            <LTTInput type="number" value={comboForm.totalPrice} onChange={(e) => setComboForm((prev) => ({ ...prev, totalPrice: Number(e.target.value) || 0 }))} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Description</LTTLabel>
                            <LTTTextarea value={comboForm.description} rows={3} onChange={(e) => setComboForm((prev) => ({ ...prev, description: e.target.value }))} />
                        </div>
                        <div className="flex items-center gap-2">
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

            <LTTDialog open={variantDialogOpen} onOpenChange={onVariantDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-lg">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editingVariant ? "Edit variant" : "Create variant"}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="space-y-2">
                            <LTTLabel>Name</LTTLabel>
                            <LTTInput value={variantForm.name} onChange={(e) => setVariantForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Additional price</LTTLabel>
                            <LTTInput type="number" value={variantForm.additionalPrice} onChange={(e) => setVariantForm((prev) => ({ ...prev, additionalPrice: Number(e.target.value) || 0 }))} />
                        </div>
                        <div className="flex items-center gap-2">
                            <LTTCheckbox checked={variantForm.isActive} onCheckedChange={(checked) => setVariantForm((prev) => ({ ...prev, isActive: checked === true }))} />
                            <LTTLabel>Active</LTTLabel>
                        </div>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onVariantDialogOpenChange(false)}>Cancel</LTTButton>
                        <LTTButton onClick={onSaveVariant} loading={isVariantSaving}>Save</LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTDialog open={comboItemDialogOpen} onOpenChange={onComboItemDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-lg">
                    <LTTDialogHeader>
                        <LTTDialogTitle>Add combo item</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="space-y-2">
                            <LTTLabel>Product</LTTLabel>
                            <LTTSelect value={comboItemForm.productId} onValueChange={(value: string) => setComboItemForm((prev) => ({ ...prev, productId: value }))}>
                                <LTTSelectTrigger>
                                    <LTTSelectValue placeholder="Choose product" />
                                </LTTSelectTrigger>
                                <LTTSelectContent>
                                    {products.map((item) => (
                                        <LTTSelectItem key={item.id} value={item.id}>
                                            {item.name}
                                        </LTTSelectItem>
                                    ))}
                                </LTTSelectContent>
                            </LTTSelect>
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Quantity</LTTLabel>
                            <LTTInput type="number" value={comboItemForm.quantity} onChange={(e) => setComboItemForm((prev) => ({ ...prev, quantity: Number(e.target.value) || 1 }))} />
                        </div>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onComboItemDialogOpenChange(false)}>Cancel</LTTButton>
                        <LTTButton onClick={onAddComboItem}>Add item</LTTButton>
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

            <LTTDialog open={variantDeleteDialogOpen} onOpenChange={onVariantDeleteDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader><LTTDialogTitle>Delete variant</LTTDialogTitle></LTTDialogHeader>
                    <p className="text-sm text-muted-foreground-shadcn">Are you sure you want to delete this variant?</p>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => onVariantDeleteDialogOpenChange(false)}>Cancel</LTTButton>
                        <LTTButton variant="default" onClick={onConfirmDeleteVariant}>Delete</LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </>
    );
}
