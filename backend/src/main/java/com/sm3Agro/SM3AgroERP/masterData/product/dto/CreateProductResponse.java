package com.sm3Agro.SM3AgroERP.masterData.product.dto;

import com.sm3Agro.SM3AgroERP.masterData.product.enums.ProductType;

import java.time.LocalDate;

public record CreateProductResponse(
        Long id,
        String name,
        Long unitId,
        String unitName,
        Long productFamilyId,
        String productFamilyName,
        ProductType productType,
        Boolean active,
        Boolean hasStock,
        LocalDate stockControlStartDate
) {
}
