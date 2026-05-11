"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogFooter,
    LTTDialogHeader,
    LTTDialogTitle,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
    LTTSelect,
    LTTSelectContent,
    LTTSelectItem,
    LTTSelectTrigger,
    LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { LTTTabs, LTTTabsList, LTTTabsTrigger } from "@/src/@core/component/LTTShadcnUI/LTTTabs";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { managerFnbService } from "@/src/services/administration-service/manager/fnb/fnb.service";
import {
    ComboProductLineDto,
    CreateCategoryInputDto,
    CreateComboInputDto,
    CreateProductInputDto,
    GetProductListInputDto,
    UpdateCategoryInputDto,
    UpdateComboInputDto,
    UpdateProductInputDto,
} from "@/src/services/administration-service/product/models/input.model";
import {
    CategoryOutputDto,
    ComboOutputDto,
    ProductOutputDto,
} from "@/src/services/administration-service/product/models/output.model";
import FnbTabSections from "./components/FnbTabSections";
import FnbDialogs from "./components/FnbDialogs";

type FnbTab = "products" | "category" | "combos";

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

const formatVnd = (amount: number) => `${amount.toLocaleString("vi-VN")}đ`;

function computeComboBasePriceFromLines(
    lines: ComboProductLineDto[],
    productMap: Record<string, ProductOutputDto>,
): number {
    return lines.reduce((sum, line) => {
        if (!line.productId) return sum;
        const p = productMap[line.productId];
        if (!p) return sum;
        const qty = Math.max(1, Number(line.quantity) || 1);
        return sum + Number(p.basePrice) * qty;
    }, 0);
}

function buildProductSnapshot(f: ProductFormState): string {
    return JSON.stringify({
        name: f.name,
        productCategoryId: f.productCategoryId,
        basePrice: f.basePrice,
        sellPrice: f.sellPrice,
        description: f.description,
        imageUrl: f.imageUrl,
        isActive: f.isActive,
    });
}

function buildCategorySnapshot(f: CategoryFormState): string {
    return JSON.stringify({
        name: f.name,
        description: f.description,
        isActive: f.isActive,
    });
}

function buildComboSnapshot(f: ComboFormState): string {
    return JSON.stringify({
        name: f.name,
        description: f.description,
        totalPrice: f.totalPrice,
        isActive: f.isActive,
        imageUrl: f.imageUrl,
        products: f.products.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    });
}

const defaultProductForm = (categoryId = ""): ProductFormState => ({
    name: "",
    productCategoryId: categoryId,
    basePrice: 0,
    sellPrice: 0,
    description: "",
    imageUrl: "",
    imageFile: undefined,
    isActive: true,
});

const defaultCategoryForm: CategoryFormState = {
    name: "",
    description: "",
    isActive: true,
};

const defaultComboForm: ComboFormState = {
    name: "",
    description: "",
    totalPrice: 0,
    isActive: true,
    imageUrl: "",
    imageFile: undefined,
    products: [],
};

export default function FnBPage() {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<FnbTab>("products");
    const [loadedTabs, setLoadedTabs] = useState<Record<FnbTab, boolean>>({
        products: false,
        category: false,
        combos: false,
    });

    const [products, setProducts] = useState<ProductOutputDto[]>([]);
    const [categories, setCategories] = useState<CategoryOutputDto[]>([]);
    const [combos, setCombos] = useState<ComboOutputDto[]>([]);

    const [productPage, setProductPage] = useState(1);
    const [productFetch, setProductFetch] = useState(10);
    const [productTotal, setProductTotal] = useState(0);
    const [comboPage, setComboPage] = useState(1);
    const [comboFetch, setComboFetch] = useState(10);
    const [comboTotal, setComboTotal] = useState(0);
    const [categoryPage, setCategoryPage] = useState(1);
    const [categoryFetch, setCategoryFetch] = useState(10);
    const [categoryTotal, setCategoryTotal] = useState(0);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categorySearch, setCategorySearch] = useState("");
    const [comboSearch, setComboSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [productDeleteDialogOpen, setProductDeleteDialogOpen] = useState(false);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);
    const [comboDialogOpen, setComboDialogOpen] = useState(false);
    const [comboDeleteDialogOpen, setComboDeleteDialogOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState<ProductOutputDto | null>(null);
    const [editingCategory, setEditingCategory] = useState<CategoryOutputDto | null>(null);
    const [editingCombo, setEditingCombo] = useState<ComboOutputDto | null>(null);

    const [singleProductDeleteId, setSingleProductDeleteId] = useState("");
    const [singleCategoryDeleteId, setSingleCategoryDeleteId] = useState("");
    const [singleComboDeleteId, setSingleComboDeleteId] = useState("");

    const [productForm, setProductForm] = useState<ProductFormState>(defaultProductForm());
    const [categoryForm, setCategoryForm] = useState<CategoryFormState>(defaultCategoryForm);
    const [comboForm, setComboForm] = useState<ComboFormState>(defaultComboForm);

    const [initialProductSnapshot, setInitialProductSnapshot] = useState("");
    const [initialCategorySnapshot, setInitialCategorySnapshot] = useState("");
    const [initialComboSnapshot, setInitialComboSnapshot] = useState("");
    const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
    const [exitConfirmTarget, setExitConfirmTarget] = useState<"product" | "category" | "combo" | null>(null);

    const LOCAL_STATE_KEY = "manager-fnb-local-state-v2";

    const listProductsMutation = useLTTMutation<PagedResultDto<ProductOutputDto> | undefined, GetProductListInputDto>({
        mutationFn: (input) => managerFnbService.getProductListAsync(input),
        onSuccess: (result) => {
            setProducts(result?.items || []);
            setProductTotal(result?.totalCount || 0);
        },
        onError: (err) => toast.error(err.message || "Failed to fetch products."),
    });

    const listCategoriesMutation = useLTTMutation<PagedResultDto<CategoryOutputDto> | undefined, { page: number; fetch: number; keyword?: string }>({
        mutationFn: ({ page, fetch, keyword }) => managerFnbService.getCategoryListAsync({ page, fetch, keyword }),
        onSuccess: (result) => {
            const nextCategories = result?.items || [];
            setCategories(nextCategories);
            setCategoryTotal(result?.totalCount || 0);

            if (nextCategories.length === 0) {
                setCategoryFilter("all");
                return;
            }

            if (categoryFilter !== "all" && !nextCategories.some((category) => category.id === categoryFilter)) {
                setCategoryFilter("all");
            }
        },
        onError: (err) => {
            toast.error(err.message || "Failed to fetch categories.");
        },
    });

    const listCombosMutation = useLTTMutation<PagedResultDto<ComboOutputDto> | undefined, { page: number; fetch: number; keyword?: string }>({
        mutationFn: (input) => managerFnbService.getComboListAsync(input),
        onSuccess: (result) => {
            setCombos(result?.items || []);
            setComboTotal(result?.totalCount || 0);
        },
        onError: (err) => toast.error(err.message || "Failed to fetch combos."),
    });

    function fetchProducts(page: number) {
        listProductsMutation.mutation({
            page,
            fetch: productFetch,
            keyword: debouncedSearch.trim(),
            categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        });
    }

    function fetchCategories(page: number, fetchSize = categoryFetch, keyword = categorySearch.trim()) {
        listCategoriesMutation.mutation({
            page,
            fetch: fetchSize,
            keyword: keyword || undefined,
        });
    }

    function fetchCombos(page: number) {
        listCombosMutation.mutation({
            page,
            fetch: comboFetch,
            keyword: comboSearch.trim(),
        });
    }

    const createProductMutation = useLTTMutation<ProductOutputDto | undefined, CreateProductInputDto>({
        mutationFn: (body) => managerFnbService.createProductAsync(body),
        onSuccess: () => {
            toast.success("Product created.");
            setProductDialogOpen(false);
            fetchProducts(productPage);
        },
        onError: (err) => toast.error(err.message || "Failed to create product."),
    });

    const updateProductMutation = useLTTMutation<ProductOutputDto | undefined, { id: string; body: UpdateProductInputDto }>({
        mutationFn: ({ id, body }) => managerFnbService.updateProductAsync(id, body),
        onSuccess: () => {
            toast.success("Product updated.");
            setProductDialogOpen(false);
            fetchProducts(productPage);
        },
        onError: (err) => toast.error(err.message || "Failed to update product."),
    });

    const createCategoryMutation = useLTTMutation<CategoryOutputDto | undefined, CreateCategoryInputDto>({
        mutationFn: (body) => managerFnbService.createCategoryAsync(body),
        onSuccess: () => {
            toast.success("Category created.");
            setCategoryDialogOpen(false);
            listCategoriesMutation.mutation({ page: categoryPage, fetch: categoryFetch, keyword: categorySearch.trim() || undefined });
        },
        onError: (err) => toast.error(err.message || "Failed to create category."),
    });

    const updateCategoryMutation = useLTTMutation<CategoryOutputDto | undefined, { id: string; body: UpdateCategoryInputDto }>({
        mutationFn: ({ id, body }) => managerFnbService.updateCategoryAsync(id, body),
        onSuccess: () => {
            toast.success("Category updated.");
            setCategoryDialogOpen(false);
            listCategoriesMutation.mutation({ page: categoryPage, fetch: categoryFetch, keyword: categorySearch.trim() || undefined });
        },
        onError: (err) => toast.error(err.message || "Failed to update category."),
    });

    const createComboMutation = useLTTMutation<ComboOutputDto | undefined, CreateComboInputDto>({
        mutationFn: (body) => managerFnbService.createComboAsync(body),
        onSuccess: () => {
            toast.success("Combo created.");
            setComboDialogOpen(false);
            fetchCombos(comboPage);
        },
        onError: (err) => toast.error(err.message || "Failed to create combo."),
    });

    const updateComboMutation = useLTTMutation<ComboOutputDto | undefined, { id: string; body: UpdateComboInputDto }>({
        mutationFn: ({ id, body }) => managerFnbService.updateComboAsync(id, body),
        onSuccess: () => {
            toast.success("Combo updated.");
            setComboDialogOpen(false);
            fetchCombos(comboPage);
        },
        onError: (err) => toast.error(err.message || "Failed to update combo."),
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const raw = window.localStorage.getItem(LOCAL_STATE_KEY);
        if (!raw) {
            return;
        }
        try {
            const local = JSON.parse(raw) as Partial<{
                activeTab: FnbTab;
                search: string;
                categorySearch: string;
                comboSearch: string;
                categoryFilter: string;
                productPage: number;
                productFetch: number;
                comboPage: number;
                comboFetch: number;
                categoryPage: number;
                categoryFetch: number;
            }>;
            if (local.activeTab) setActiveTab(local.activeTab);
            if (local.search !== undefined) setSearch(local.search);
            if (local.categorySearch !== undefined) setCategorySearch(local.categorySearch);
            if (local.comboSearch !== undefined) setComboSearch(local.comboSearch);
            if (local.categoryFilter !== undefined) setCategoryFilter(local.categoryFilter);
            if (local.productPage !== undefined) setProductPage(local.productPage);
            if (local.productFetch !== undefined) setProductFetch(local.productFetch);
            if (local.comboPage !== undefined) setComboPage(local.comboPage);
            if (local.comboFetch !== undefined) setComboFetch(local.comboFetch);
            if (local.categoryPage !== undefined) setCategoryPage(local.categoryPage);
            if (local.categoryFetch !== undefined) setCategoryFetch(local.categoryFetch);
        } catch {
            // Ignore invalid persisted state.
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem(
            LOCAL_STATE_KEY,
            JSON.stringify({
                activeTab,
                search,
                categorySearch,
                comboSearch,
                categoryFilter,
                productPage,
                productFetch,
                comboPage,
                comboFetch,
                categoryPage,
                categoryFetch,
            }),
        );
    }, [activeTab, search, categorySearch, comboSearch, categoryFilter, productPage, productFetch, comboPage, comboFetch, categoryPage, categoryFetch]);

    useEffect(() => {
        if (activeTab === "products" && !loadedTabs.products) {
            fetchProducts(productPage);
            if (!loadedTabs.category) {
                fetchCategories(1, 200, "");
            }
            setLoadedTabs((current) => ({ ...current, products: true, category: true }));
        }
        if (activeTab === "category" && !loadedTabs.category) {
            fetchCategories(categoryPage);
            setLoadedTabs((current) => ({ ...current, category: true }));
        }
        if (activeTab === "combos" && !loadedTabs.combos) {
            fetchCombos(comboPage);
            setLoadedTabs((current) => ({ ...current, combos: true }));
        }
    }, [activeTab, loadedTabs, productPage, comboPage, categoryPage, categoryFetch, categorySearch]);

    useEffect(() => {
        if (!loadedTabs.products || activeTab !== "products") {
            return;
        }
        fetchProducts(productPage);
    }, [loadedTabs.products, activeTab, productPage, productFetch, debouncedSearch, categoryFilter]);

    useEffect(() => {
        if (!loadedTabs.combos || activeTab !== "combos") {
            return;
        }
        fetchCombos(comboPage);
    }, [loadedTabs.combos, activeTab, comboPage, comboFetch, comboSearch]);

    useEffect(() => {
        if (!loadedTabs.category || activeTab !== "category") {
            return;
        }
        fetchCategories(categoryPage);
    }, [loadedTabs.category, activeTab, categoryPage, categoryFetch, categorySearch]);

    const categoryById = useMemo(
        () => categories.reduce<Record<string, CategoryOutputDto>>((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {}),
        [categories],
    );
    const productById = useMemo(
        () => products.reduce<Record<string, ProductOutputDto>>((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {}),
        [products],
    );

    const handleSafeProductDialogOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setProductDialogOpen(true);
            return;
        }
        const dirty =
            !!productForm.imageFile || initialProductSnapshot !== buildProductSnapshot(productForm);
        if (dirty) {
            setExitConfirmTarget("product");
            setExitConfirmOpen(true);
            return;
        }
        setProductDialogOpen(false);
    };

    const handleSafeCategoryDialogOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setCategoryDialogOpen(true);
            return;
        }
        const dirty = initialCategorySnapshot !== buildCategorySnapshot(categoryForm);
        if (dirty) {
            setExitConfirmTarget("category");
            setExitConfirmOpen(true);
            return;
        }
        setCategoryDialogOpen(false);
    };

    const handleSafeComboDialogOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setComboDialogOpen(true);
            return;
        }
        const dirty =
            !!comboForm.imageFile || initialComboSnapshot !== buildComboSnapshot(comboForm);
        if (dirty) {
            setExitConfirmTarget("combo");
            setExitConfirmOpen(true);
            return;
        }
        setComboDialogOpen(false);
    };

    const confirmDiscardExit = () => {
        const target = exitConfirmTarget;
        setExitConfirmOpen(false);
        setExitConfirmTarget(null);
        if (target === "product") setProductDialogOpen(false);
        else if (target === "category") setCategoryDialogOpen(false);
        else if (target === "combo") setComboDialogOpen(false);
    };

    const filteredCategories = useMemo(() => categories, [categories]);

    const isAnyLoading = listProductsMutation.isLoading || listCategoriesMutation.isLoading || listCombosMutation.isLoading;

    const openCreateProduct = () => {
        if (categories.length === 0) {
            fetchCategories(1, 200, "");
            toast.error("Categories are required before creating products.");
            return;
        }
        setEditingProduct(null);
        const next = defaultProductForm(categories[0].id);
        setProductForm(next);
        setInitialProductSnapshot(buildProductSnapshot(next));
        setProductDialogOpen(true);
    };

    const openEditProduct = (item: ProductOutputDto) => {
        setEditingProduct(item);
        const next: ProductFormState = {
            name: item.name,
            productCategoryId: item.productCategoryId,
            basePrice: Number(item.basePrice),
            sellPrice: Number(item.sellPrice),
            description: item.description || "",
            imageUrl: item.imageUrl || "",
            imageFile: undefined,
            isActive: item.isActive,
        };
        setProductForm(next);
        setInitialProductSnapshot(buildProductSnapshot(next));
        setProductDialogOpen(true);
    };

    const saveProduct = () => {
        if (!productForm.name.trim()) {
            toast.error("Product name is required.");
            return;
        }
        if (!productForm.productCategoryId) {
            toast.error("Category is required.");
            return;
        }

        const payload: CreateProductInputDto = {
            productCategoryId: productForm.productCategoryId,
            name: productForm.name.trim(),
            description: productForm.description.trim() || undefined,
            basePrice: productForm.basePrice,
            sellPrice: productForm.sellPrice,
            isActive: productForm.isActive,
            imageFile: productForm.imageFile,
            imageUrl: productForm.imageUrl.trim() || undefined,
        };

        if (editingProduct) {
            updateProductMutation.mutation({
                id: editingProduct.id,
                body: payload,
            });
            return;
        }

        createProductMutation.mutation(payload);
    };

    const openCreateCategory = () => {
        setEditingCategory(null);
        setCategoryForm(defaultCategoryForm);
        setInitialCategorySnapshot(buildCategorySnapshot(defaultCategoryForm));
        setCategoryDialogOpen(true);
    };

    const openEditCategory = (item: CategoryOutputDto) => {
        setEditingCategory(item);
        const next: CategoryFormState = {
            name: item.name,
            description: item.description || "",
            isActive: item.isActive,
        };
        setCategoryForm(next);
        setInitialCategorySnapshot(buildCategorySnapshot(next));
        setCategoryDialogOpen(true);
    };

    const saveCategory = () => {
        if (!categoryForm.name.trim()) {
            toast.error("Category name is required.");
            return;
        }
        const payload: CreateCategoryInputDto = {
            name: categoryForm.name.trim(),
            description: categoryForm.description.trim() || undefined,
            isActive: categoryForm.isActive,
        };

        if (editingCategory) {
            updateCategoryMutation.mutation({
                id: editingCategory.id,
                body: payload,
            });
            return;
        }
        createCategoryMutation.mutation(payload);
    };

    const openCreateCombo = () => {
        if (products.length === 0) {
            listProductsMutation.mutation({ page: 1, fetch: 200, keyword: "" });
        }
        setEditingCombo(null);
        setComboForm(defaultComboForm);
        setInitialComboSnapshot(buildComboSnapshot(defaultComboForm));
        setComboDialogOpen(true);
    };

    const openEditCombo = (item: ComboOutputDto) => {
        if (products.length === 0) {
            listProductsMutation.mutation({ page: 1, fetch: 200, keyword: "" });
        }
        setEditingCombo(item);
        const next: ComboFormState = {
            name: item.name,
            description: item.description || "",
            totalPrice: Number(item.totalPrice) || 0,
            isActive: item.isActive,
            imageUrl: item.imageUrl || "",
            imageFile: undefined,
            products: (item.products || []).map((line) => ({
                productId: line.productId,
                quantity: Math.max(1, line.quantity),
            })),
        };
        setComboForm(next);
        setInitialComboSnapshot(buildComboSnapshot(next));
        setComboDialogOpen(true);
    };

    const saveCombo = () => {
        if (!comboForm.name.trim()) {
            toast.error("Combo name is required.");
            return;
        }
        const payload: CreateComboInputDto = {
            name: comboForm.name.trim(),
            description: comboForm.description.trim() || undefined,
            totalPrice: comboForm.totalPrice,
            isActive: comboForm.isActive,
            imageFile: comboForm.imageFile,
            imageUrl: comboForm.imageUrl.trim() || undefined,
            products: comboForm.products
                .filter((line) => line.productId && line.quantity > 0)
                .map((line) => ({ productId: line.productId, quantity: line.quantity })),
        };

        if (editingCombo) {
            updateComboMutation.mutation({ id: editingCombo.id, body: payload });
            return;
        }

        createComboMutation.mutation(payload);
    };

    const toggleProductSelection = (id: string) => {
        setSelectedProductIds((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const bulkDeleteProducts = async () => {
        await Promise.allSettled(Array.from(selectedProductIds).map((id) => managerFnbService.deleteProductAsync(id)));
        setSelectedProductIds(new Set());
        setProductDeleteDialogOpen(false);
        fetchProducts(productPage);
        toast.success("Selected products deleted.");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">{t("admin.fnb.title")}</h1>
                <LTTButton
                    onClick={() => {
                        if (activeTab === "products") openCreateProduct();
                        if (activeTab === "category") openCreateCategory();
                        if (activeTab === "combos") openCreateCombo();
                    }}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" /> Add
                </LTTButton>
            </div>

            <LTTTabs value={activeTab} onValueChange={(value) => setActiveTab(value as FnbTab)}>
                <LTTTabsList className="bg-muted-shadcn/50 my-2">
                    <LTTTabsTrigger value="products">Products</LTTTabsTrigger>
                    <LTTTabsTrigger value="category">Category</LTTTabsTrigger>
                    <LTTTabsTrigger value="combos">Combos</LTTTabsTrigger>
                </LTTTabsList>
            </LTTTabs>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder="Search..."
                        value={activeTab === "products" ? search : activeTab === "category" ? categorySearch : comboSearch}
                        onChange={(e) => {
                            if (activeTab === "products") {
                                setSearch(e.target.value);
                                setProductPage(1);
                            } else if (activeTab === "category") {
                                setCategorySearch(e.target.value);
                                setCategoryPage(1);
                            } else {
                                setComboSearch(e.target.value);
                                setComboPage(1);
                            }
                        }}
                        className="pl-9"
                    />
                </div>

                {activeTab === "products" && (
                    <LTTSelect
                        value={categoryFilter}
                        onValueChange={(value: string) => {
                            setCategoryFilter(value);
                            setProductPage(1);
                        }}
                    >
                        <LTTSelectTrigger className="w-64">
                            <LTTSelectValue />
                        </LTTSelectTrigger>
                        <LTTSelectContent>
                            <LTTSelectItem value="all">All categories</LTTSelectItem>
                            {categories.map((category) => (
                                <LTTSelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </LTTSelectItem>
                            ))}
                        </LTTSelectContent>
                    </LTTSelect>
                )}

                <LTTButton
                    variant="outline"
                    className="gap-2"
                    loading={isAnyLoading}
                    onClick={() => {
                        if (activeTab === "products") {
                            setLoadedTabs((current) => ({ ...current, products: true }));
                            fetchProducts(1);
                        }
                        if (activeTab === "category") {
                            setLoadedTabs((current) => ({ ...current, category: true }));
                            setCategoryPage(1);
                            fetchCategories(1);
                        }
                        if (activeTab === "combos") {
                            setLoadedTabs((current) => ({ ...current, combos: true }));
                            fetchCombos(1);
                        }
                    }}
                >
                    <RefreshCw className="h-4 w-4" /> Refresh
                </LTTButton>
            </div>

            <FnbTabSections
                activeTab={activeTab}
                products={products}
                combos={combos}
                productById={productById}
                categoryById={categoryById}
                filteredCategories={filteredCategories}
                selectedProductIds={selectedProductIds}
                productTotal={productTotal}
                productPage={productPage}
                productFetch={productFetch}
                comboTotal={comboTotal}
                comboPage={comboPage}
                comboFetch={comboFetch}
                categoryTotal={categoryTotal}
                categoryPage={categoryPage}
                categoryFetch={categoryFetch}
                isProductsLoading={listProductsMutation.isLoading}
                isCategoriesLoading={listCategoriesMutation.isLoading}
                isCombosLoading={listCombosMutation.isLoading}
                formatVnd={formatVnd}
                onToggleAllProducts={() =>
                    setSelectedProductIds(
                        products.length > 0 && products.every((item) => selectedProductIds.has(item.id))
                            ? new Set()
                            : new Set(products.map((item) => item.id)),
                    )
                }
                onToggleProduct={toggleProductSelection}
                onOpenEditProduct={openEditProduct}
                onOpenDeleteProduct={(id) => {
                    setSingleProductDeleteId(id);
                    setProductDeleteDialogOpen(true);
                }}
                onBulkDeleteProducts={bulkDeleteProducts}
                onProductPageChange={(nextPage) => setProductPage(nextPage)}
                onProductPageSizeChange={(nextSize) => {
                    setProductFetch(nextSize);
                    setProductPage(1);
                }}
                onOpenEditCategory={openEditCategory}
                onOpenDeleteCategory={(id) => {
                    setSingleCategoryDeleteId(id);
                    setCategoryDeleteDialogOpen(true);
                }}
                onCategoryPageChange={(nextPage) => setCategoryPage(nextPage)}
                onCategoryPageSizeChange={(nextSize) => {
                    setCategoryFetch(nextSize);
                    setCategoryPage(1);
                }}
                onOpenEditCombo={openEditCombo}
                onOpenDeleteCombo={(id) => {
                    setSingleComboDeleteId(id);
                    setComboDeleteDialogOpen(true);
                }}
                onComboPageChange={(nextPage) => setComboPage(nextPage)}
                onComboPageSizeChange={(nextSize) => {
                    setComboFetch(nextSize);
                    setComboPage(1);
                }}
            />

            <LTTDialog
                open={exitConfirmOpen}
                onOpenChange={(open) => {
                    setExitConfirmOpen(open);
                    if (!open) setExitConfirmTarget(null);
                }}
            >
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{t("admin.fnb.exit_confirm.title")}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-2 text-sm text-muted-foreground-shadcn leading-relaxed">
                        {t("admin.fnb.exit_confirm.message_before")}{" "}
                        <strong className="text-destructive">{t("admin.fnb.exit_confirm.message_highlight")}</strong>.{" "}
                        {t("admin.fnb.exit_confirm.message_after")}
                    </div>
                    <LTTDialogFooter className="gap-3">
                        <LTTButton
                            variant="outline"
                            onClick={() => {
                                setExitConfirmOpen(false);
                                setExitConfirmTarget(null);
                            }}
                            className="flex-1"
                        >
                            {t("admin.fnb.exit_confirm.stay")}
                        </LTTButton>
                        <LTTButton variant="destructive" onClick={confirmDiscardExit} className="flex-1">
                            {t("admin.fnb.exit_confirm.exit")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <FnbDialogs
                categories={categories}
                products={products}
                editingProduct={editingProduct}
                editingCategory={editingCategory}
                editingCombo={editingCombo}
                productForm={productForm}
                categoryForm={categoryForm}
                comboForm={comboForm}
                productDialogOpen={productDialogOpen}
                categoryDialogOpen={categoryDialogOpen}
                comboDialogOpen={comboDialogOpen}
                productDeleteDialogOpen={productDeleteDialogOpen}
                categoryDeleteDialogOpen={categoryDeleteDialogOpen}
                comboDeleteDialogOpen={comboDeleteDialogOpen}
                isProductSaving={createProductMutation.isLoading || updateProductMutation.isLoading}
                isCategorySaving={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
                isComboSaving={createComboMutation.isLoading || updateComboMutation.isLoading}
                formatVnd={formatVnd}
                onProductDialogOpenChange={handleSafeProductDialogOpenChange}
                onCategoryDialogOpenChange={handleSafeCategoryDialogOpenChange}
                onComboDialogOpenChange={handleSafeComboDialogOpenChange}
                onProductDeleteDialogOpenChange={setProductDeleteDialogOpen}
                onCategoryDeleteDialogOpenChange={setCategoryDeleteDialogOpen}
                onComboDeleteDialogOpenChange={setComboDeleteDialogOpen}
                setProductForm={(updater) => setProductForm((prev) => updater(prev))}
                setCategoryForm={(updater) => setCategoryForm((prev) => updater(prev))}
                setComboForm={(updater) => setComboForm((prev) => updater(prev))}
                onSaveProduct={saveProduct}
                onSaveCategory={saveCategory}
                onSaveCombo={saveCombo}
                onConfirmDeleteProduct={async () => {
                    await managerFnbService.deleteProductAsync(singleProductDeleteId);
                    setProductDeleteDialogOpen(false);
                    fetchProducts(productPage);
                    toast.success("Product deleted.");
                }}
                onConfirmDeleteCategory={async () => {
                    await managerFnbService.deleteCategoryAsync(singleCategoryDeleteId);
                    setCategoryDeleteDialogOpen(false);
                    listCategoriesMutation.mutation({ page: categoryPage, fetch: categoryFetch, keyword: categorySearch.trim() || undefined });
                    toast.success("Category deleted.");
                }}
                onConfirmDeleteCombo={async () => {
                    await managerFnbService.deleteComboAsync(singleComboDeleteId);
                    setComboDeleteDialogOpen(false);
                    fetchCombos(comboPage);
                    toast.success("Combo deleted.");
                }}
            />
        </div>
    );
}
