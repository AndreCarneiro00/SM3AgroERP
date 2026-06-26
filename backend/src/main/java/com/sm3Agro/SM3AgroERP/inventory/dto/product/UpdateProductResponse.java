package com.sm3Agro.SM3AgroERP.inventory.dto.product;

import com.sm3Agro.SM3AgroERP.inventory.enums.ProductType;

public record UpdateProductResponse(
        Long id,
        String name,
        Long unitId,
        String unitName,
        Long productFamilyId,
        String productFamilyName,
        ProductType productType,
        Boolean active
) {
}
