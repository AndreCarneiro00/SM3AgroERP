package com.sm3Agro.SM3AgroERP.inventory.movement.controller;

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
class InventoryMovementControllerIT extends AbstractInventoryIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnInventoryMovementsOrderedByMovementDateAndIdDescending() throws Exception {
        Product product = createProduct("Fertilizer");
        InventoryBatch batch = createBatch(
                product,
                "BATCH-1",
                LocalDate.of(2026, 6, 1),
                InventoryBatchStatus.ACTIVE,
                new BigDecimal("10.00")
        );
        InventoryMovement older = createMovement(
                batch,
                InventoryMovementType.PURCHASE_IN,
                LocalDate.of(2026, 6, 1),
                new BigDecimal("5.00"),
                100L
        );
        InventoryMovement firstSameDate = createMovement(
                batch,
                InventoryMovementType.SALE_OUT,
                LocalDate.of(2026, 6, 10),
                new BigDecimal("2.00"),
                101L
        );
        InventoryMovement secondSameDate = createMovement(
                batch,
                InventoryMovementType.ADJUSTMENT_OUT,
                LocalDate.of(2026, 6, 10),
                new BigDecimal("1.00"),
                null
        );

        mockMvc.perform(get("/inventory-movements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].id").value(secondSameDate.getId()))
                .andExpect(jsonPath("$[0].batchId").value(batch.getId()))
                .andExpect(jsonPath("$[0].movementType").value("ADJUSTMENT_OUT"))
                .andExpect(jsonPath("$[0].quantity").value(1.00))
                .andExpect(jsonPath("$[0].unitCost").value(5.25))
                .andExpect(jsonPath("$[0].movementDate").value("2026-06-10"))
                .andExpect(jsonPath("$[0].financialTransactionItemId").doesNotExist())
                .andExpect(jsonPath("$[1].id").value(firstSameDate.getId()))
                .andExpect(jsonPath("$[1].financialTransactionItemId").value(101L))
                .andExpect(jsonPath("$[2].id").value(older.getId()));
    }
}
