"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
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
    CreateCategoryInputDto,
    CreateComboInputDto,
    CreateComboItemInputDto,
    CreateProductInputDto,
    CreateProductVariantInputDto,
    GetProductListInputDto,
    UpdateCategoryInputDto,
    UpdateComboInputDto,
    UpdateProductInputDto,
    UpdateProductVariantInputDto,
} from "@/src/services/administration-service/product/models/input.model";
import {
    CategoryOutputDto,
    ComboDetailOutputDto,
    ComboOutputDto,
    ProductDetailOutputDto,
    ProductOutputDto,
    ProductVariantOutputDto,
} from "@/src/services/administration-service/product/models/output.model";
import FnbTabSections from "./components/FnbTabSections";
import FnbDialogs from "./components/FnbDialogs";

type FnbTab = "products" | "category" | "combos" | "variant";

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

const formatVnd = (amount: number) => `${amount.toLocaleString("vi-VN")}đ`;

const defaultProductForm = (categoryId = ""): ProductFormState => ({
    name: "",
    productCategoryId: categoryId,
    basePrice: 0,
    description: "",
    imageUrl: "",
    isActive: true,
    productType: "Food",
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
};

const defaultVariantForm: VariantFormState = {
    name: "",
    additionalPrice: 0,
    isActive: true,
};

export default function FnBPage() {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<FnbTab>("products");
    const [loadedTabs, setLoadedTabs] = useState<Record<FnbTab, boolean>>({
        products: false,
        category: false,
        combos: false,
        variant: false,
    });

    const [products, setProducts] = useState<ProductOutputDto[]>([]);
    const [categories, setCategories] = useState<CategoryOutputDto[]>([]);
    const [combos, setCombos] = useState<ComboOutputDto[]>([]);
    const [comboDetailMap, setComboDetailMap] = useState<Record<string, ComboDetailOutputDto>>({});
    const [variantRows, setVariantRows] = useState<ProductVariantOutputDto[]>([]);

    const [productPage, setProductPage] = useState(1);
    const [productFetch, setProductFetch] = useState(10);
    const [productTotal, setProductTotal] = useState(0);
    const [comboPage, setComboPage] = useState(1);
    const [comboFetch, setComboFetch] = useState(10);
    const [comboTotal, setComboTotal] = useState(0);
    const [categoryPage, setCategoryPage] = useState(1);
    const [categoryFetch, setCategoryFetch] = useState(10);
    const [categoryTotal, setCategoryTotal] = useState(0);
    const [variantPage, setVariantPage] = useState(1);
    const [variantFetch, setVariantFetch] = useState(10);
    const [variantTotal, setVariantTotal] = useState(0);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categorySearch, setCategorySearch] = useState("");
    const [comboSearch, setComboSearch] = useState("");
    const [variantSearch, setVariantSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [variantProductId, setVariantProductId] = useState("all");
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [productDeleteDialogOpen, setProductDeleteDialogOpen] = useState(false);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);
    const [comboDialogOpen, setComboDialogOpen] = useState(false);
    const [comboDeleteDialogOpen, setComboDeleteDialogOpen] = useState(false);
    const [comboItemDialogOpen, setComboItemDialogOpen] = useState(false);
    const [variantDialogOpen, setVariantDialogOpen] = useState(false);
    const [variantDeleteDialogOpen, setVariantDeleteDialogOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState<ProductOutputDto | null>(null);
    const [editingCategory, setEditingCategory] = useState<CategoryOutputDto | null>(null);
    const [editingCombo, setEditingCombo] = useState<ComboOutputDto | null>(null);
    const [editingVariant, setEditingVariant] = useState<ProductVariantOutputDto | null>(null);

    const [singleProductDeleteId, setSingleProductDeleteId] = useState("");
    const [singleCategoryDeleteId, setSingleCategoryDeleteId] = useState("");
    const [singleComboDeleteId, setSingleComboDeleteId] = useState("");
    const [singleVariantDeleteId, setSingleVariantDeleteId] = useState("");
    const [selectedComboForItem, setSelectedComboForItem] = useState<string>("");
    const [selectedComboItemId, setSelectedComboItemId] = useState<string>("");

    const [productForm, setProductForm] = useState<ProductFormState>(defaultProductForm());
    const [categoryForm, setCategoryForm] = useState<CategoryFormState>(defaultCategoryForm);
    const [comboForm, setComboForm] = useState<ComboFormState>(defaultComboForm);
    const [variantForm, setVariantForm] = useState<VariantFormState>(defaultVariantForm);
    const [comboItemForm, setComboItemForm] = useState<CreateComboItemInputDto>({
        productId: "",
        quantity: 1,
    });

    const LOCAL_STATE_KEY = "manager-fnb-local-state-v1";

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
                setVariantProductId("all");
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

    const getComboDetailMutation = useLTTMutation<ComboDetailOutputDto | undefined, string>({
        mutationFn: (comboId) => managerFnbService.getComboByIdAsync(comboId),
        onSuccess: (detail) => {
            if (!detail) {
                return;
            }
            setComboDetailMap((current) => ({ ...current, [detail.id]: detail }));
        },
        onError: (err) => toast.error(err.message || "Failed to fetch combo items."),
    });

    const getProductDetailMutation = useLTTMutation<ProductDetailOutputDto | undefined, string>({
        mutationFn: (productId) => managerFnbService.getProductByIdAsync(productId),
        onSuccess: (detail) => {
            setVariantRows(detail?.productVariants || []);
        },
        onError: (err) => toast.error(err.message || "Failed to fetch variants."),
    });

    function fetchProducts(page: number) {
        listProductsMutation.mutation({
            page,
            fetch: productFetch,
            keyword: debouncedSearch.trim(),
            categoryId: categoryFilter === "all" ? undefined : categoryFilter,
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

    const createVariantMutation = useLTTMutation<ProductVariantOutputDto | undefined, CreateProductVariantInputDto>({
        mutationFn: (body) => managerFnbService.createProductVariantAsync(variantProductId, body),
        onSuccess: () => {
            toast.success("Variant created.");
            setVariantDialogOpen(false);
            if (variantProductId !== "all") {
                getProductDetailMutation.mutation(variantProductId);
            }
        },
        onError: (err) => toast.error(err.message || "Failed to create variant."),
    });

    const updateVariantMutation = useLTTMutation<ProductVariantOutputDto | undefined, UpdateProductVariantInputDto>({
        mutationFn: (body) => managerFnbService.updateProductVariantAsync(variantProductId, editingVariant?.id || "", body),
        onSuccess: () => {
            toast.success("Variant updated.");
            setVariantDialogOpen(false);
            if (variantProductId !== "all") {
                getProductDetailMutation.mutation(variantProductId);
            }
        },
        onError: (err) => toast.error(err.message || "Failed to update variant."),
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
                variantSearch: string;
                categoryFilter: string;
                variantProductId: string;
                productPage: number;
                productFetch: number;
                comboPage: number;
                comboFetch: number;
                categoryPage: number;
                categoryFetch: number;
                variantPage: number;
                variantFetch: number;
            }>;
            if (local.activeTab) setActiveTab(local.activeTab);
            if (local.search !== undefined) setSearch(local.search);
            if (local.categorySearch !== undefined) setCategorySearch(local.categorySearch);
            if (local.comboSearch !== undefined) setComboSearch(local.comboSearch);
            if (local.variantSearch !== undefined) setVariantSearch(local.variantSearch);
            if (local.categoryFilter !== undefined) setCategoryFilter(local.categoryFilter);
            if (local.variantProductId !== undefined) setVariantProductId(local.variantProductId);
            if (local.productPage !== undefined) setProductPage(local.productPage);
            if (local.productFetch !== undefined) setProductFetch(local.productFetch);
            if (local.comboPage !== undefined) setComboPage(local.comboPage);
            if (local.comboFetch !== undefined) setComboFetch(local.comboFetch);
            if (local.categoryPage !== undefined) setCategoryPage(local.categoryPage);
            if (local.categoryFetch !== undefined) setCategoryFetch(local.categoryFetch);
            if (local.variantPage !== undefined) setVariantPage(local.variantPage);
            if (local.variantFetch !== undefined) setVariantFetch(local.variantFetch);
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
                variantSearch,
                categoryFilter,
                variantProductId,
                productPage,
                productFetch,
                comboPage,
                comboFetch,
                categoryPage,
                categoryFetch,
                variantPage,
                variantFetch,
            }),
        );
    }, [
        activeTab,
        search,
        categorySearch,
        comboSearch,
        variantSearch,
        categoryFilter,
        variantProductId,
        productPage,
        productFetch,
        comboPage,
        comboFetch,
        categoryPage,
        categoryFetch,
        variantPage,
        variantFetch,
    ]);

    useEffect(() => {
        if (activeTab === "products" && !loadedTabs.products) {
            fetchProducts(productPage);
            setLoadedTabs((current) => ({ ...current, products: true }));
        }
        if (activeTab === "category" && !loadedTabs.category) {
            listCategoriesMutation.mutation({ page: categoryPage, fetch: categoryFetch, keyword: categorySearch.trim() || undefined });
            setLoadedTabs((current) => ({ ...current, category: true }));
        }
        if (activeTab === "combos" && !loadedTabs.combos) {
            fetchCombos(comboPage);
            setLoadedTabs((current) => ({ ...current, combos: true }));
        }
        if (activeTab === "variant" && !loadedTabs.variant) {
            setLoadedTabs((current) => ({ ...current, variant: true }));
            if (variantProductId !== "all") {
                getProductDetailMutation.mutation(variantProductId);
            }
        }
    }, [activeTab, loadedTabs, productPage, comboPage, categoryPage, categoryFetch, categorySearch, variantProductId]);

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
        listCategoriesMutation.mutation({ page: categoryPage, fetch: categoryFetch, keyword: categorySearch.trim() || undefined });
    }, [loadedTabs.category, activeTab, categoryPage, categoryFetch, categorySearch]);

    useEffect(() => {
        if (!loadedTabs.variant || activeTab !== "variant") {
            return;
        }
        if (variantProductId !== "all") {
            getProductDetailMutation.mutation(variantProductId);
        } else {
            setVariantRows([]);
        }
    }, [loadedTabs.variant, activeTab, variantProductId]);

    useEffect(() => {
        setVariantPage(1);
    }, [variantSearch, variantProductId]);

    const categoryById = useMemo(
        () => categories.reduce<Record<string, CategoryOutputDto>>((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {}),
        [categories],
    );

    const filteredCategories = useMemo(() => categories, [categories]);

    const filteredVariants = useMemo(() => {
        if (!variantSearch.trim()) {
            return variantRows;
        }
        const query = variantSearch.trim().toLowerCase();
        return variantRows.filter((variant) => variant.name.toLowerCase().includes(query));
    }, [variantRows, variantSearch]);

    const pagedVariants = useMemo(() => {
        const start = (variantPage - 1) * variantFetch;
        return filteredVariants.slice(start, start + variantFetch);
    }, [filteredVariants, variantPage, variantFetch]);

    useEffect(() => {
        setVariantTotal(filteredVariants.length);
    }, [filteredVariants]);

    const isAnyLoading = listProductsMutation.isLoading || listCategoriesMutation.isLoading || listCombosMutation.isLoading;

    const openCreateProduct = () => {
        if (categories.length === 0) {
            toast.error("Categories are required before creating products.");
            return;
        }
        setEditingProduct(null);
        setProductForm(defaultProductForm(categories[0].id));
        setProductDialogOpen(true);
    };

    const openEditProduct = (item: ProductOutputDto) => {
        setEditingProduct(item);
        setProductForm({
            name: item.name,
            productCategoryId: item.productCategoryId,
            basePrice: Number(item.basePrice),
            description: item.description || "",
            imageUrl: item.imageUrl || "",
            isActive: item.isActive,
            productType: item.productType || "Food",
        });
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
            imageUrl: productForm.imageUrl.trim() || undefined,
            isActive: productForm.isActive,
            productType: productForm.productType.trim() || undefined,
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
        setCategoryDialogOpen(true);
    };

    const openEditCategory = (item: CategoryOutputDto) => {
        setEditingCategory(item);
        setCategoryForm({
            name: item.name,
            description: item.description || "",
            isActive: item.isActive,
        });
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
        setEditingCombo(null);
        setComboForm(defaultComboForm);
        setComboDialogOpen(true);
    };

    const openEditCombo = (item: ComboOutputDto) => {
        setEditingCombo(item);
        setComboForm({
            name: item.name,
            description: item.description || "",
            totalPrice: Number(item.totalPrice),
            isActive: item.isActive,
        });
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
            comboItems: [],
        };

        if (editingCombo) {
            const updatePayload: UpdateComboInputDto = {
                name: payload.name,
                description: payload.description,
                totalPrice: payload.totalPrice,
                isActive: payload.isActive,
            };
            updateComboMutation.mutation({ id: editingCombo.id, body: updatePayload });
            return;
        }

        createComboMutation.mutation(payload);
    };

    const openCreateVariant = () => {
        if (variantProductId === "all") {
            toast.error("Select a product first.");
            return;
        }
        setEditingVariant(null);
        setVariantForm(defaultVariantForm);
        setVariantDialogOpen(true);
    };

    const openEditVariant = (item: ProductVariantOutputDto) => {
        setEditingVariant(item);
        setVariantForm({
            name: item.name,
            additionalPrice: Number(item.additionalPrice),
            isActive: item.isActive,
        });
        setVariantDialogOpen(true);
    };

    const saveVariant = () => {
        if (variantProductId === "all") {
            toast.error("Select a product first.");
            return;
        }
        if (!variantForm.name.trim()) {
            toast.error("Variant name is required.");
            return;
        }

        const payload: CreateProductVariantInputDto = {
            name: variantForm.name.trim(),
            additionalPrice: variantForm.additionalPrice,
            isActive: variantForm.isActive,
        };

        if (editingVariant) {
            updateVariantMutation.mutation(payload as UpdateProductVariantInputDto);
            return;
        }

        createVariantMutation.mutation(payload);
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

    const onAddComboItem = async () => {
        if (!selectedComboForItem) {
            toast.error("Select a combo first.");
            return;
        }
        if (!comboItemForm.productId) {
            toast.error("Select a product.");
            return;
        }
        if (comboItemForm.quantity < 1) {
            toast.error("Quantity must be at least 1.");
            return;
        }
        await managerFnbService.addComboItemAsync(selectedComboForItem, comboItemForm);
        getComboDetailMutation.mutation(selectedComboForItem);
        setComboItemDialogOpen(false);
        setComboItemForm({ productId: "", quantity: 1 });
        toast.success("Combo item added.");
    };

    const currentComboDetail = selectedComboForItem ? comboDetailMap[selectedComboForItem] : undefined;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">{t("admin.fnb.title")}</h1>
                <LTTButton
                    onClick={() => {
                        if (activeTab === "products") openCreateProduct();
                        if (activeTab === "category") openCreateCategory();
                        if (activeTab === "combos") openCreateCombo();
                        if (activeTab === "variant") openCreateVariant();
                    }}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" /> Add
                </LTTButton>
            </div>

            <LTTTabs value={activeTab} onValueChange={(value) => setActiveTab(value as FnbTab)}>
                <LTTTabsList className="bg-muted-shadcn/50">
                    <LTTTabsTrigger value="products">Products</LTTTabsTrigger>
                    <LTTTabsTrigger value="category">Category</LTTTabsTrigger>
                    <LTTTabsTrigger value="combos">Combos</LTTTabsTrigger>
                    <LTTTabsTrigger value="variant">Variant</LTTTabsTrigger>
                </LTTTabsList>
            </LTTTabs>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder="Search..."
                        value={activeTab === "products" ? search : activeTab === "category" ? categorySearch : activeTab === "combos" ? comboSearch : variantSearch}
                        onChange={(e) => {
                            if (activeTab === "products") {
                                setSearch(e.target.value);
                                setProductPage(1);
                            } else if (activeTab === "category") {
                                setCategorySearch(e.target.value);
                                setCategoryPage(1);
                            } else if (activeTab === "combos") {
                                setComboSearch(e.target.value);
                                setComboPage(1);
                            } else {
                                setVariantSearch(e.target.value);
                                setVariantPage(1);
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

                {activeTab === "variant" && (
                    <LTTSelect
                        value={variantProductId}
                        onValueChange={(value: string) => {
                            setVariantProductId(value);
                            setVariantPage(1);
                        }}
                    >
                        <LTTSelectTrigger className="w-64">
                            <LTTSelectValue placeholder="Choose product" />
                        </LTTSelectTrigger>
                        <LTTSelectContent>
                            <LTTSelectItem value="all">Choose product</LTTSelectItem>
                            {products.map((product) => (
                                <LTTSelectItem key={product.id} value={product.id}>
                                    {product.name}
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
                            listCategoriesMutation.mutation({ page: 1, fetch: categoryFetch, keyword: categorySearch.trim() || undefined });
                        }
                        if (activeTab === "combos") {
                            setLoadedTabs((current) => ({ ...current, combos: true }));
                            fetchCombos(1);
                        }
                        if (activeTab === "variant" && variantProductId !== "all") getProductDetailMutation.mutation(variantProductId);
                    }}
                >
                    <RefreshCw className="h-4 w-4" /> Refresh
                </LTTButton>
            </div>

            <FnbTabSections
                activeTab={activeTab}
                products={products}
                combos={combos}
                categoryById={categoryById}
                filteredCategories={filteredCategories}
                filteredVariants={pagedVariants}
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
                variantTotal={variantTotal}
                variantPage={variantPage}
                variantFetch={variantFetch}
                variantProductId={variantProductId}
                selectedComboForItem={selectedComboForItem}
                currentComboDetail={currentComboDetail}
                selectedComboItemId={selectedComboItemId}
                isProductsLoading={listProductsMutation.isLoading}
                isCategoriesLoading={listCategoriesMutation.isLoading}
                isCombosLoading={listCombosMutation.isLoading}
                isComboDetailLoading={getComboDetailMutation.isLoading}
                isVariantsLoading={getProductDetailMutation.isLoading}
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
                onOpenComboItems={(id) => {
                    setSelectedComboForItem(id);
                    getComboDetailMutation.mutation(id);
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
                onOpenCreateComboItem={() => {
                    setComboItemForm({
                        productId: products[0]?.id || "",
                        quantity: 1,
                    });
                    setComboItemDialogOpen(true);
                }}
                onDeleteComboItem={async (comboItemId) => {
                    setSelectedComboItemId(comboItemId);
                    await managerFnbService.deleteComboItemAsync(selectedComboForItem, comboItemId);
                    toast.success("Combo item deleted.");
                    getComboDetailMutation.mutation(selectedComboForItem);
                    setSelectedComboItemId("");
                }}
                onOpenEditVariant={openEditVariant}
                onOpenDeleteVariant={(id) => {
                    setSingleVariantDeleteId(id);
                    setVariantDeleteDialogOpen(true);
                }}
                onVariantPageChange={(nextPage) => setVariantPage(nextPage)}
                onVariantPageSizeChange={(nextSize) => {
                    setVariantFetch(nextSize);
                    setVariantPage(1);
                }}
            />

            <FnbDialogs
                categories={categories}
                products={products}
                editingProduct={editingProduct}
                editingCategory={editingCategory}
                editingCombo={editingCombo}
                editingVariant={editingVariant}
                productForm={productForm}
                categoryForm={categoryForm}
                comboForm={comboForm}
                variantForm={variantForm}
                comboItemForm={comboItemForm}
                productDialogOpen={productDialogOpen}
                categoryDialogOpen={categoryDialogOpen}
                comboDialogOpen={comboDialogOpen}
                variantDialogOpen={variantDialogOpen}
                comboItemDialogOpen={comboItemDialogOpen}
                productDeleteDialogOpen={productDeleteDialogOpen}
                categoryDeleteDialogOpen={categoryDeleteDialogOpen}
                comboDeleteDialogOpen={comboDeleteDialogOpen}
                variantDeleteDialogOpen={variantDeleteDialogOpen}
                isProductSaving={createProductMutation.isLoading || updateProductMutation.isLoading}
                isCategorySaving={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
                isComboSaving={createComboMutation.isLoading || updateComboMutation.isLoading}
                isVariantSaving={createVariantMutation.isLoading || updateVariantMutation.isLoading}
                onProductDialogOpenChange={setProductDialogOpen}
                onCategoryDialogOpenChange={setCategoryDialogOpen}
                onComboDialogOpenChange={setComboDialogOpen}
                onVariantDialogOpenChange={setVariantDialogOpen}
                onComboItemDialogOpenChange={setComboItemDialogOpen}
                onProductDeleteDialogOpenChange={setProductDeleteDialogOpen}
                onCategoryDeleteDialogOpenChange={setCategoryDeleteDialogOpen}
                onComboDeleteDialogOpenChange={setComboDeleteDialogOpen}
                onVariantDeleteDialogOpenChange={setVariantDeleteDialogOpen}
                setProductForm={(updater) => setProductForm((prev) => updater(prev))}
                setCategoryForm={(updater) => setCategoryForm((prev) => updater(prev))}
                setComboForm={(updater) => setComboForm((prev) => updater(prev))}
                setVariantForm={(updater) => setVariantForm((prev) => updater(prev))}
                setComboItemForm={(updater) => setComboItemForm((prev) => updater(prev))}
                onSaveProduct={saveProduct}
                onSaveCategory={saveCategory}
                onSaveCombo={saveCombo}
                onSaveVariant={saveVariant}
                onAddComboItem={onAddComboItem}
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
                onConfirmDeleteVariant={async () => {
                    await managerFnbService.deleteProductVariantAsync(variantProductId, singleVariantDeleteId);
                    setVariantDeleteDialogOpen(false);
                    getProductDetailMutation.mutation(variantProductId);
                    toast.success("Variant deleted.");
                }}
            />
        </div>
    );
}
