package com.sm3Agro.SM3AgroERP.inventory.dto.product;

import com.sm3Agro.SM3AgroERP.inventory.enums.ProductType;

public record CreateProductRequest(
        String name,
        Long unitId,
        Long productFamilyId,
        ProductType productType,
        Boolean active
) {
}
