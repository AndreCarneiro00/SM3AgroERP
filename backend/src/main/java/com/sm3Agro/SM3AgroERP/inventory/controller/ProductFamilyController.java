package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.sm3Agro.SM3AgroERP.inventory.dto.productFamily.CreateProductFamilyRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.productFamily.CreateProductFamilyResponse;
import com.sm3Agro.SM3AgroERP.inventory.dto.productFamily.FindAllProductFamilyResponse;
import com.sm3Agro.SM3AgroERP.inventory.dto.productFamily.UpdateProductFamilyRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.productFamily.UpdateProductFamilyResponse;
import com.sm3Agro.SM3AgroERP.inventory.entity.ProductFamily;
import com.sm3Agro.SM3AgroERP.inventory.service.ProductFamilyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/product-family")
public class ProductFamilyController {

    private final ProductFamilyService service;

    @GetMapping
    public List<FindAllProductFamilyResponse> findAllProductFamily() {
        List<ProductFamily> productFamilies = service.findAll();
        return productFamilies.stream()
                .map(productFamily -> new FindAllProductFamilyResponse(
                        productFamily.getId(),
                        productFamily.getName()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateProductFamilyResponse createProductFamily(@RequestBody CreateProductFamilyRequest request) {
        ProductFamily created = service.create(request);
        return new CreateProductFamilyResponse(
                created.getId(),
                created.getName()
        );
    }

    @PutMapping("/{id}")
    public UpdateProductFamilyResponse updateProductFamily(
            @PathVariable Long id,
            @RequestBody UpdateProductFamilyRequest request
    ) {
        ProductFamily updated = service.update(id, request);
        return new UpdateProductFamilyResponse(
                updated.getId(),
                updated.getName()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteProductFamily(@PathVariable Long id) {
        service.delete(id);
    }
}
