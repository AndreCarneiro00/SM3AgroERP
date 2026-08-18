package com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionAttachmentService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionFulfillmentService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionItemService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionService;
import com.sm3Agro.SM3AgroERP.inventory.stock.InventoryStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CreateFinancialTransactionUseCase {

    private final FinancialTransactionService financialTransactionService;
    private final FinancialTransactionItemService itemService;
    private final FinancialTransactionFulfillmentService fulfillmentService;
    private final FinancialTransactionAttachmentService attachmentService;
    private final InventoryStockService inventoryStockService;

    public CreateFinancialTransactionResult execute(
            CreateFinancialTransactionRequest request,
            List<MultipartFile> files
    ) {
        FinancialTransaction transaction = financialTransactionService.create(request);

        List<FinancialTransactionItemResult> items =
                itemService.createAll(transaction, request.items());
        List<FinancialTransactionItemResult> itemsWithStock =
                createStockMovements(transaction, request, items);

        List<FinancialTransactionFulfillmentResult> fulfillments =
                fulfillmentService.createAll(transaction, request.fulfillments());

        List<FinancialTransactionAttachmentResult> attachments =
                attachmentService.createAll(transaction, request.attachments(), files);

        FinancialTransaction recalculatedTransaction =
                financialTransactionService.recalculate(transaction.getId());

        return new CreateFinancialTransactionResult(
                recalculatedTransaction.getId(),
                recalculatedTransaction.getDescription(),
                recalculatedTransaction.getCounterparty() != null ? recalculatedTransaction.getCounterparty().getId() : null,
                recalculatedTransaction.getIssueDate(),
                recalculatedTransaction.getDueDate(),
                recalculatedTransaction.getDocumentNumber(),
                recalculatedTransaction.getStatus(),
                recalculatedTransaction.getType(),
                recalculatedTransaction.getObservation(),
                recalculatedTransaction.getHasNf(),
                recalculatedTransaction.getTotalAmount(),
                itemsWithStock,
                attachments,
                fulfillments
        );
    }

    private List<FinancialTransactionItemResult> createStockMovements(
            FinancialTransaction transaction,
            CreateFinancialTransactionRequest request,
            List<FinancialTransactionItemResult> items
    ) {
        List<FinancialTransactionItemResult> result = new ArrayList<>();

        for (int index = 0; index < items.size(); index++) {
            FinancialTransactionItemResult item = items.get(index);
            var itemRequest = request.items().get(index);

            inventoryStockService.createFinancialMovement(
                            transaction.getType(),
                            transaction.getId(),
                            transaction.getIssueDate(),
                            item.id(),
                            item.productId(),
                            item.quantity(),
                            resolveInventoryUnitCost(transaction, item, itemRequest),
                            itemRequest.inventoryBatchId()
                    )
                    .map(stockMovement -> item.withStockMovement(
                            stockMovement.movement().getId(),
                            stockMovement.batch().getId(),
                            stockMovement.movement().getMovementType()
                    ))
                    .ifPresentOrElse(result::add, () -> result.add(item));
        }

        return result;
    }

    private BigDecimal resolveInventoryUnitCost(
            FinancialTransaction transaction,
            FinancialTransactionItemResult item,
            FinancialTransactionItemRequest itemRequest
    ) {
        if (transaction.getType() == FinancialTransactionType.EXPENSE && itemRequest.inventoryUnitCost() == null) {
            return item.unitPrice();
        }

        return itemRequest.inventoryUnitCost();
    }

}
