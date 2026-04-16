import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { 
    GetProductListInputDto, 
    CreateProductInputDto, 
    UpdateProductInputDto,
    CreateCategoryInputDto,
    CreateComboInputDto
} from "./models/input.model";
import { 
    ProductOutputDto, 
    CategoryOutputDto, 
    ComboOutputDto 
} from "./models/output.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

class ProductService {
    private readonly prefix = "/ltc/product-service/api/administration/admin";

    // Product CRUD
    async getProductList(params: any): Promise<PagedResultDto<ProductOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<ProductOutputDto>>>(`${this.prefix}/product-all`, { params });
        return response.data.data;
    }

    async getProductDetail(id: string): Promise<ProductOutputDto> {
        const response = await http.get<ApiResult<ProductOutputDto>>(`${this.prefix}/product/${id}`);
        return response.data.data;
    }

    async createProduct(body: CreateProductInputDto): Promise<ProductOutputDto> {
        const response = await http.post<ApiResult<ProductOutputDto>>(`${this.prefix}/product`, body);
        return response.data.data;
    }

    async updateProduct(id: string, body: UpdateProductInputDto): Promise<ProductOutputDto> {
        const response = await http.put<ApiResult<ProductOutputDto>>(`${this.prefix}/product/${id}`, body);
        return response.data.data;
    }

    async deleteProduct(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/product/${id}`);
    }

    // Category CRUD
    async getCategoryList(): Promise<PagedResultDto<CategoryOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<CategoryOutputDto>>>(`${this.prefix}/category-all`);
        return response.data.data;
    }

    async createCategory(body: CreateCategoryInputDto): Promise<CategoryOutputDto> {
        const response = await http.post<ApiResult<CategoryOutputDto>>(`${this.prefix}/category`, body);
        return response.data.data;
    }

    // Combo CRUD
    async getComboList(): Promise<PagedResultDto<ComboOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<ComboOutputDto>>>(`${this.prefix}/combo-all`);
        return response.data.data;
    }

    async createCombo(body: CreateComboInputDto): Promise<ComboOutputDto> {
        const response = await http.post<ApiResult<ComboOutputDto>>(`${this.prefix}/combo`, body);
        return response.data.data;
    }
}

export const productService = new ProductService();
