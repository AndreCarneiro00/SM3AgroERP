package com.sm3Agro.SM3AgroERP.financial.transaction.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.entity.ChartOfAccount;
import com.sm3Agro.SM3AgroERP.masterData.costCenter.entity.CostCenter;
import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionAttachmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentAllocationRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionAttachmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import com.sm3Agro.SM3AgroERP.financial.transaction.support.AbstractFinancialTransactionIT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FinancialTransactionControllerIT extends AbstractFinancialTransactionIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateFinancialTransaction() throws Exception {
        CreateFinancialTransactionRequest valid = createValidRequest();
        CreateFinancialTransactionRequest request = new CreateFinancialTransactionRequest(
                valid.description(),
                valid.counterpartyId(),
                valid.issueDate(),
                valid.dueDate(),
                valid.documentNumber(),
                valid.type(),
                valid.observation(),
                valid.hasNf(),
                List.of(new FinancialTransactionItemRequest(
                        valid.items().getFirst().chartOfAccountId(),
                        valid.items().getFirst().costCenterId(),
                        valid.items().getFirst().quantity(),
                        valid.items().getFirst().unitPrice(),
                        new BigDecimal("999.99"),
                        valid.items().getFirst().productId()
                )),
                valid.attachments(),
                valid.fulfillments()
        );

        mockMvc.perform(multipart("/financial-transactions")
                        .file(payloadPart(request))
                        .file(createAttachmentFile()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.description").value("Purchase fertilizer"))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.totalAmount").value(100.00))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].amount").value(100.00))
                .andExpect(jsonPath("$.attachments", hasSize(1)))
                .andExpect(jsonPath("$.attachments[0].storageProvider").value("LOCAL"))
                .andExpect(jsonPath("$.fulfillments", hasSize(1)))
                .andExpect(jsonPath("$.fulfillments[0].allocations", hasSize(1)));
    }

    @Test
    void shouldReturnBadRequestWhenItemsAreMissing() throws Exception {
        CreateFinancialTransactionRequest valid = createValidRequest();
        CreateFinancialTransactionRequest invalid = new CreateFinancialTransactionRequest(
                valid.description(),
                valid.counterpartyId(),
                valid.issueDate(),
                valid.dueDate(),
                valid.documentNumber(),
                valid.type(),
                valid.observation(),
                valid.hasNf(),
                List.of(),
                valid.attachments(),
                valid.fulfillments()
        );

        mockMvc.perform(multipart("/financial-transactions")
                        .file(payloadPart(invalid))
                        .file(createAttachmentFile()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation error"))
                .andExpect(jsonPath("$.details", hasSize(1)))
                .andExpect(jsonPath("$.details[0].field").value("items"));
    }

    @Test
    void shouldListAndFindTransactionDetails() throws Exception {
        Long transactionId = createTransaction(createValidRequest(), createAttachmentFile());

        mockMvc.perform(get("/financial-transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(transactionId))
                .andExpect(jsonPath("$[0].paidAmount").value(100.00))
                .andExpect(jsonPath("$[0].remainingAmount").value(0))
                .andExpect(jsonPath("$[0].itemCount").value(1))
                .andExpect(jsonPath("$[0].attachmentCount").value(1))
                .andExpect(jsonPath("$[0].fulfillmentCount").value(1));

        mockMvc.perform(get("/financial-transactions/{id}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(transactionId))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.attachments", hasSize(1)))
                .andExpect(jsonPath("$.fulfillments", hasSize(1)));
    }

    @Test
    void shouldFilterTransactionsByIssueDatePeriod() throws Exception {
        createTransaction(createUnpaidRequest("Fora antes", LocalDate.of(2025, 12, 31)));
        createTransaction(createUnpaidRequest("Inicio periodo", LocalDate.of(2026, 1, 1)));
        createTransaction(createUnpaidRequest("Fim periodo", LocalDate.of(2026, 12, 31)));
        createTransaction(createUnpaidRequest("Fora depois", LocalDate.of(2027, 1, 1)));

        mockMvc.perform(get("/financial-transactions")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].issueDate").value("2026-12-31"))
                .andExpect(jsonPath("$[0].description").value("Fim periodo"))
                .andExpect(jsonPath("$[1].issueDate").value("2026-01-01"))
                .andExpect(jsonPath("$[1].description").value("Inicio periodo"));
    }

    @Test
    void shouldUpdateAndCancelTransactionHeader() throws Exception {
        CreateFinancialTransactionRequest request = createValidRequest();
        Long transactionId = createTransaction(request, createAttachmentFile());

        UpdateFinancialTransactionRequest updateRequest = new UpdateFinancialTransactionRequest(
                "Updated description",
                null,
                request.issueDate(),
                LocalDate.of(2026, 7, 31),
                "DOC-UPDATED",
                request.type(),
                "updated observation",
                false
        );

        mockMvc.perform(patch("/financial-transactions/{id}", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated description"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.totalAmount").value(100.00));

        mockMvc.perform(post("/financial-transactions/{id}/cancel", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELED"));

        mockMvc.perform(patch("/financial-transactions/{id}", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Canceled financial transactions cannot be changed."));
    }

    @Test
    void shouldRejectChangingTransactionTypeAfterCreation() throws Exception {
        CreateFinancialTransactionRequest request = createIncomeRequestWithFulfillment("50.00");
        Long transactionId = createTransaction(request);

        UpdateFinancialTransactionRequest updateRequest = new UpdateFinancialTransactionRequest(
                request.description(),
                request.counterpartyId(),
                request.issueDate(),
                request.dueDate(),
                request.documentNumber(),
                FinancialTransactionType.EXPENSE,
                request.observation(),
                request.hasNf()
        );

        mockMvc.perform(patch("/financial-transactions/{id}", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Financial transaction type cannot be changed after creation."
                ));
    }

    @Test
    void shouldRejectChangingIssueDateAfterCreation() throws Exception {
        CreateFinancialTransactionRequest request = createUnpaidRequest();
        Long transactionId = createTransaction(request);

        UpdateFinancialTransactionRequest updateRequest = new UpdateFinancialTransactionRequest(
                request.description(),
                request.counterpartyId(),
                LocalDate.of(2026, 7, 1),
                request.dueDate(),
                request.documentNumber(),
                request.type(),
                request.observation(),
                request.hasNf()
        );

        mockMvc.perform(patch("/financial-transactions/{id}", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Financial transaction issue date cannot be changed after creation."
                ));
    }

    @Test
    void shouldRejectChangingTypeAndCancelingTransactionWithInventoryMovement() throws Exception {
        CreateFinancialTransactionRequest request = createStockControlledPurchaseRequest();
        Long transactionId = createTransaction(request, createAttachmentFile());

        UpdateFinancialTransactionRequest updateRequest = new UpdateFinancialTransactionRequest(
                request.description(),
                request.counterpartyId(),
                request.issueDate(),
                request.dueDate(),
                request.documentNumber(),
                FinancialTransactionType.INCOME,
                request.observation(),
                request.hasNf()
        );

        mockMvc.perform(patch("/financial-transactions/{id}", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Financial transaction type cannot be changed after creation."
                ));

        mockMvc.perform(post("/financial-transactions/{id}/cancel", transactionId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Cannot cancel a financial transaction with inventory movements."
                ));
    }

    @Test
    void shouldRejectUpdatingAndDeletingItemAfterTransactionCreation() throws Exception {
        CreateFinancialTransactionRequest request = createStockControlledPurchaseRequest();
        Long transactionId = createTransaction(request, createAttachmentFile());
        Long itemId = financialTransactionItemRepository.findByFinancialTransactionId(transactionId)
                .getFirst()
                .getId();
        FinancialTransactionItemRequest item = request.items().getFirst();

        UpdateFinancialTransactionItemRequest updateItemRequest = new UpdateFinancialTransactionItemRequest(
                item.chartOfAccountId(),
                item.costCenterId(),
                new BigDecimal("3.00"),
                item.unitPrice(),
                new BigDecimal("150.00"),
                item.productId()
        );

        mockMvc.perform(patch("/financial-transactions/{id}/items/{itemId}", transactionId, itemId)
                        .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(updateItemRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Financial transaction items can only be defined during transaction creation."
                ));

        mockMvc.perform(delete("/financial-transactions/{id}/items/{itemId}", transactionId, itemId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Financial transaction items can only be defined during transaction creation."
                ));
    }

    @Test
    void shouldRejectAddingItemAfterTransactionCreation() throws Exception {
        Long transactionId = createTransaction(createUnpaidRequest());
        ChartOfAccount chartOfAccount = createChartOfAccount();
        CostCenter costCenter = createCostCenter();
        Product stockControlledProduct = createStockControlledProduct(LocalDate.of(2026, 6, 1));
        FinancialTransactionItemRequest createItemRequest = new FinancialTransactionItemRequest(
                chartOfAccount.getId(),
                costCenter.getId(),
                new BigDecimal("1.00"),
                new BigDecimal("50.00"),
                new BigDecimal("50.00"),
                stockControlledProduct.getId()
        );

        mockMvc.perform(post("/financial-transactions/{id}/items", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(createItemRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Financial transaction items can only be defined during transaction creation."
                ));
    }

    @Test
    void shouldRejectManagingItemsAfterTransactionCreation() throws Exception {
        Long transactionId = createTransaction(createValidRequest(), createAttachmentFile());
        ChartOfAccount chartOfAccount = createChartOfAccount();
        CostCenter costCenter = createCostCenter();
        Product product = createProduct();
        Long existingItemId = financialTransactionItemRepository
                .findByFinancialTransactionId(transactionId)
                .getFirst()
                .getId();

        FinancialTransactionItemRequest createItemRequest = new FinancialTransactionItemRequest(
                chartOfAccount.getId(),
                costCenter.getId(),
                new BigDecimal("1.00"),
                new BigDecimal("50.00"),
                new BigDecimal("999.99"),
                product.getId()
        );

        mockMvc.perform(post("/financial-transactions/{id}/items", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(createItemRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Financial transaction items can only be defined during transaction creation."
                ));

        UpdateFinancialTransactionItemRequest updateItemRequest = new UpdateFinancialTransactionItemRequest(
                chartOfAccount.getId(),
                costCenter.getId(),
                new BigDecimal("1.00"),
                new BigDecimal("80.00"),
                new BigDecimal("999.99"),
                product.getId()
        );

        mockMvc.perform(patch("/financial-transactions/{id}/items/{itemId}", transactionId, existingItemId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updateItemRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Financial transaction items can only be defined during transaction creation."
                ));

        mockMvc.perform(delete("/financial-transactions/{id}/items/{itemId}", transactionId, existingItemId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Financial transaction items can only be defined during transaction creation."
                ));

        mockMvc.perform(get("/financial-transactions/{id}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(100.00))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.items", hasSize(1)));
    }

    @Test
    void shouldManageFulfillmentsAndRecalculateStatus() throws Exception {
        Long transactionId = createTransaction(createUnpaidRequest());
        var bankAccount = createBankAccount();
        Long itemId = financialTransactionItemRepository
                .findByFinancialTransactionId(transactionId)
                .getFirst()
                .getId();

        FinancialTransactionFulfillmentRequest createFulfillmentRequest = new FinancialTransactionFulfillmentRequest(
                bankAccount.getId(),
                LocalDate.of(2026, 7, 2),
                new BigDecimal("40.00"),
                "partial payment",
                List.of(new FinancialTransactionFulfillmentAllocationRequest(
                        itemId,
                        null,
                        new BigDecimal("40.00")
                ))
        );

        MvcResult createFulfillmentResult = mockMvc.perform(post("/financial-transactions/{id}/fulfillments", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(createFulfillmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amountPaid").value(40.00))
                .andReturn();
        Long fulfillmentId = readId(createFulfillmentResult);

        mockMvc.perform(get("/financial-transactions/{id}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PARTIAL"))
                .andExpect(jsonPath("$.paidAmount").value(40.00))
                .andExpect(jsonPath("$.remainingAmount").value(60.00));

        UpdateFinancialTransactionFulfillmentRequest updateFulfillmentRequest =
                new UpdateFinancialTransactionFulfillmentRequest(
                        bankAccount.getId(),
                        LocalDate.of(2026, 7, 3),
                        new BigDecimal("100.00"),
                        "full payment",
                        List.of(new FinancialTransactionFulfillmentAllocationRequest(
                                itemId,
                                null,
                                new BigDecimal("100.00")
                        ))
                );

        mockMvc.perform(patch("/financial-transactions/{id}/fulfillments/{fulfillmentId}", transactionId, fulfillmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updateFulfillmentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountPaid").value(100.00));

        mockMvc.perform(get("/financial-transactions/{id}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.remainingAmount").value(0));

        mockMvc.perform(delete("/financial-transactions/{id}/fulfillments/{fulfillmentId}", transactionId, fulfillmentId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/financial-transactions/{id}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.paidAmount").value(0))
                .andExpect(jsonPath("$.remainingAmount").value(100.00));
    }

    @Test
    void shouldManageAttachmentsAndReplaceStoredFile() throws Exception {
        Long transactionId = createTransaction(createUnpaidRequest());
        var documentType = createDocumentType();
        CreateFinancialTransactionAttachmentRequest createAttachmentRequest =
                new CreateFinancialTransactionAttachmentRequest(documentType.getId(), "initial attachment");

        MvcResult createAttachmentResult = mockMvc.perform(multipart("/financial-transactions/{id}/attachments", transactionId)
                        .file(payloadPart(createAttachmentRequest))
                        .file(new MockMultipartFile(
                                "file",
                                "invoice-a.pdf",
                                "application/pdf",
                                "first attachment content".getBytes(StandardCharsets.UTF_8)
                        )))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.storageProvider").value("LOCAL"))
                .andReturn();
        JsonNode createdAttachment = readJson(createAttachmentResult);
        Long attachmentId = createdAttachment.path("id").asLong();
        Path oldFilePath = resolveStoredAttachmentPath(createdAttachment.path("storagePath").asText());
        assertTrue(Files.exists(oldFilePath));

        var replacementDocumentType = createDocumentType();
        UpdateFinancialTransactionAttachmentRequest updateAttachmentRequest =
                new UpdateFinancialTransactionAttachmentRequest(replacementDocumentType.getId(), "updated metadata");

        mockMvc.perform(patch("/financial-transactions/{id}/attachments/{attachmentId}", transactionId, attachmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updateAttachmentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documentTypeId").value(replacementDocumentType.getId()))
                .andExpect(jsonPath("$.observation").value("updated metadata"));

        MvcResult replaceFileResult = mockMvc.perform(multipart("/financial-transactions/{id}/attachments/{attachmentId}/file", transactionId, attachmentId)
                        .file(new MockMultipartFile(
                                "file",
                                "invoice-b.txt",
                                "text/plain",
                                "replacement attachment content".getBytes(StandardCharsets.UTF_8)
                        ))
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("invoice-b.txt"))
                .andReturn();
        JsonNode replacedAttachment = readJson(replaceFileResult);
        Path newFilePath = resolveStoredAttachmentPath(replacedAttachment.path("storagePath").asText());
        assertFalse(Files.exists(oldFilePath));
        assertTrue(Files.exists(newFilePath));

        mockMvc.perform(delete("/financial-transactions/{id}/attachments/{attachmentId}", transactionId, attachmentId))
                .andExpect(status().isNoContent());
        assertFalse(Files.exists(newFilePath));
    }

    private Long createTransaction(CreateFinancialTransactionRequest request, MockMultipartFile... files) throws Exception {
        var multipartBuilder = multipart("/financial-transactions")
                .file(payloadPart(request));

        for (MockMultipartFile file : files) {
            multipartBuilder.file(file);
        }

        return readId(mockMvc.perform(multipartBuilder)
                .andExpect(status().isCreated())
                .andReturn());
    }

    private CreateFinancialTransactionRequest createUnpaidRequest() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        return new CreateFinancialTransactionRequest(
                valid.description(),
                valid.counterpartyId(),
                valid.issueDate(),
                valid.dueDate(),
                valid.documentNumber(),
                valid.type(),
                valid.observation(),
                valid.hasNf(),
                valid.items(),
                null,
                List.of()
        );
    }

    private CreateFinancialTransactionRequest createUnpaidRequest(String description, LocalDate issueDate) {
        CreateFinancialTransactionRequest valid = createValidRequest();
        return new CreateFinancialTransactionRequest(
                description,
                valid.counterpartyId(),
                issueDate,
                issueDate.plusDays(10),
                valid.documentNumber(),
                valid.type(),
                valid.observation(),
                false,
                valid.items(),
                null,
                List.of()
        );
    }

    private CreateFinancialTransactionRequest createIncomeRequestWithFulfillment(String initialBalance) {
        var counterparty = createCounterparty();
        var chartOfAccount = createChartOfAccount();
        var costCenter = createCostCenter();
        var product = createProduct();
        BankAccount bankAccount = bankAccountRepository.save(
                BankAccount.builder()
                        .name("Conta Recebimento")
                        .active(true)
                        .initialBalance(new BigDecimal(initialBalance))
                        .initialBalanceDate(LocalDate.of(2026, 6, 1))
                        .build()
        );

        return new CreateFinancialTransactionRequest(
                "Recebimento antecipado",
                counterparty.getId(),
                LocalDate.of(2026, 6, 29),
                LocalDate.of(2026, 7, 10),
                "REC-001",
                FinancialTransactionType.INCOME,
                "entrada de caixa",
                false,
                List.of(
                        new FinancialTransactionItemRequest(
                                chartOfAccount.getId(),
                                costCenter.getId(),
                                BigDecimal.ONE,
                                new BigDecimal("100.00"),
                                new BigDecimal("100.00"),
                                product.getId()
                        )
                ),
                null,
                List.of(
                        new FinancialTransactionFulfillmentRequest(
                                bankAccount.getId(),
                                LocalDate.of(2026, 6, 29),
                                new BigDecimal("100.00"),
                                "recebido",
                                List.of(new FinancialTransactionFulfillmentAllocationRequest(
                                        null,
                                        0,
                                        new BigDecimal("100.00")
                                ))
                        )
                )
        );
    }

    private CreateFinancialTransactionRequest createStockControlledPurchaseRequest() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        Product product = createStockControlledProduct(LocalDate.of(2026, 6, 1));
        FinancialTransactionItemRequest item = valid.items().getFirst();

        return new CreateFinancialTransactionRequest(
                valid.description(),
                valid.counterpartyId(),
                valid.issueDate(),
                valid.dueDate(),
                valid.documentNumber(),
                FinancialTransactionType.EXPENSE,
                valid.observation(),
                valid.hasNf(),
                List.of(new FinancialTransactionItemRequest(
                        item.chartOfAccountId(),
                        item.costCenterId(),
                        item.quantity(),
                        item.unitPrice(),
                        item.amount(),
                        product.getId(),
                        null,
                        new BigDecimal("42.50")
                )),
                valid.attachments(),
                valid.fulfillments()
        );
    }

    private MockMultipartFile payloadPart(Object payload) throws Exception {
        return new MockMultipartFile(
                "payload",
                "payload",
                APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(payload)
        );
    }

    private Long readId(MvcResult result) throws Exception {
        return readJson(result).path("id").asLong();
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}

