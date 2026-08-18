package com.sm3Agro.SM3AgroERP.production.cut.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.entity.InventoryAdjustment;
import com.sm3Agro.SM3AgroERP.inventory.batch.entity.InventoryBatch;
import com.sm3Agro.SM3AgroERP.inventory.batch.enums.InventoryBatchStatus;
import com.sm3Agro.SM3AgroERP.inventory.movement.entity.InventoryMovement;
import com.sm3Agro.SM3AgroERP.inventory.movement.enums.InventoryMovementType;
import com.sm3Agro.SM3AgroERP.inventory.support.AbstractInventoryIT;
import com.sm3Agro.SM3AgroERP.masterData.field.entity.Field;
import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
import com.sm3Agro.SM3AgroERP.masterData.product.enums.ProductType;
import com.sm3Agro.SM3AgroERP.masterData.productFamily.entity.ProductFamily;
import com.sm3Agro.SM3AgroERP.production.cut.dto.LaunchCutRequest;
import com.sm3Agro.SM3AgroERP.production.cut.entity.Cut;
import com.sm3Agro.SM3AgroERP.production.cut.enums.CutStatus;
import com.sm3Agro.SM3AgroERP.production.productionBatch.entity.ProductionBatch;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.stream.Stream;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CutControllerIT extends AbstractInventoryIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void shouldLaunchCutAndCreateProductionInventory() throws Exception {
        Field field = createField("Piquete 1");
        ProductFamily family = createProductFamily("Feno");
        Product product = createProduct(
                "Feno Tifton",
                family,
                ProductType.FINISHED_GOOD,
                true,
                LocalDate.of(2026, 6, 1)
        );
        LaunchCutRequest request = new LaunchCutRequest(
                field.getId(),
                product.getId(),
                LocalDate.of(2026, 6, 20),
                new BigDecimal("80.00"),
                new BigDecimal("12.50"),
                "A",
                "primeiro corte"
        );

        mockMvc.perform(post("/cuts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.fieldId").value(field.getId()))
                .andExpect(jsonPath("$.productId").value(product.getId()))
                .andExpect(jsonPath("$.productFamilyId").value(family.getId()))
                .andExpect(jsonPath("$.inventoryBatchId").exists())
                .andExpect(jsonPath("$.inventoryMovementId").exists())
                .andExpect(jsonPath("$.productionBatchId").exists())
                .andExpect(jsonPath("$.batchCode").exists())
                .andExpect(jsonPath("$.cutDate").value("2026-06-20"))
                .andExpect(jsonPath("$.cutNumber").value(1))
                .andExpect(jsonPath("$.status").value("DONE"))
                .andExpect(jsonPath("$.quantity").value(80.00))
                .andExpect(jsonPath("$.unitCost").value(12.50))
                .andExpect(jsonPath("$.qualityGrade").value("A"))
                .andExpect(jsonPath("$.observation").value("primeiro corte"))
                .andExpect(jsonPath("$.daysSinceLastCut").doesNotExist());

        assertEquals(1, cutRepository.count());
        assertEquals(1, inventoryBatchRepository.count());
        assertEquals(1, inventoryMovementRepository.count());
        assertEquals(1, productionBatchRepository.count());
        Cut cut = cutRepository.findAll().getFirst();
        InventoryBatch batch = inventoryBatchRepository.findAll().getFirst();
        InventoryMovement movement = inventoryMovementRepository.findAll().getFirst();
        ProductionBatch productionBatch = productionBatchRepository.findAll().getFirst();
        assertEquals(product.getId(), batch.getProduct().getId());
        assertEquals(InventoryBatchStatus.ACTIVE, batch.getStatus());
        assertEquals(0, new BigDecimal("80.00").compareTo(batch.getQuantity()));
        assertEquals(InventoryMovementType.PRODUCTION_IN, movement.getMovementType());
        assertEquals(batch.getId(), movement.getBatch().getId());
        assertEquals(movement.getId(), productionBatch.getInventoryMovement().getId());
        assertEquals(batch.getId(), productionBatch.getInventoryBatch().getId());
        assertEquals("2026-06-20 00:00:00.000", loadTextColumn("cut", "cut_date", cut.getId()));
        assertEquals("2026-06-20 00:00:00.000", loadTextColumn("inventory_batch", "batch_date", batch.getId()));
        assertEquals("2026-06-20 00:00:00.000", loadTextColumn("inventory_movement", "movement_date", movement.getId()));
    }

    @Test
    void shouldCalculateDaysSinceLastCutAndListCutsOrderedByDateAndIdDescending() throws Exception {
        Field field = createField("Piquete 1");
        ProductFamily family = createProductFamily("Feno");
        Product product = createProduct(
                "Feno Tifton",
                family,
                ProductType.FINISHED_GOOD,
                true,
                LocalDate.of(2026, 6, 1)
        );
        Long firstCutId = launchCut(field, product, LocalDate.of(2026, 6, 1), "first");
        Long secondCutId = launchCut(field, product, LocalDate.of(2026, 6, 20), "second");
        Long thirdCutId = launchCut(field, product, LocalDate.of(2026, 6, 20), "third");

        mockMvc.perform(get("/cuts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].id").value(thirdCutId))
                .andExpect(jsonPath("$[0].cutDate").value("2026-06-20"))
                .andExpect(jsonPath("$[0].daysSinceLastCut").value(19))
                .andExpect(jsonPath("$[1].id").value(secondCutId))
                .andExpect(jsonPath("$[1].daysSinceLastCut").value(19))
                .andExpect(jsonPath("$[2].id").value(firstCutId));
    }

    @Test
    void shouldCalculateCutFieldsFromSeededDatabaseRowsWhenLaunchingCut() throws Exception {
        Field field = createField("Piquete 1");
        ProductFamily family = createProductFamily("Feno");
        Product product = createProduct(
                "Feno Tifton",
                family,
                ProductType.FINISHED_GOOD,
                true,
                LocalDate.of(2026, 6, 1)
        );
        jdbcTemplate.update("""
                INSERT INTO cut (
                    field_id,
                    product_family_id,
                    cut_date,
                    cut_number,
                    status,
                    observation,
                    days_since_last_cut
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                field.getId(),
                family.getId(),
                "2026-06-01 00:00:00.000",
                1,
                "DONE",
                "seeded previous cut",
                null
        );

        LaunchCutRequest request = new LaunchCutRequest(
                field.getId(),
                product.getId(),
                LocalDate.of(2026, 6, 20),
                new BigDecimal("80.00"),
                new BigDecimal("12.50"),
                "A",
                "novo corte"
        );

        MvcResult result = mockMvc.perform(post("/cuts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cutDate").value("2026-06-20"))
                .andExpect(jsonPath("$.cutNumber").value(2))
                .andExpect(jsonPath("$.status").value("DONE"))
                .andExpect(jsonPath("$.daysSinceLastCut").value(19))
                .andExpect(jsonPath("$.batchCode").exists())
                .andReturn();

        Long cutId = objectMapper.readTree(result.getResponse().getContentAsString()).path("id").asLong();
        assertEquals(2, cutRepository.count());
        assertEquals("2026-06-20 00:00:00.000", loadTextColumn("cut", "cut_date", cutId));
        assertEquals(19, cutRepository.findById(cutId).orElseThrow().getDaysSinceLastCut());
    }

    @Test
    void shouldCancelCutAndCreateNegativeInventoryAdjustment() throws Exception {
        Field field = createField("Piquete 1");
        ProductFamily family = createProductFamily("Feno");
        Product product = createProduct(
                "Feno Tifton",
                family,
                ProductType.FINISHED_GOOD,
                true,
                LocalDate.of(2026, 6, 1)
        );
        Long cutId = launchCut(field, product, LocalDate.of(2026, 6, 20), "first");

        mockMvc.perform(post("/cuts/{id}/cancel", cutId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(cutId))
                .andExpect(jsonPath("$.status").value("CANCELED"));

        Cut cut = cutRepository.findById(cutId).orElseThrow();
        InventoryBatch batch = inventoryBatchRepository.findAll().getFirst();
        InventoryMovement adjustmentMovement = inventoryMovementRepository.findAllByOrderByMovementDateDescIdDesc().getFirst();
        InventoryAdjustment adjustment = inventoryAdjustmentRepository.findAll().getFirst();
        assertEquals(CutStatus.CANCELED, cut.getStatus());
        assertEquals(InventoryBatchStatus.CANCELED, batch.getStatus());
        assertEquals(0, BigDecimal.ZERO.compareTo(batch.getQuantity()));
        assertEquals(2, inventoryMovementRepository.count());
        assertEquals(InventoryMovementType.ADJUSTMENT_OUT, adjustmentMovement.getMovementType());
        assertEquals("Cancelamento de Corte", adjustment.getRootCause().getName());
        assertEquals("Cancelamento do corte #" + cutId, adjustment.getObservation());
        assertEquals(adjustmentMovement.getId(), adjustment.getInventoryMovement().getId());
    }

    @Test
    void shouldRejectCancelWhenGeneratedBatchHasLaterMovements() throws Exception {
        Field field = createField("Piquete 1");
        ProductFamily family = createProductFamily("Feno");
        Product product = createProduct(
                "Feno Tifton",
                family,
                ProductType.FINISHED_GOOD,
                true,
                LocalDate.of(2026, 6, 1)
        );
        Long cutId = launchCut(field, product, LocalDate.of(2026, 6, 20), "first");
        ProductionBatch productionBatch = productionBatchRepository.findByCutId(cutId).orElseThrow();
        createMovement(
                productionBatch.getInventoryBatch(),
                InventoryMovementType.SALE_OUT,
                LocalDate.of(2026, 6, 21),
                new BigDecimal("10.00"),
                null
        );

        mockMvc.perform(post("/cuts/{id}/cancel", cutId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Cut cannot be canceled because the generated batch has later movements"
                ));

        assertEquals(CutStatus.DONE, cutRepository.findById(cutId).orElseThrow().getStatus());
        assertEquals(0, inventoryAdjustmentRepository.count());
        assertEquals(2, inventoryMovementRepository.count());
    }

    @Test
    void shouldRejectLaunchCutWhenProductHasNoFamily() throws Exception {
        Field field = createField("Piquete 1");
        Product product = createProduct(
                "Feno sem familia",
                null,
                ProductType.FINISHED_GOOD,
                true,
                LocalDate.of(2026, 6, 1)
        );
        LaunchCutRequest request = new LaunchCutRequest(
                field.getId(),
                product.getId(),
                LocalDate.of(2026, 6, 20),
                new BigDecimal("80.00"),
                new BigDecimal("12.50"),
                "A",
                "sem familia"
        );

        mockMvc.perform(post("/cuts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Product must have a product family to launch a cut"));

        assertEquals(0, cutRepository.count());
        assertEquals(0, inventoryBatchRepository.count());
        assertEquals(0, inventoryMovementRepository.count());
        assertEquals(0, productionBatchRepository.count());
    }

    @ParameterizedTest
    @MethodSource("invalidLaunchRequests")
    void shouldRejectInvalidLaunchRequest(LaunchCutRequest request, String message) throws Exception {
        mockMvc.perform(post("/cuts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(message));

        assertEquals(0, cutRepository.count());
        assertEquals(0, inventoryBatchRepository.count());
        assertEquals(0, inventoryMovementRepository.count());
        assertEquals(0, productionBatchRepository.count());
    }

    @Test
    void shouldRejectLaunchCutWhenProductDoesNotControlStock() throws Exception {
        Field field = createField("Piquete 1");
        ProductFamily family = createProductFamily("Feno");
        Product product = createProduct(
                "Feno sem estoque",
                family,
                ProductType.FINISHED_GOOD,
                false,
                null
        );
        LaunchCutRequest request = new LaunchCutRequest(
                field.getId(),
                product.getId(),
                LocalDate.of(2026, 6, 20),
                new BigDecimal("80.00"),
                new BigDecimal("12.50"),
                "A",
                "sem estoque"
        );

        mockMvc.perform(post("/cuts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Product must control stock to launch a cut."));

        assertEquals(0, cutRepository.count());
        assertEquals(0, inventoryBatchRepository.count());
        assertEquals(0, inventoryMovementRepository.count());
        assertEquals(0, productionBatchRepository.count());
    }

    @Test
    void shouldRejectLaunchCutBeforeStockControlStartDate() throws Exception {
        Field field = createField("Piquete 1");
        ProductFamily family = createProductFamily("Feno");
        Product product = createProduct(
                "Feno Tifton",
                family,
                ProductType.FINISHED_GOOD,
                true,
                LocalDate.of(2026, 7, 1)
        );
        LaunchCutRequest request = new LaunchCutRequest(
                field.getId(),
                product.getId(),
                LocalDate.of(2026, 6, 20),
                new BigDecimal("80.00"),
                new BigDecimal("12.50"),
                "A",
                "antes do controle"
        );

        mockMvc.perform(post("/cuts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("cutDate cannot be before product stockControlStartDate."));

        assertEquals(0, cutRepository.count());
        assertEquals(0, inventoryBatchRepository.count());
        assertEquals(0, inventoryMovementRepository.count());
        assertEquals(0, productionBatchRepository.count());
    }

    @Test
    void shouldRejectCancelingAlreadyCanceledCut() throws Exception {
        Field field = createField("Piquete 1");
        ProductFamily family = createProductFamily("Feno");
        Product product = createProduct(
                "Feno Tifton",
                family,
                ProductType.FINISHED_GOOD,
                true,
                LocalDate.of(2026, 6, 1)
        );
        Long cutId = launchCut(field, product, LocalDate.of(2026, 6, 20), "first");

        mockMvc.perform(post("/cuts/{id}/cancel", cutId))
                .andExpect(status().isOk());

        mockMvc.perform(post("/cuts/{id}/cancel", cutId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cut is already canceled"));

        assertEquals(CutStatus.CANCELED, cutRepository.findById(cutId).orElseThrow().getStatus());
        assertEquals(2, inventoryMovementRepository.count());
        assertEquals(1, inventoryAdjustmentRepository.count());
    }

    private Long launchCut(
            Field field,
            Product product,
            LocalDate cutDate,
            String observation
    ) throws Exception {
        LaunchCutRequest request = new LaunchCutRequest(
                field.getId(),
                product.getId(),
                cutDate,
                new BigDecimal("80.00"),
                new BigDecimal("12.50"),
                "A",
                observation
        );

        MvcResult result = mockMvc.perform(post("/cuts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).path("id").asLong();
    }

    private String loadTextColumn(String tableName, String columnName, Long id) {
        return jdbcTemplate.queryForObject(
                "SELECT CAST(" + columnName + " AS TEXT) FROM " + tableName + " WHERE id = ?",
                String.class,
                id
        );
    }

    private static Stream<Arguments> invalidLaunchRequests() {
        return Stream.of(
                Arguments.of(new LaunchCutRequest(
                        null,
                        1L,
                        LocalDate.of(2026, 6, 20),
                        new BigDecimal("80.00"),
                        new BigDecimal("12.50"),
                        "A",
                        "sem campo"
                ), "fieldId is required"),
                Arguments.of(new LaunchCutRequest(
                        1L,
                        null,
                        LocalDate.of(2026, 6, 20),
                        new BigDecimal("80.00"),
                        new BigDecimal("12.50"),
                        "A",
                        "sem produto"
                ), "productId is required"),
                Arguments.of(new LaunchCutRequest(
                        1L,
                        1L,
                        null,
                        new BigDecimal("80.00"),
                        new BigDecimal("12.50"),
                        "A",
                        "sem data"
                ), "cutDate is required"),
                Arguments.of(new LaunchCutRequest(
                        1L,
                        1L,
                        LocalDate.of(2026, 6, 20),
                        BigDecimal.ZERO,
                        new BigDecimal("12.50"),
                        "A",
                        "quantidade zero"
                ), "quantity must be greater than zero"),
                Arguments.of(new LaunchCutRequest(
                        1L,
                        1L,
                        LocalDate.of(2026, 6, 20),
                        new BigDecimal("80.00"),
                        new BigDecimal("-0.01"),
                        "A",
                        "custo negativo"
                ), "unitCost must be greater than or equal to zero")
        );
    }
}
