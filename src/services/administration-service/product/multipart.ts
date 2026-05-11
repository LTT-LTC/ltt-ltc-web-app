import {
    CreateComboInputDto,
    CreateProductInputDto,
    UpdateComboInputDto,
    UpdateProductInputDto,
} from "./models/input.model";

const appendIfDefined = (form: FormData, key: string, value: unknown) => {
    if (value === undefined || value === null) {
        return;
    }
    if (typeof value === "boolean") {
        form.append(key, value ? "true" : "false");
        return;
    }
    if (value instanceof File) {
        form.append(key, value);
        return;
    }
    form.append(key, String(value));
};

/**
 * Builds a FormData payload for product create/update.
 *
 * The .NET DTO is `CreateProductInputDto { ProductCategoryId, Name, Description?,
 * BasePrice, IsActive, ImageFile?, ImageUrl? }`. Field names are matched in
 * PascalCase so the model binder picks them up regardless of casing rules.
 */
export const buildProductFormData = (
    input: CreateProductInputDto | UpdateProductInputDto,
): FormData => {
    const form = new FormData();
    appendIfDefined(form, "ProductCategoryId", input.productCategoryId);
    appendIfDefined(form, "Name", input.name);
    appendIfDefined(form, "Description", input.description ?? "");
    appendIfDefined(form, "BasePrice", input.basePrice);
    appendIfDefined(form, "SellPrice", input.sellPrice);
    appendIfDefined(form, "IsActive", input.isActive);
    appendIfDefined(form, "ImageUrl", input.imageUrl ?? "");
    if (input.imageFile) {
        form.append("ImageFile", input.imageFile, input.imageFile.name);
    }
    return form;
};

/**
 * Builds a FormData payload for combo create/update. `Products` is sent as a
 * series of indexed entries so model-binding hydrates `List<ComboProductLineDto>`.
 */
export const buildComboFormData = (
    input: CreateComboInputDto | UpdateComboInputDto,
): FormData => {
    const form = new FormData();
    appendIfDefined(form, "Name", input.name);
    appendIfDefined(form, "Description", input.description ?? "");
    appendIfDefined(form, "TotalPrice", input.totalPrice);
    appendIfDefined(form, "IsActive", input.isActive);
    appendIfDefined(form, "ImageUrl", input.imageUrl ?? "");
    if (input.imageFile) {
        form.append("ImageFile", input.imageFile, input.imageFile.name);
    }
    (input.products ?? []).forEach((line, index) => {
        form.append(`Products[${index}].ProductId`, line.productId);
        form.append(`Products[${index}].Quantity`, String(Math.max(1, line.quantity)));
    });
    return form;
};
