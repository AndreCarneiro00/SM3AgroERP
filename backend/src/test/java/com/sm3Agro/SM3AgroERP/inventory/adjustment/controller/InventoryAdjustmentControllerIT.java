package com.sm3Agro.SM3AgroERP.inventory.adjustment.controller;

import com.sm3Agro.SM3AgroERP.inventory.adjustment.entity.InventoryAdjustment;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.enums.InventoryAdjustmentType;
import com.sm3Agro.SM3AgroERP.inventory.batch.entity.InventoryBatch;
import com.sm3Agro.SM3AgroERP.inventory.batch.enums.InventoryBatchStatus;
import com.sm3Agro.SM3AgroERP.inventory.movement.entity.InventoryMovement;
import com.sm3Agro.SM3AgroERP.inventory.movement.enums.InventoryMovementType;
import com.sm3Agro.SM3AgroERP.inventory.support.AbstractInventoryIT;
import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
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
class InventoryAdjustmentControllerIT extends AbstractInventoryIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnInventoryAdjustmentsOrderedByIdDescending() throws Exception {
        Product product = createProduct("Fertilizer");
        InventoryBatch batch = createBatch(
                product,
                "BATCH-1",
                LocalDate.of(2026, 6, 1),
                InventoryBatchStatus.ACTIVE,
                new BigDecimal("10.00")
        );
        InventoryMovement firstMovement = createMovement(
                batch,
                InventoryMovementType.ADJUSTMENT_IN,
                LocalDate.of(2026, 6, 10),
                new BigDecimal("2.00"),
                null
        );
        InventoryMovement secondMovement = createMovement(
                batch,
                InventoryMovementType.ADJUSTMENT_OUT,
                LocalDate.of(2026, 6, 11),
                new BigDecimal("1.00"),
                null
        );
        InventoryAdjustment firstAdjustment = createAdjustment(
                firstMovement,
                InventoryAdjustmentType.POSITIVE,
                "Count correction",
                "positive correction"
        );
        InventoryAdjustment secondAdjustment = createAdjustment(
                secondMovement,
                InventoryAdjustmentType.NEGATIVE,
                "Damage",
                "negative correction"
        );

        mockMvc.perform(get("/inventory-adjustments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(secondAdjustment.getId()))
                .andExpect(jsonPath("$[0].type").value("NEGATIVE"))
                .andExpect(jsonPath("$[0].rootCauseId").value(secondAdjustment.getRootCause().getId()))
                .andExpect(jsonPath("$[0].observation").value("negative correction"))
                .andExpect(jsonPath("$[0].inventoryMovementId").value(secondMovement.getId()))
                .andExpect(jsonPath("$[1].id").value(firstAdjustment.getId()))
                .andExpect(jsonPath("$[1].type").value("POSITIVE"));
    }
}
