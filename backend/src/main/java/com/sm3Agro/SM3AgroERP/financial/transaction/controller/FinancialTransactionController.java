package com.sm3Agro.SM3AgroERP.financial.transaction.controller;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionAttachmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionAttachmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.CreateFinancialTransactionResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionAttachmentResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionDetailResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionFulfillmentAllocationResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionFulfillmentResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionItemResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionSummaryResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.mapper.FinancialTransactionResponseMapper;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionAttachmentService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionFulfillmentService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionItemService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionQueryService;
import com.sm3Agro.SM3AgroERP.financial.transaction.service.FinancialTransactionService;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.CreateFinancialTransactionUseCase;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.CreateFinancialTransactionResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/financial-transactions")
public class FinancialTransactionController {

    private final CreateFinancialTransactionUseCase createUseCase;
    private final FinancialTransactionQueryService queryService;
    private final FinancialTransactionService transactionService;
    private final FinancialTransactionItemService itemService;
    private final FinancialTransactionFulfillmentService fulfillmentService;
    private final FinancialTransactionAttachmentService attachmentService;
    private final FinancialTransactionResponseMapper mapper;

    @GetMapping
    public List<FinancialTransactionSummaryResponse> findAll(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {
        return queryService.findAll(startDate, endDate);
    }

    @GetMapping("/{id}")
    public FinancialTransactionDetailResponse findById(@PathVariable Long id) {
        return queryService.findById(id);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CreateFinancialTransactionResponse create(
            @Valid @RequestPart("payload") CreateFinancialTransactionRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        CreateFinancialTransactionResult created = createUseCase.execute(request, files);

        return new CreateFinancialTransactionResponse(
                created.id(),
                created.description(),
                created.counterpartyId(),
                created.issueDate(),
                created.dueDate(),
                created.documentNumber(),
                created.status(),
                created.type(),
                created.observation(),
                created.hasNf(),
                created.totalAmount(),
                created.items().stream()
                        .map(item -> new FinancialTransactionItemResponse(
                                item.id(),
                                item.chartOfAccountId(),
                                item.costCenterId(),
                                item.quantity(),
                                item.unitPrice(),
                                item.amount(),
                                item.productId(),
                                item.inventoryMovementId(),
                                item.inventoryBatchId(),
                                item.stockMovementType()
                        ))
                        .toList(),
                created.attachments().stream()
                        .map(attachment -> new FinancialTransactionAttachmentResponse(
                                attachment.id(),
                                attachment.documentTypeId(),
                                attachment.fileName(),
                                attachment.declaredContentType(),
                                attachment.sizeBytes(),
                                attachment.storageProvider(),
                                attachment.storagePath(),
                                attachment.externalFileId(),
                                attachment.externalParentId(),
                                attachment.webUrl(),
                                attachment.checksumSha256(),
                                attachment.observation()
                        ))
                        .toList(),
                created.fulfillments().stream()
                        .map(fulfillment -> new FinancialTransactionFulfillmentResponse(
                                fulfillment.id(),
                                fulfillment.bankAccountId(),
                                fulfillment.paymentDate(),
                                fulfillment.amountPaid(),
                                fulfillment.observation(),
                                fulfillment.allocations().stream()
                                        .map(allocation -> new FinancialTransactionFulfillmentAllocationResponse(
                                                allocation.id(),
                                                allocation.itemId(),
                                                allocation.amount()
                                        ))
                                        .toList()
                        ))
                        .toList()
        );
    }

    @PatchMapping("/{id}")
    public FinancialTransactionDetailResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFinancialTransactionRequest request
    ) {
        transactionService.update(id, request);
        return queryService.findById(id);
    }

    @PostMapping("/{id}/cancel")
    public FinancialTransactionDetailResponse cancel(@PathVariable Long id) {
        transactionService.cancel(id);
        return queryService.findById(id);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{id}/items")
    public FinancialTransactionItemResponse createItem(
            @PathVariable Long id,
            @Valid @RequestBody FinancialTransactionItemRequest request
    ) {
        return mapper.toItemResponse(itemService.create(id, request));
    }

    @PatchMapping("/{id}/items/{itemId}")
    public FinancialTransactionItemResponse updateItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateFinancialTransactionItemRequest request
    ) {
        return mapper.toItemResponse(itemService.update(id, itemId, request));
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}/items/{itemId}")
    public void deleteItem(
            @PathVariable Long id,
            @PathVariable Long itemId
    ) {
        itemService.delete(id, itemId);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{id}/fulfillments")
    public FinancialTransactionFulfillmentResponse createFulfillment(
            @PathVariable Long id,
            @Valid @RequestBody FinancialTransactionFulfillmentRequest request
    ) {
        return mapper.toFulfillmentResponse(fulfillmentService.create(id, request));
    }

    @PatchMapping("/{id}/fulfillments/{fulfillmentId}")
    public FinancialTransactionFulfillmentResponse updateFulfillment(
            @PathVariable Long id,
            @PathVariable Long fulfillmentId,
            @Valid @RequestBody UpdateFinancialTransactionFulfillmentRequest request
    ) {
        return mapper.toFulfillmentResponse(fulfillmentService.update(id, fulfillmentId, request));
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}/fulfillments/{fulfillmentId}")
    public void deleteFulfillment(
            @PathVariable Long id,
            @PathVariable Long fulfillmentId
    ) {
        fulfillmentService.delete(id, fulfillmentId);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FinancialTransactionAttachmentResponse createAttachment(
            @PathVariable Long id,
            @Valid @RequestPart("payload") CreateFinancialTransactionAttachmentRequest request,
            @RequestPart("file") MultipartFile file
    ) {
        return mapper.toAttachmentResponse(attachmentService.create(id, request, file));
    }

    @PatchMapping("/{id}/attachments/{attachmentId}")
    public FinancialTransactionAttachmentResponse updateAttachmentMetadata(
            @PathVariable Long id,
            @PathVariable Long attachmentId,
            @Valid @RequestBody UpdateFinancialTransactionAttachmentRequest request
    ) {
        return mapper.toAttachmentResponse(attachmentService.updateMetadata(id, attachmentId, request));
    }

    @PutMapping(value = "/{id}/attachments/{attachmentId}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FinancialTransactionAttachmentResponse replaceAttachmentFile(
            @PathVariable Long id,
            @PathVariable Long attachmentId,
            @RequestPart("file") MultipartFile file
    ) {
        return mapper.toAttachmentResponse(attachmentService.replaceFile(id, attachmentId, file));
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public void deleteAttachment(
            @PathVariable Long id,
            @PathVariable Long attachmentId
    ) {
        attachmentService.delete(id, attachmentId);
    }

}
