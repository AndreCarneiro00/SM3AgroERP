package com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create;

import com.sm3Agro.SM3AgroERP.masterData.counterparty.entity.Counterparty;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionAttachmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentAllocationRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionStatus;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionAttachmentService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionFulfillmentService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionItemService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionService;
import com.sm3Agro.SM3AgroERP.inventory.stock.InventoryStockService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CreateFinancialTransactionUseCaseTest {

    @Mock
    private FinancialTransactionService financialTransactionService;
    @Mock
    private FinancialTransactionItemService itemService;
    @Mock
    private FinancialTransactionFulfillmentService fulfillmentService;
    @Mock
    private FinancialTransactionAttachmentService attachmentService;
    @Mock
    private InventoryStockService inventoryStockService;

    @InjectMocks
    private CreateFinancialTransactionUseCase useCase;

    @Test
    void shouldOrchestrateTransactionCreation() {
        CreateFinancialTransactionRequest request = createRequest();
        List<MultipartFile> files = createFiles();
        FinancialTransaction transaction = createTransaction();
        FinancialTransaction recalculatedTransaction = createTransaction();
        List<FinancialTransactionItemResult> items = List.of(
                new FinancialTransactionItemResult(10L, 100L, 200L, new BigDecimal("2.00"),
                        new BigDecimal("50.00"), new BigDecimal("100.00"), 300L)
        );
        List<FinancialTransactionAttachmentResult> attachments = List.of(
                new FinancialTransactionAttachmentResult(20L, 400L, "invoice.pdf", "application/pdf",
                        1024L, "LOCAL", "/tmp/invoice.pdf", null, null, null, "abc", "obs")
        );
        List<FinancialTransactionFulfillmentResult> fulfillments = List.of(
                new FinancialTransactionFulfillmentResult(30L, 500L, LocalDate.of(2026, 6, 29),
                        new BigDecimal("100.00"), "paid",
                        List.of(new FinancialTransactionFulfillmentAllocationResult(
                                40L,
                                10L,
                                new BigDecimal("100.00")
                        )))
        );

        when(financialTransactionService.create(request)).thenReturn(transaction);
        when(itemService.createAll(transaction, request.items())).thenReturn(items);
        when(inventoryStockService.createFinancialMovement(
                transaction.getType(),
                transaction.getId(),
                transaction.getIssueDate(),
                items.getFirst().id(),
                items.getFirst().productId(),
                items.getFirst().quantity(),
                request.items().getFirst().inventoryUnitCost(),
                request.items().getFirst().inventoryBatchId()
        )).thenReturn(Optional.empty());
        when(fulfillmentService.createAll(transaction, request.fulfillments())).thenReturn(fulfillments);
        when(attachmentService.createAll(transaction, request.attachments(), files)).thenReturn(attachments);
        when(financialTransactionService.recalculate(transaction.getId())).thenReturn(recalculatedTransaction);

        CreateFinancialTransactionResult result = useCase.execute(request, files);

        assertEquals(1L, result.id());
        assertEquals("Purchase fertilizer", result.description());
        assertEquals(1, result.items().size());
        assertEquals(1, result.attachments().size());
        assertEquals(1, result.fulfillments().size());
        InOrder orderedFlow = inOrder(
                financialTransactionService,
                itemService,
                inventoryStockService,
                fulfillmentService,
                attachmentService
        );
        orderedFlow.verify(financialTransactionService).create(request);
        orderedFlow.verify(itemService).createAll(transaction, request.items());
        orderedFlow.verify(inventoryStockService).createFinancialMovement(
                transaction.getType(),
                transaction.getId(),
                transaction.getIssueDate(),
                items.getFirst().id(),
                items.getFirst().productId(),
                items.getFirst().quantity(),
                request.items().getFirst().inventoryUnitCost(),
                request.items().getFirst().inventoryBatchId()
        );
        orderedFlow.verify(fulfillmentService).createAll(transaction, request.fulfillments());
        orderedFlow.verify(attachmentService).createAll(transaction, request.attachments(), files);
        orderedFlow.verify(financialTransactionService).recalculate(transaction.getId());
    }

    @Test
    void shouldStopFlowWhenRootCreationFails() {
        CreateFinancialTransactionRequest request = createRequest();
        List<MultipartFile> files = createFiles();
        RuntimeException exception = new RuntimeException("root create failed");

        when(financialTransactionService.create(request)).thenThrow(exception);

        RuntimeException thrown = assertThrows(RuntimeException.class, () -> useCase.execute(request, files));

        assertEquals("root create failed", thrown.getMessage());
        verify(financialTransactionService).create(request);
        verify(itemService, never()).createAll(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
        verify(fulfillmentService, never()).createAll(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
        verify(attachmentService, never()).createAll(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any()
        );
        verify(financialTransactionService, never()).recalculate(org.mockito.ArgumentMatchers.anyLong());
    }

    private CreateFinancialTransactionRequest createRequest() {
        return new CreateFinancialTransactionRequest(
                "Purchase fertilizer",
                1L,
                LocalDate.of(2026, 6, 29),
                LocalDate.of(2026, 7, 10),
                "DOC-001",
                FinancialTransactionType.EXPENSE,
                "obs",
                true,
                List.of(new FinancialTransactionItemRequest(
                        100L, 200L, new BigDecimal("2.00"),
                        new BigDecimal("50.00"), new BigDecimal("100.00"), 300L
                )),
                List.of(new FinancialTransactionAttachmentRequest(
                        400L, 0, "obs"
                )),
                List.of(new FinancialTransactionFulfillmentRequest(
                        500L,
                        LocalDate.of(2026, 6, 29),
                        new BigDecimal("100.00"),
                        "paid",
                        List.of(new FinancialTransactionFulfillmentAllocationRequest(
                                null,
                                0,
                                new BigDecimal("100.00")
                        ))
                ))
        );
    }

    private List<MultipartFile> createFiles() {
        return List.of(new MockMultipartFile(
                "files",
                "invoice.pdf",
                "application/pdf",
                "invoice attachment content".getBytes(StandardCharsets.UTF_8)
        ));
    }

    private FinancialTransaction createTransaction() {
        return FinancialTransaction.builder()
                .id(1L)
                .description("Purchase fertilizer")
                .counterparty(Counterparty.builder().id(1L).legalName("Fornecedor").build())
                .issueDate(LocalDate.of(2026, 6, 29))
                .dueDate(LocalDate.of(2026, 7, 10))
                .documentNumber("DOC-001")
                .status(FinancialTransactionStatus.PAID)
                .type(FinancialTransactionType.EXPENSE)
                .observation("obs")
                .hasNf(true)
                .totalAmount(new BigDecimal("100.00"))
                .build();
    }
}

