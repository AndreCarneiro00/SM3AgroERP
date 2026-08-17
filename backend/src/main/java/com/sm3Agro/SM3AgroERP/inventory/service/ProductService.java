package com.sm3Agro.SM3AgroERP.inventory.service;

import com.sm3Agro.SM3AgroERP.inventory.dto.product.CreateProductRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.product.UpdateProductRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.Product;
import com.sm3Agro.SM3AgroERP.inventory.entity.ProductFamily;
import com.sm3Agro.SM3AgroERP.inventory.entity.UnitOfMeasure;
import com.sm3Agro.SM3AgroERP.inventory.repository.InventoryBatchRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.InventoryMovementRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductFamilyRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.UnitOfMeasureRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@RequiredArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final ProductFamilyRepository productFamilyRepository;
    private final InventoryBatchRepository inventoryBatchRepository;
    private final InventoryMovementRepository inventoryMovementRepository;

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
                .active(request.active())
                .hasStock(resolveCreateHasStock(request.hasStock()))
                .stockControlStartDate(resolveStockControlStartDate(
                        request.hasStock(),
                        request.stockControlStartDate()
                ));

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
        entity.setProductType(request.productType());
        entity.setActive(request.active());

        Boolean hasStock = resolveUpdateHasStock(entity, request.hasStock());
        LocalDate stockControlStartDate = resolveStockControlStartDate(hasStock, request.stockControlStartDate());
        validateStockControlChange(entity, unit, hasStock, stockControlStartDate);

        entity.setUnit(unit);
        entity.setHasStock(hasStock);
        entity.setStockControlStartDate(stockControlStartDate);

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
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }

    private Boolean resolveCreateHasStock(Boolean hasStock) {
        if (hasStock == null) {
            throw new IllegalArgumentException("hasStock is required.");
        }
        return hasStock;
    }

    private Boolean resolveUpdateHasStock(Product entity, Boolean requestedHasStock) {
        if (entity.getHasStock() == null && requestedHasStock == null) {
            throw new IllegalArgumentException("Product stock classification is required.");
        }
        return requestedHasStock != null ? requestedHasStock : entity.getHasStock();
    }

    private LocalDate resolveStockControlStartDate(Boolean hasStock, LocalDate stockControlStartDate) {
        if (Boolean.TRUE.equals(hasStock)) {
            if (stockControlStartDate == null) {
                throw new IllegalArgumentException("stockControlStartDate is required when hasStock is true.");
            }
            return stockControlStartDate;
        }

        return null;
    }

    private void validateStockControlChange(
            Product entity,
            UnitOfMeasure nextUnit,
            Boolean nextHasStock,
            LocalDate nextStockControlStartDate
    ) {
        boolean hasBatches = inventoryBatchRepository.existsByProductId(entity.getId());
        boolean hasMovements = inventoryMovementRepository.existsByBatchProductId(entity.getId());
        boolean hasStockHistory = hasBatches || hasMovements;

        if (hasStockHistory && !Objects.equals(entity.getUnit().getId(), nextUnit.getId())) {
            throw new IllegalArgumentException("Cannot change unit of a product with inventory history.");
        }

        if (hasMovements && !Objects.equals(entity.getStockControlStartDate(), nextStockControlStartDate)) {
            throw new IllegalArgumentException("Cannot change stockControlStartDate of a product with inventory movements.");
        }

        if (Boolean.TRUE.equals(entity.getHasStock())
                && Boolean.FALSE.equals(nextHasStock)
                && hasStockHistory) {
            throw new IllegalArgumentException("Cannot disable stock control for a product with inventory history.");
        }
    }
}
