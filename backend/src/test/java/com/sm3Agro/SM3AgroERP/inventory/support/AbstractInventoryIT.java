package com.sm3Agro.SM3AgroERP.inventory.support;

import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionAttachmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentAllocationRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionItemRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionRepository;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.entity.InventoryAdjustment;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.enums.InventoryAdjustmentType;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.repository.InventoryAdjustmentRepository;
import com.sm3Agro.SM3AgroERP.inventory.batch.entity.InventoryBatch;
import com.sm3Agro.SM3AgroERP.inventory.batch.enums.InventoryBatchStatus;
import com.sm3Agro.SM3AgroERP.inventory.batch.repository.InventoryBatchRepository;
import com.sm3Agro.SM3AgroERP.inventory.movement.entity.InventoryMovement;
import com.sm3Agro.SM3AgroERP.inventory.movement.enums.InventoryMovementType;
import com.sm3Agro.SM3AgroERP.inventory.movement.repository.InventoryMovementRepository;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.entity.AdjustmentRootCause;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.repository.AdjustmentRootCauseRepository;
import com.sm3Agro.SM3AgroERP.masterData.baseUnit.entity.BaseUnit;
import com.sm3Agro.SM3AgroERP.masterData.baseUnit.repository.BaseUnitRepository;
import com.sm3Agro.SM3AgroERP.masterData.field.entity.Field;
import com.sm3Agro.SM3AgroERP.masterData.field.repository.FieldRepository;
import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
import com.sm3Agro.SM3AgroERP.masterData.product.enums.ProductType;
import com.sm3Agro.SM3AgroERP.masterData.product.repository.ProductRepository;
import com.sm3Agro.SM3AgroERP.masterData.productFamily.entity.ProductFamily;
import com.sm3Agro.SM3AgroERP.masterData.productFamily.repository.ProductFamilyRepository;
import com.sm3Agro.SM3AgroERP.masterData.unitOfMeasure.entity.UnitOfMeasure;
import com.sm3Agro.SM3AgroERP.masterData.unitOfMeasure.repository.UnitOfMeasureRepository;
import com.sm3Agro.SM3AgroERP.production.cut.repository.CutRepository;
import com.sm3Agro.SM3AgroERP.production.productionBatch.repository.ProductionBatchRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;

public abstract class AbstractInventoryIT {

    @Autowired
    protected InventoryAdjustmentRepository inventoryAdjustmentRepository;
    @Autowired
    protected InventoryMovementRepository inventoryMovementRepository;
    @Autowired
    protected InventoryBatchRepository inventoryBatchRepository;
    @Autowired
    protected AdjustmentRootCauseRepository adjustmentRootCauseRepository;
    @Autowired
    protected ProductRepository productRepository;
    @Autowired
    protected ProductFamilyRepository productFamilyRepository;
    @Autowired
    protected UnitOfMeasureRepository unitOfMeasureRepository;
    @Autowired
    protected BaseUnitRepository baseUnitRepository;
    @Autowired
    protected FieldRepository fieldRepository;
    @Autowired
    protected CutRepository cutRepository;
    @Autowired
    protected ProductionBatchRepository productionBatchRepository;
    @Autowired
    protected FinancialTransactionFulfillmentAllocationRepository financialTransactionFulfillmentAllocationRepository;
    @Autowired
    protected FinancialTransactionFulfillmentRepository financialTransactionFulfillmentRepository;
    @Autowired
    protected FinancialTransactionAttachmentRepository financialTransactionAttachmentRepository;
    @Autowired
    protected FinancialTransactionItemRepository financialTransactionItemRepository;
    @Autowired
    protected FinancialTransactionRepository financialTransactionRepository;

    @BeforeEach
    @AfterEach
    void cleanupInventoryData() {
        financialTransactionFulfillmentAllocationRepository.deleteAll();
        financialTransactionFulfillmentRepository.deleteAll();
        financialTransactionAttachmentRepository.deleteAll();
        financialTransactionItemRepository.deleteAll();
        financialTransactionRepository.deleteAll();
        productionBatchRepository.deleteAll();
        inventoryAdjustmentRepository.deleteAll();
        inventoryMovementRepository.deleteAll();
        inventoryBatchRepository.deleteAll();
        cutRepository.deleteAll();
        productRepository.deleteAll();
        productFamilyRepository.deleteAll();
        unitOfMeasureRepository.deleteAll();
        baseUnitRepository.deleteAll();
        fieldRepository.deleteAll();
        adjustmentRootCauseRepository.deleteAll();
    }

    protected Field createField(String name) {
        return fieldRepository.save(Field.builder()
                .name(name)
                .areaHectares(new BigDecimal("12.50"))
                .build());
    }

    protected ProductFamily createProductFamily(String name) {
        return productFamilyRepository.save(ProductFamily.builder()
                .name(name)
                .build());
    }

    protected Product createProduct(String name) {
        return createProduct(name, null, ProductType.CONSUMABLE, true, LocalDate.of(2026, 6, 1));
    }

    protected Product createProduct(
            String name,
            ProductFamily productFamily,
            ProductType productType,
            Boolean hasStock,
            LocalDate stockControlStartDate
    ) {
        BaseUnit baseUnit = baseUnitRepository.save(BaseUnit.builder()
                .name(name + " base unit")
                .build());
        UnitOfMeasure unit = unitOfMeasureRepository.save(UnitOfMeasure.builder()
                .name(name + " unit")
                .baseUnit(baseUnit)
                .conversionFactor(BigDecimal.ONE)
                .build());

        return productRepository.save(Product.builder()
                .name(name)
                .unit(unit)
                .productFamily(productFamily)
                .productType(productType)
                .active(true)
                .hasStock(hasStock)
                .stockControlStartDate(stockControlStartDate)
                .build());
    }

    protected InventoryBatch createBatch(
            Product product,
            String code,
            LocalDate batchDate,
            InventoryBatchStatus status,
            BigDecimal quantity
    ) {
        return inventoryBatchRepository.save(InventoryBatch.builder()
                .product(product)
                .code(code)
                .batchDate(batchDate)
                .status(status)
                .unitCost(new BigDecimal("5.25"))
                .quantity(quantity)
                .build());
    }

    protected InventoryMovement createMovement(
            InventoryBatch batch,
            InventoryMovementType movementType,
            LocalDate movementDate,
            BigDecimal quantity,
            Long financialTransactionItemId
    ) {
        return inventoryMovementRepository.save(InventoryMovement.builder()
                .batch(batch)
                .movementType(movementType)
                .quantity(quantity)
                .unitCost(batch.getUnitCost())
                .movementDate(movementDate)
                .financialTransactionItemId(financialTransactionItemId)
                .build());
    }

    protected InventoryAdjustment createAdjustment(
            InventoryMovement movement,
            InventoryAdjustmentType type,
            String rootCauseName,
            String observation
    ) {
        AdjustmentRootCause rootCause = adjustmentRootCauseRepository.save(AdjustmentRootCause.builder()
                .name(rootCauseName)
                .build());

        return inventoryAdjustmentRepository.save(InventoryAdjustment.builder()
                .type(type)
                .rootCause(rootCause)
                .observation(observation)
                .inventoryMovement(movement)
                .build());
    }
}
