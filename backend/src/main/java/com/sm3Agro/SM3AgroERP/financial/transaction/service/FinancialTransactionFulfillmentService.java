package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.financial.balance.BankBalanceService;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.repository.BankAccountRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.domain.FinancialTransactionRules;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CancelFinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentAllocationRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillmentAllocation;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillment;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionItem;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentAllocationRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionItemRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.FinancialTransactionFulfillmentAllocationResult;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.FinancialTransactionFulfillmentResult;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RequiredArgsConstructor
@Service
public class FinancialTransactionFulfillmentService {

    private final FinancialTransactionFulfillmentRepository fulfillmentRepository;
    private final FinancialTransactionFulfillmentAllocationRepository allocationRepository;
    private final FinancialTransactionItemRepository itemRepository;
    private final BankAccountRepository bankAccountRepository;
    private final FinancialTransactionService transactionService;
    private final FinancialTransactionRules rules;
    private final BankBalanceService bankBalanceService;
    private final FinancialTransactionFulfillmentAdjustmentService fulfillmentAdjustmentService;

    public List<FinancialTransactionFulfillmentResult> createAll(
            FinancialTransaction financialTransaction,
            List<FinancialTransactionFulfillmentRequest> fulfillments
    ) {
        if (fulfillments == null || fulfillments.isEmpty()) {
            return List.of();
        }

        return fulfillments.stream()
                .map(fulfillmentRequest -> createForTransaction(financialTransaction, fulfillmentRequest, null))
                .map(this::toResult)
                .toList();
    }

    @Transactional
    public FinancialTransactionFulfillment create(
            Long financialTransactionId,
            FinancialTransactionFulfillmentRequest request
    ) {
        FinancialTransaction transaction = transactionService.findMutableById(financialTransactionId);
        FinancialTransactionFulfillment saved = createForTransaction(transaction, request, null);
        transactionService.recalculate(financialTransactionId);
        return saved;
    }

    @Transactional
    public FinancialTransactionFulfillment update(
            Long financialTransactionId,
            Long fulfillmentId,
            UpdateFinancialTransactionFulfillmentRequest request
    ) {
        transactionService.findMutableById(financialTransactionId);
        FinancialTransactionFulfillment fulfillment = findOwnedFulfillment(financialTransactionId, fulfillmentId);

        requireCashFieldsUnchanged(fulfillment, request);
        fulfillment.setObservation(request.observation());

        FinancialTransactionFulfillment saved = fulfillmentRepository.save(fulfillment);
        transactionService.recalculate(financialTransactionId);
        return saved;
    }

    @Transactional
    public void delete(Long financialTransactionId, Long fulfillmentId) {
        transactionService.findMutableById(financialTransactionId);
        findOwnedFulfillment(financialTransactionId, fulfillmentId);
        throw new IllegalArgumentException("Paid fulfillment cannot be deleted. Use a cancellation adjustment.");
    }

    @Transactional
    public FinancialTransactionFulfillment cancel(
            Long financialTransactionId,
            Long fulfillmentId,
            CancelFinancialTransactionFulfillmentRequest request
    ) {
        transactionService.findMutableById(financialTransactionId);
        FinancialTransactionFulfillment fulfillment = findOwnedFulfillment(financialTransactionId, fulfillmentId);
        if (request == null || request.adjustmentDate() == null) {
            throw new IllegalArgumentException("Adjustment date is required.");
        }

        FinancialTransactionFulfillment adjustment = fulfillmentAdjustmentService.cancel(
                fulfillment,
                request.adjustmentDate(),
                request.observation()
        );
        transactionService.recalculate(financialTransactionId);
        return adjustment;
    }

    private FinancialTransactionFulfillment createForTransaction(
            FinancialTransaction transaction,
            FinancialTransactionFulfillmentRequest request,
            Long excludedFulfillmentId
    ) {
        BankAccount bankAccount = resolveBankAccount(request.bankAccountId());
        bankBalanceService.validateFulfillment(
                transaction,
                bankAccount,
                request.paymentDate(),
                request.amountPaid(),
                excludedFulfillmentId
        );
        validatePaymentBounds(transaction, request.amountPaid(), excludedFulfillmentId);
        validateAndResolveAllocations(transaction, excludedFulfillmentId, request.amountPaid(), request.allocations());
        FinancialTransactionFulfillment saved = fulfillmentRepository.save(buildEntity(transaction, bankAccount, request));
        replaceAllocations(saved, request.allocations());
        return saved;
    }

    private FinancialTransactionFulfillment findOwnedFulfillment(Long financialTransactionId, Long fulfillmentId) {
        return fulfillmentRepository.findByIdAndFinancialTransactionId(fulfillmentId, financialTransactionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "FinancialTransactionFulfillment not found: " + fulfillmentId
                ));
    }

    private FinancialTransactionFulfillment buildEntity(
            FinancialTransaction financialTransaction,
            BankAccount bankAccount,
            FinancialTransactionFulfillmentRequest fulfillmentRequest
    ) {
        return FinancialTransactionFulfillment.builder()
                .financialTransaction(financialTransaction)
                .bankAccount(bankAccount)
                .paymentDate(fulfillmentRequest.paymentDate())
                .amountPaid(fulfillmentRequest.amountPaid())
                .observation(fulfillmentRequest.observation())
                .build();
    }

    private void replaceAllocations(
            FinancialTransactionFulfillment fulfillment,
            List<FinancialTransactionFulfillmentAllocationRequest> allocationRequests
    ) {
        allocationRepository.deleteByFulfillmentId(fulfillment.getId());
        List<FinancialTransactionFulfillmentAllocation> allocations = allocationRequests.stream()
                .map(allocationRequest -> FinancialTransactionFulfillmentAllocation.builder()
                        .fulfillment(fulfillment)
                        .financialTransactionItem(resolveAllocationItem(
                                fulfillment.getFinancialTransaction(),
                                allocationRequest
                        ))
                        .amount(allocationRequest.amount())
                        .build()
                )
                .toList();

        allocationRepository.saveAll(allocations);
    }

    private List<FinancialTransactionItem> validateAndResolveAllocations(
            FinancialTransaction transaction,
            Long excludedFulfillmentId,
            BigDecimal amountPaid,
            List<FinancialTransactionFulfillmentAllocationRequest> allocationRequests
    ) {
        if (allocationRequests == null || allocationRequests.isEmpty()) {
            throw new IllegalArgumentException("Fulfillment allocations are required.");
        }

        List<FinancialTransactionItem> resolvedItems = allocationRequests.stream()
                .map(allocationRequest -> resolveAllocationItem(transaction, allocationRequest))
                .toList();
        BigDecimal allocatedAmount = allocationRequests.stream()
                .map(FinancialTransactionFulfillmentAllocationRequest::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<Long, BigDecimal> requestedByItem = new LinkedHashMap<>();

        for (int index = 0; index < allocationRequests.size(); index++) {
            FinancialTransactionFulfillmentAllocationRequest request = allocationRequests.get(index);
            FinancialTransactionItem item = resolvedItems.get(index);
            requestedByItem.merge(item.getId(), request.amount(), BigDecimal::add);
        }

        requestedByItem.forEach((itemId, requestedAmount) -> {
            FinancialTransactionItem item = itemRepository.findByIdAndFinancialTransactionId(itemId, transaction.getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "FinancialTransactionItem not found: " + itemId
                    ));
            BigDecimal alreadyAllocated = allocationRepository.sumAmountByItemExcludingFulfillment(
                    itemId,
                    excludedFulfillmentId
            );

            rules.requireItemAllocationNotOverAmount(item.getAmount(), alreadyAllocated.add(requestedAmount));
        });

        rules.requireAllocationMatchesPayment(amountPaid, allocatedAmount);

        return resolvedItems;
    }

    private void requireCashFieldsUnchanged(
            FinancialTransactionFulfillment fulfillment,
            UpdateFinancialTransactionFulfillmentRequest request
    ) {
        if (!Objects.equals(fulfillment.getBankAccount().getId(), request.bankAccountId())
                || !Objects.equals(fulfillment.getPaymentDate(), request.paymentDate())
                || moneyChanged(fulfillment.getAmountPaid(), request.amountPaid())
                || allocationsChanged(fulfillment, request.allocations())) {
            throw new IllegalArgumentException(
                    "Paid fulfillment cash fields cannot be changed. Use a cancellation adjustment."
            );
        }
    }

    private boolean moneyChanged(BigDecimal currentValue, BigDecimal requestedValue) {
        BigDecimal normalizedCurrentValue = currentValue != null ? currentValue : BigDecimal.ZERO;
        BigDecimal normalizedRequestedValue = requestedValue != null ? requestedValue : BigDecimal.ZERO;

        return normalizedCurrentValue.compareTo(normalizedRequestedValue) != 0;
    }

    private boolean allocationsChanged(
            FinancialTransactionFulfillment fulfillment,
            List<FinancialTransactionFulfillmentAllocationRequest> allocationRequests
    ) {
        if (allocationRequests == null) {
            return true;
        }

        Map<Long, BigDecimal> currentAllocations = new LinkedHashMap<>();
        allocationRepository.findByFulfillmentId(fulfillment.getId()).forEach(allocation ->
                currentAllocations.merge(
                        allocation.getFinancialTransactionItem().getId(),
                        allocation.getAmount(),
                        BigDecimal::add
                )
        );

        Map<Long, BigDecimal> requestedAllocations = new LinkedHashMap<>();
        for (FinancialTransactionFulfillmentAllocationRequest allocationRequest : allocationRequests) {
            FinancialTransactionItem item = resolveAllocationItem(
                    fulfillment.getFinancialTransaction(),
                    allocationRequest
            );
            requestedAllocations.merge(item.getId(), allocationRequest.amount(), BigDecimal::add);
        }

        if (!currentAllocations.keySet().equals(requestedAllocations.keySet())) {
            return true;
        }

        for (Map.Entry<Long, BigDecimal> entry : currentAllocations.entrySet()) {
            BigDecimal requestedAmount = requestedAllocations.get(entry.getKey());
            if (moneyChanged(entry.getValue(), requestedAmount)) {
                return true;
            }
        }

        return false;
    }

    private void validatePaymentBounds(
            FinancialTransaction transaction,
            BigDecimal amountPaid,
            Long excludedFulfillmentId
    ) {
        BigDecimal alreadyPaid = fulfillmentRepository.sumAmountPaidByTransactionExcludingFulfillment(
                transaction.getId(),
                excludedFulfillmentId
        );

        rules.requirePaymentNotOverTotal(transaction.getTotalAmount(), alreadyPaid.add(amountPaid));
    }

    private FinancialTransactionItem resolveAllocationItem(
            FinancialTransaction transaction,
            FinancialTransactionFulfillmentAllocationRequest allocationRequest
    ) {
        boolean hasItemId = allocationRequest.itemId() != null;
        boolean hasItemIndex = allocationRequest.itemIndex() != null;

        if (hasItemId == hasItemIndex) {
            throw new IllegalArgumentException("Allocation must reference exactly one itemId or itemIndex.");
        }

        if (hasItemId) {
            return itemRepository.findByIdAndFinancialTransactionId(allocationRequest.itemId(), transaction.getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "FinancialTransactionItem not found: " + allocationRequest.itemId()
                    ));
        }

        List<FinancialTransactionItem> transactionItems = itemRepository.findByFinancialTransactionIdOrderByIdAsc(
                transaction.getId()
        );

        if (allocationRequest.itemIndex() < 0 || allocationRequest.itemIndex() >= transactionItems.size()) {
            throw new IllegalArgumentException("Allocation itemIndex is out of range.");
        }

        return transactionItems.get(allocationRequest.itemIndex());
    }

    private BankAccount resolveBankAccount(Long bankAccountId) {
        return bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "BankAccount not found: " + bankAccountId
                ));
    }

    private FinancialTransactionFulfillmentResult toResult(FinancialTransactionFulfillment saved) {
        return new FinancialTransactionFulfillmentResult(
                saved.getId(),
                saved.getBankAccount().getId(),
                saved.getPaymentDate(),
                saved.getAmountPaid(),
                saved.getObservation(),
                saved.getStatus(),
                saved.getCancelFulfillment() != null ? saved.getCancelFulfillment().getId() : null,
                allocationRepository.findByFulfillmentId(saved.getId()).stream()
                        .map(allocation -> new FinancialTransactionFulfillmentAllocationResult(
                                allocation.getId(),
                                allocation.getFinancialTransactionItem().getId(),
                                allocation.getAmount()
                        ))
                        .toList()
        );
    }
}
