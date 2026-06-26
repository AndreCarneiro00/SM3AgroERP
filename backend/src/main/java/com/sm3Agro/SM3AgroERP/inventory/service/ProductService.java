package com.sm3Agro.SM3AgroERP.inventory.service;

import com.sm3Agro.SM3AgroERP.inventory.dto.product.CreateProductRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.product.UpdateProductRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.Product;
import com.sm3Agro.SM3AgroERP.inventory.entity.ProductFamily;
import com.sm3Agro.SM3AgroERP.inventory.entity.UnitOfMeasure;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductFamilyRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.UnitOfMeasureRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final ProductFamilyRepository productFamilyRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    @Transactional
    public Product create(CreateProductRequest request) {
        UnitOfMeasure unit = unitOfMeasureRepository.findById(request.unitId())
                .orElseThrow(() -> new EntityNotFoundException("UnitOfMeasure not found: " + request.unitId()));

        Product.ProductBuilder builder = Product.builder()
                .name(request.name())
                .unit(unit)
                .productType(request.productType())
                .active(request.active());

        if (request.productFamilyId() != null) {
            ProductFamily productFamily = productFamilyRepository.findById(request.productFamilyId())
                    .orElseThrow(() -> new EntityNotFoundException("ProductFamily not found: " + request.productFamilyId()));
            builder.productFamily(productFamily);
        }

        return productRepository.save(builder.build());
    }

    @Transactional
    public Product update(Long id, UpdateProductRequest request) {
        Product entity = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));

        UnitOfMeasure unit = unitOfMeasureRepository.findById(request.unitId())
                .orElseThrow(() -> new EntityNotFoundException("UnitOfMeasure not found: " + request.unitId()));

        entity.setName(request.name());
        entity.setUnit(unit);
        entity.setProductType(request.productType());
        entity.setActive(request.active());

        if (request.productFamilyId() != null) {
            ProductFamily productFamily = productFamilyRepository.findById(request.productFamilyId())
                    .orElseThrow(() -> new EntityNotFoundException("ProductFamily not found: " + request.productFamilyId()));
            entity.setProductFamily(productFamily);
        } else {
            entity.setProductFamily(null);
        }

        return productRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}
