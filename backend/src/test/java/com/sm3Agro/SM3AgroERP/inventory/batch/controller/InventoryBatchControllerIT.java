package com.sm3Agro.SM3AgroERP.inventory.batch.controller;

import com.sm3Agro.SM3AgroERP.inventory.batch.entity.InventoryBatch;
import com.sm3Agro.SM3AgroERP.inventory.batch.enums.InventoryBatchStatus;
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
class InventoryBatchControllerIT extends AbstractInventoryIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnInventoryBatchesOrderedByBatchDateAndIdDescending() throws Exception {
        Product product = createProduct("Fertilizer");
        InventoryBatch older = createBatch(
                product,
                "OLD",
                LocalDate.of(2026, 6, 1),
                InventoryBatchStatus.ACTIVE,
                new BigDecimal("1.00")
        );
        InventoryBatch firstSameDate = createBatch(
                product,
                "SAME-1",
                LocalDate.of(2026, 6, 10),
                InventoryBatchStatus.ACTIVE,
                new BigDecimal("2.00")
        );
        InventoryBatch secondSameDate = createBatch(
                product,
                "SAME-2",
                LocalDate.of(2026, 6, 10),
                InventoryBatchStatus.SOLD,
                BigDecimal.ZERO
        );

        mockMvc.perform(get("/inventory-batches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].id").value(secondSameDate.getId()))
                .andExpect(jsonPath("$[0].productId").value(product.getId()))
                .andExpect(jsonPath("$[0].code").value("SAME-2"))
                .andExpect(jsonPath("$[0].batchDate").value("2026-06-10"))
                .andExpect(jsonPath("$[0].status").value("SOLD"))
                .andExpect(jsonPath("$[0].unitCost").value(5.25))
                .andExpect(jsonPath("$[0].quantity").value(0))
                .andExpect(jsonPath("$[1].id").value(firstSameDate.getId()))
                .andExpect(jsonPath("$[2].id").value(older.getId()));
    }
}
