package com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionAttachmentService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionFulfillmentService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionItemService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionService;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.CreateFinancialTransactionResult;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.FinancialTransactionAttachmentResult;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.FinancialTransactionFulfillmentResult;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.FinancialTransactionItemResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CreateFinancialTransactionUseCase {

    private final FinancialTransactionService financialTransactionService;
    private final FinancialTransactionItemService itemService;
    private final FinancialTransactionFulfillmentService fulfillmentService;
    private final FinancialTransactionAttachmentService attachmentService;

    public CreateFinancialTransactionResult execute(
            CreateFinancialTransactionRequest request,
            List<MultipartFile> files
    ) {
        FinancialTransaction transaction = financialTransactionService.create(request);

        List<FinancialTransactionItemResult> items =
                itemService.createAll(transaction, request.items());

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
                items,
                attachments,
                fulfillments
        );
    }

}
