package com.sm3Agro.SM3AgroERP.masterData.product.dto;

import com.sm3Agro.SM3AgroERP.masterData.product.enums.ProductType;

import java.time.LocalDate;

public record UpdateProductRequest(
        String name,
        Long unitId,
        Long productFamilyId,
        ProductType productType,
        Boolean active,
        Boolean hasStock,
        LocalDate stockControlStartDate
) {
}
