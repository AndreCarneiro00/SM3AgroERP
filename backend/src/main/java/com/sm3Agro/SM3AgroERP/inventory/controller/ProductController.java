package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.sm3Agro.SM3AgroERP.inventory.dto.product.CreateProductRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.product.CreateProductResponse;
import com.sm3Agro.SM3AgroERP.inventory.dto.product.FindAllProductResponse;
import com.sm3Agro.SM3AgroERP.inventory.dto.product.UpdateProductRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.product.UpdateProductResponse;
import com.sm3Agro.SM3AgroERP.inventory.entity.Product;
import com.sm3Agro.SM3AgroERP.inventory.service.ProductService;
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
@RequestMapping("/product")
public class ProductController {

    private final ProductService service;

    @GetMapping
    public List<FindAllProductResponse> findAllProduct() {
        List<Product> products = service.findAll();
        return products.stream()
                .map(this::toFindAllResponse)
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateProductResponse createProduct(@RequestBody CreateProductRequest request) {
        Product created = service.create(request);
        return toCreateResponse(created);
    }

    @PutMapping("/{id}")
    public UpdateProductResponse updateProduct(@PathVariable Long id, @RequestBody UpdateProductRequest request) {
        Product updated = service.update(id, request);
        return toUpdateResponse(updated);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        service.delete(id);
    }

    private FindAllProductResponse toFindAllResponse(Product product) {
        return new FindAllProductResponse(
                product.getId(),
                product.getName(),
                product.getUnit().getId(),
                product.getUnit().getName(),
                product.getProductFamily() != null ? product.getProductFamily().getId() : null,
                product.getProductFamily() != null ? product.getProductFamily().getName() : null,
                product.getProductType(),
                product.getActive()
        );
    }

    private CreateProductResponse toCreateResponse(Product product) {
        return new CreateProductResponse(
                product.getId(),
                product.getName(),
                product.getUnit().getId(),
                product.getUnit().getName(),
                product.getProductFamily() != null ? product.getProductFamily().getId() : null,
                product.getProductFamily() != null ? product.getProductFamily().getName() : null,
                product.getProductType(),
                product.getActive()
        );
    }

    private UpdateProductResponse toUpdateResponse(Product product) {
        return new UpdateProductResponse(
                product.getId(),
                product.getName(),
                product.getUnit().getId(),
                product.getUnit().getName(),
                product.getProductFamily() != null ? product.getProductFamily().getId() : null,
                product.getProductFamily() != null ? product.getProductFamily().getName() : null,
                product.getProductType(),
                product.getActive()
        );
    }
}
