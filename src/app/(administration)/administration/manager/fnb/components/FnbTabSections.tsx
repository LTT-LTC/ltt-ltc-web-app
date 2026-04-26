"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import { CategoryOutputDto, ComboDetailOutputDto, ComboOutputDto, ProductOutputDto, ProductVariantOutputDto } from "@/src/services/administration-service/product/models/output.model";

type FnbTab = "products" | "category" | "combos" | "variant";

interface FnbTabSectionsProps {
    activeTab: FnbTab;
    products: ProductOutputDto[];
    combos: ComboOutputDto[];
    categoryById: Record<string, CategoryOutputDto>;
    filteredCategories: CategoryOutputDto[];
    filteredVariants: ProductVariantOutputDto[];
    selectedProductIds: Set<string>;
    productTotal: number;
    productPage: number;
    productFetch: number;
    comboTotal: number;
    comboPage: number;
    comboFetch: number;
    categoryTotal: number;
    categoryPage: number;
    categoryFetch: number;
    variantTotal: number;
    variantPage: number;
    variantFetch: number;
    variantProductId: string;
    selectedComboForItem: string;
    currentComboDetail?: ComboDetailOutputDto;
    selectedComboItemId: string;
    isProductsLoading: boolean;
    isCategoriesLoading: boolean;
    isCombosLoading: boolean;
    isComboDetailLoading: boolean;
    isVariantsLoading: boolean;
    formatVnd: (amount: number) => string;
    onToggleAllProducts: () => void;
    onToggleProduct: (id: string) => void;
    onOpenEditProduct: (item: ProductOutputDto) => void;
    onOpenDeleteProduct: (id: string) => void;
    onBulkDeleteProducts: () => void;
    onProductPageChange: (nextPage: number) => void;
    onProductPageSizeChange: (nextSize: number) => void;
    onOpenEditCategory: (item: CategoryOutputDto) => void;
    onOpenDeleteCategory: (id: string) => void;
    onCategoryPageChange: (nextPage: number) => void;
    onCategoryPageSizeChange: (nextSize: number) => void;
    onOpenComboItems: (id: string) => void;
    onOpenEditCombo: (item: ComboOutputDto) => void;
    onOpenDeleteCombo: (id: string) => void;
    onComboPageChange: (nextPage: number) => void;
    onComboPageSizeChange: (nextSize: number) => void;
    onOpenCreateComboItem: () => void;
    onDeleteComboItem: (comboItemId: string) => void;
    onOpenEditVariant: (item: ProductVariantOutputDto) => void;
    onOpenDeleteVariant: (id: string) => void;
    onVariantPageChange: (nextPage: number) => void;
    onVariantPageSizeChange: (nextSize: number) => void;
}

export default function FnbTabSections(props: FnbTabSectionsProps) {
    const {
        activeTab,
        products,
        combos,
        categoryById,
        filteredCategories,
        filteredVariants,
        selectedProductIds,
        productTotal,
        productPage,
        productFetch,
        comboTotal,
        comboPage,
        comboFetch,
        categoryTotal,
        categoryPage,
        categoryFetch,
        variantTotal,
        variantPage,
        variantFetch,
        variantProductId,
        selectedComboForItem,
        currentComboDetail,
        selectedComboItemId,
        isProductsLoading,
        isCategoriesLoading,
        isCombosLoading,
        isComboDetailLoading,
        isVariantsLoading,
        formatVnd,
        onToggleAllProducts,
        onToggleProduct,
        onOpenEditProduct,
        onOpenDeleteProduct,
        onBulkDeleteProducts,
        onProductPageChange,
        onProductPageSizeChange,
        onOpenEditCategory,
        onOpenDeleteCategory,
        onCategoryPageChange,
        onCategoryPageSizeChange,
        onOpenComboItems,
        onOpenEditCombo,
        onOpenDeleteCombo,
        onComboPageChange,
        onComboPageSizeChange,
        onOpenCreateComboItem,
        onDeleteComboItem,
        onOpenEditVariant,
        onOpenDeleteVariant,
        onVariantPageChange,
        onVariantPageSizeChange,
    } = props;

    return (
        <>
            {activeTab === "products" && (
                <>
                    <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                                    <th className="w-10 px-3 py-3">
                                        <LTTCheckbox
                                            checked={products.length > 0 && products.every((item) => selectedProductIds.has(item.id))}
                                            onCheckedChange={onToggleAllProducts}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                                    <th className="px-4 py-3 text-right font-semibold">Base Price</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isProductsLoading ? (
                                    <DomainTableStateRow colSpan={6} state="loading" loadingText="Loading products..." />
                                ) : products.length === 0 ? (
                                    <DomainTableStateRow colSpan={6} state="empty" emptyText="No products found." />
                                ) : (
                                    products.map((item) => (
                                        <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                            <td className="px-3 py-3">
                                                <LTTCheckbox checked={selectedProductIds.has(item.id)} onCheckedChange={() => onToggleProduct(item.id)} />
                                            </td>
                                            <td className="px-4 py-3 font-medium">{item.name}</td>
                                            <td className="px-4 py-3">{categoryById[item.productCategoryId]?.name || "-"}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatVnd(Number(item.basePrice))}</td>
                                            <td className="px-4 py-3">
                                                <LTTBadge className={item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </LTTBadge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenEditProduct(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </LTTButton>
                                                    <LTTButton
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => onOpenDeleteProduct(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </LTTButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between">
                        {selectedProductIds.size > 0 ? (
                            <LTTButton variant="destructive" size="sm" className="gap-2" onClick={onBulkDeleteProducts}>
                                <Trash2 className="h-4 w-4" /> Delete selected ({selectedProductIds.size})
                            </LTTButton>
                        ) : (
                            <div />
                        )}
                        <AdminTablePagination
                            totalCount={productTotal}
                            page={productPage}
                            pageSize={productFetch}
                            onPageChange={onProductPageChange}
                            onPageSizeChange={onProductPageSizeChange}
                            loading={isProductsLoading}
                        />
                    </div>
                </>
            )}

            {activeTab === "category" && (
                <>
                    <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isCategoriesLoading ? (
                                    <DomainTableStateRow colSpan={4} state="loading" loadingText="Loading categories..." />
                                ) : filteredCategories.length === 0 ? (
                                    <DomainTableStateRow colSpan={4} state="empty" emptyText="No categories found." />
                                ) : (
                                    filteredCategories.map((item) => (
                                        <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{item.name}</td>
                                            <td className="px-4 py-3">{item.description || "-"}</td>
                                            <td className="px-4 py-3">
                                                <LTTBadge className={item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </LTTBadge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenEditCategory(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </LTTButton>
                                                    <LTTButton
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => onOpenDeleteCategory(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </LTTButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <AdminTablePagination
                        totalCount={categoryTotal}
                        page={categoryPage}
                        pageSize={categoryFetch}
                        onPageChange={onCategoryPageChange}
                        onPageSizeChange={onCategoryPageSizeChange}
                        loading={isCategoriesLoading}
                    />
                </>
            )}

            {activeTab === "combos" && (
                <>
                    <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-right font-semibold">Total Price</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isCombosLoading ? (
                                    <DomainTableStateRow colSpan={4} state="loading" loadingText="Loading combos..." />
                                ) : combos.length === 0 ? (
                                    <DomainTableStateRow colSpan={4} state="empty" emptyText="No combos found." />
                                ) : (
                                    combos.map((item) => (
                                        <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{item.name}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatVnd(Number(item.totalPrice))}</td>
                                            <td className="px-4 py-3">
                                                <LTTBadge className={item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </LTTBadge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <LTTButton variant="outline" size="sm" onClick={() => onOpenComboItems(item.id)}>
                                                        View items
                                                    </LTTButton>
                                                    <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenEditCombo(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </LTTButton>
                                                    <LTTButton
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => onOpenDeleteCombo(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </LTTButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <AdminTablePagination
                        totalCount={comboTotal}
                        page={comboPage}
                        pageSize={comboFetch}
                        onPageChange={onComboPageChange}
                        onPageSizeChange={onComboPageSizeChange}
                        loading={isCombosLoading}
                    />

                    {selectedComboForItem && (
                        <div className="rounded-lg border border-border-shadcn bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                    Combo items: {combos.find((combo) => combo.id === selectedComboForItem)?.name || selectedComboForItem}
                                </h3>
                                <LTTButton size="sm" onClick={onOpenCreateComboItem}>
                                    <Plus className="h-4 w-4 mr-1" /> Add item
                                </LTTButton>
                            </div>
                            {isComboDetailLoading ? (
                                <p className="text-sm text-muted-foreground-shadcn">Loading combo items...</p>
                            ) : !currentComboDetail || currentComboDetail.comboItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground-shadcn">No combo items.</p>
                            ) : (
                                <div className="space-y-2">
                                    {currentComboDetail.comboItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between border border-border-shadcn rounded-md p-2">
                                            <div className="text-sm">
                                                <span className="font-medium">{item.product?.name || item.productId}</span>
                                                <span className="text-muted-foreground-shadcn"> x {item.quantity}</span>
                                            </div>
                                            <LTTButton
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => onDeleteComboItem(item.id)}
                                                loading={selectedComboItemId === item.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </LTTButton>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {activeTab === "variant" && (
                <>
                    <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-right font-semibold">Additional Price</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variantProductId === "all" ? (
                                    <DomainTableStateRow colSpan={4} state="empty" emptyText="Choose a product to see variants." />
                                ) : isVariantsLoading ? (
                                    <DomainTableStateRow colSpan={4} state="loading" loadingText="Loading variants..." />
                                ) : filteredVariants.length === 0 ? (
                                    <DomainTableStateRow colSpan={4} state="empty" emptyText="No variants found." />
                                ) : (
                                    filteredVariants.map((item) => (
                                        <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{item.name}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatVnd(Number(item.additionalPrice))}</td>
                                            <td className="px-4 py-3">
                                                <LTTBadge className={item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </LTTBadge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenEditVariant(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </LTTButton>
                                                    <LTTButton
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => onOpenDeleteVariant(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </LTTButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <AdminTablePagination
                        totalCount={variantTotal}
                        page={variantPage}
                        pageSize={variantFetch}
                        onPageChange={onVariantPageChange}
                        onPageSizeChange={onVariantPageSizeChange}
                        loading={isVariantsLoading}
                    />
                </>
            )}
        </>
    );
}
