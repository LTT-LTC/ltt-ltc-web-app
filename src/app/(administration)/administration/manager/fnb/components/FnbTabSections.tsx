"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import { CategoryOutputDto, ComboOutputDto, ProductOutputDto } from "@/src/services/administration-service/product/models/output.model";

const toSafeImageUrl = (value?: string) => {
    const raw = value?.trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) return raw;
    return "";
};

type FnbTab = "products" | "category" | "combos";

interface FnbTabSectionsProps {
    activeTab: FnbTab;
    products: ProductOutputDto[];
    combos: ComboOutputDto[];
    productById: Record<string, ProductOutputDto>;
    categoryById: Record<string, CategoryOutputDto>;
    filteredCategories: CategoryOutputDto[];
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
    isProductsLoading: boolean;
    isCategoriesLoading: boolean;
    isCombosLoading: boolean;
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
    onOpenEditCombo: (item: ComboOutputDto) => void;
    onOpenDeleteCombo: (id: string) => void;
    onComboPageChange: (nextPage: number) => void;
    onComboPageSizeChange: (nextSize: number) => void;
}

export default function FnbTabSections(props: FnbTabSectionsProps) {
    const {
        activeTab,
        products,
        combos,
        productById,
        categoryById,
        filteredCategories,
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
        isProductsLoading,
        isCategoriesLoading,
        isCombosLoading,
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
        onOpenEditCombo,
        onOpenDeleteCombo,
        onComboPageChange,
        onComboPageSizeChange,
    } = props;

    const [expandedComboIds, setExpandedComboIds] = useState<Set<string>>(new Set());

    const toggleComboExpanded = (id: string) => {
        setExpandedComboIds((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

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
                                    <th className="px-4 py-3 text-left font-semibold">Image</th>
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                                    <th className="px-4 py-3 text-right font-semibold">Base Price</th>
                                    <th className="px-4 py-3 text-right font-semibold">Sell Price</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isProductsLoading ? (
                                    <DomainTableStateRow colSpan={8} state="loading" loadingText="Loading products..." />
                                ) : products.length === 0 ? (
                                    <DomainTableStateRow colSpan={8} state="empty" emptyText="No products found." />
                                ) : (
                                    products.map((item) => (
                                        <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                            <td className="px-3 py-3">
                                                <LTTCheckbox checked={selectedProductIds.has(item.id)} onCheckedChange={() => onToggleProduct(item.id)} />
                                            </td>
                                            <td className="px-4 py-3">
                                                {toSafeImageUrl(item.imageUrl) ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={toSafeImageUrl(item.imageUrl)} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-md border border-dashed border-border-shadcn" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium">{item.name}</td>
                                            <td className="px-4 py-3">{categoryById[item.productCategoryId]?.name || "-"}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatVnd(Number(item.basePrice))}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-[#cd1e25]">{formatVnd(Number(item.sellPrice))}</td>
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
                                    <th className="w-10 px-3 py-3"></th>
                                    <th className="px-4 py-3 text-left font-semibold">Image</th>
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-right font-semibold">Base Price</th>
                                    <th className="px-4 py-3 text-right font-semibold">Sell Price</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isCombosLoading ? (
                                    <DomainTableStateRow colSpan={7} state="loading" loadingText="Loading combos..." />
                                ) : combos.length === 0 ? (
                                    <DomainTableStateRow colSpan={7} state="empty" emptyText="No combos found." />
                                ) : (
                                    combos.map((item) => {
                                        const isExpanded = expandedComboIds.has(item.id);
                                        return (
                                            <React.Fragment key={item.id}>
                                                <tr className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                                    <td className="px-3 py-3">
                                                        <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleComboExpanded(item.id)}>
                                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        </LTTButton>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {toSafeImageUrl(item.imageUrl) ? (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img src={toSafeImageUrl(item.imageUrl)} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-md border border-dashed border-border-shadcn" />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">{formatVnd(Number(item.basePrice))}</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-[#cd1e25]">{formatVnd(Number(item.totalPrice))}</td>
                                                    <td className="px-4 py-3">
                                                        <LTTBadge className={item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                                            {item.isActive ? "Active" : "Inactive"}
                                                        </LTTBadge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-1">
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
                                                {isExpanded && (
                                                    <tr className="border-b border-border-shadcn bg-muted-shadcn/20">
                                                        <td className="px-4 py-3" colSpan={7}>
                                                            <div className="space-y-2">
                                                                <p className="text-xs uppercase tracking-wide text-muted-foreground-shadcn">Bundled products</p>
                                                                {item.products.length === 0 ? (
                                                                    <p className="text-sm text-muted-foreground-shadcn">No products listed in this combo.</p>
                                                                ) : (
                                                                    <ul className="space-y-1">
                                                                        {item.products.map((line) => {
                                                                            const product = line.product ?? productById[line.productId];
                                                                            return (
                                                                                <li key={`${item.id}-${line.productId}`} className="flex items-center justify-between rounded-md border border-border-shadcn bg-card px-3 py-2 text-sm">
                                                                                    <span className="font-medium">{product?.name ?? line.productId}</span>
                                                                                    <span className="text-muted-foreground-shadcn">x {line.quantity}</span>
                                                                                </li>
                                                                            );
                                                                        })}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
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
                </>
            )}
        </>
    );
}
