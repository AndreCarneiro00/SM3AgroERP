package com.sm3Agro.SM3AgroERP.inventory.dto.product;

import com.sm3Agro.SM3AgroERP.inventory.enums.ProductType;

import java.time.LocalDate;

public record UpdateProductResponse(
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

    public UpdateProductResponse(
            Long id,
            String name,
            Long unitId,
            String unitName,
            Long productFamilyId,
            String productFamilyName,
            ProductType productType,
            Boolean active
    ) {
        this(id, name, unitId, unitName, productFamilyId, productFamilyName, productType, active, null, null);
    }
}
