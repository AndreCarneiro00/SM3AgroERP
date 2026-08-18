package com.sm3Agro.SM3AgroERP.production.productionBatch.controller;

import com.sm3Agro.SM3AgroERP.inventory.batch.entity.InventoryBatch;
import com.sm3Agro.SM3AgroERP.inventory.batch.enums.InventoryBatchStatus;
import com.sm3Agro.SM3AgroERP.inventory.movement.entity.InventoryMovement;
import com.sm3Agro.SM3AgroERP.inventory.movement.enums.InventoryMovementType;
import com.sm3Agro.SM3AgroERP.inventory.support.AbstractInventoryIT;
import com.sm3Agro.SM3AgroERP.masterData.field.entity.Field;
import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
import com.sm3Agro.SM3AgroERP.masterData.product.enums.ProductType;
import com.sm3Agro.SM3AgroERP.masterData.productFamily.entity.ProductFamily;
import com.sm3Agro.SM3AgroERP.production.cut.entity.Cut;
import com.sm3Agro.SM3AgroERP.production.cut.enums.CutStatus;
import com.sm3Agro.SM3AgroERP.production.productionBatch.entity.ProductionBatch;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductionBatchControllerIT extends AbstractInventoryIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnProductionBatchesOrderedByIdDescending() throws Exception {
        ProductFamily family = createProductFamily("Feno");
        Field field = createField("Piquete 1");
        Product product = createProduct(
                "Feno Tifton",
                family,
                ProductType.FINISHED_GOOD,
                true,
                LocalDate.of(2026, 6, 1)
        );
        ProductionBatch first = createProductionBatch(
                field,
                product,
                "PRD-001",
                LocalDate.of(2026, 6, 1),
                "B",
                "first"
        );
        ProductionBatch second = createProductionBatch(
                field,
                product,
                "PRD-002",
                LocalDate.of(2026, 6, 10),
                "A",
                "second"
        );

        mockMvc.perform(get("/production-batches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(second.getId()))
                .andExpect(jsonPath("$[0].inventoryBatchId").value(second.getInventoryBatch().getId()))
                .andExpect(jsonPath("$[0].inventoryMovementId").value(second.getInventoryMovement().getId()))
                .andExpect(jsonPath("$[0].quantity").value(80.00))
                .andExpect(jsonPath("$[0].qualityGrade").value("A"))
                .andExpect(jsonPath("$[0].cutId").value(second.getCut().getId()))
                .andExpect(jsonPath("$[0].observation").value("second"))
                .andExpect(jsonPath("$[1].id").value(first.getId()));
    }

    private ProductionBatch createProductionBatch(
            Field field,
            Product product,
            String batchCode,
            LocalDate cutDate,
            String qualityGrade,
            String observation
    ) {
        Cut cut = cutRepository.save(Cut.builder()
                .field(field)
                .product(product)
                .cutDate(cutDate)
                .cutNumber(1)
                .status(CutStatus.DONE)
                .observation(observation)
                .build());
        InventoryBatch batch = createBatch(
                product,
                batchCode,
                cutDate,
                InventoryBatchStatus.ACTIVE,
                new BigDecimal("80.00")
        );
        InventoryMovement movement = createMovement(
                batch,
                InventoryMovementType.PRODUCTION_IN,
                cutDate,
                new BigDecimal("80.00"),
                null
        );

        return productionBatchRepository.save(ProductionBatch.builder()
                .inventoryBatch(batch)
                .inventoryMovement(movement)
                .quantity(new BigDecimal("80.00"))
                .qualityGrade(qualityGrade)
                .cut(cut)
                .observation(observation)
                .build());
    }
}
