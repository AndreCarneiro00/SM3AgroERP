package com.sm3Agro.SM3AgroERP.inventory.dto.product;

import com.sm3Agro.SM3AgroERP.inventory.enums.ProductType;

import java.time.LocalDate;

public record CreateProductRequest(
        String name,
        Long unitId,
        Long productFamilyId,
        ProductType productType,
        Boolean active,
        Boolean hasStock,
        LocalDate stockControlStartDate
) {

    public CreateProductRequest(
            String name,
            Long unitId,
            Long productFamilyId,
            ProductType productType,
            Boolean active
    ) {
        this(name, unitId, productFamilyId, productType, active, null, null);
    }
}
