package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.financial.cashMovement.enums.CashMovementStatus;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CancelFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.domain.FinancialTransactionRules;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillment;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionStatus;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionItemRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionRepository;
import com.sm3Agro.SM3AgroERP.inventory.movement.repository.InventoryMovementRepository;
import com.sm3Agro.SM3AgroERP.masterData.counterparty.entity.Counterparty;
import com.sm3Agro.SM3AgroERP.masterData.counterparty.repository.CounterpartyRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinancialTransactionService {

    private final FinancialTransactionRepository financialTransactionRepository;
    private final FinancialTransactionItemRepository itemRepository;
    private final FinancialTransactionFulfillmentRepository fulfillmentRepository;
    private final CounterpartyRepository counterpartyRepository;
    private final FinancialTransactionRules rules;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final FinancialTransactionFulfillmentAdjustmentService fulfillmentAdjustmentService;

    public List<FinancialTransaction> findAll() {
        return findAll(null, null);
    }

    public List<FinancialTransaction> findAll(LocalDate startDate, LocalDate endDate) {
        return financialTransactionRepository.findAllByIssueDatePeriod(startDate, endDate);
    }

    public FinancialTransaction findById(Long id) {
        return financialTransactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FinancialTransaction not found: " + id));
    }

    public FinancialTransaction findMutableById(Long id) {
        FinancialTransaction transaction = findById(id);
        rules.requireMutable(transaction);
        return transaction;
    }

    public FinancialTransaction create(CreateFinancialTransactionRequest request) {
        Counterparty counterparty = request.counterpartyId() == null
                ? null
                : counterpartyRepository.findById(request.counterpartyId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Counterparty not found: " + request.counterpartyId()
                ));

        BigDecimal totalAmount = calculateRequestedTotalAmount(request.items());
        BigDecimal paidAmount = calculateRequestedPaidAmount(request.fulfillments());
        FinancialTransactionStatus status = rules.resolveStatus(totalAmount, paidAmount);

        FinancialTransaction entity = FinancialTransaction.builder()
                .description(request.description())
                .counterparty(counterparty)
                .issueDate(request.issueDate())
                .dueDate(request.dueDate())
                .documentNumber(request.documentNumber())
                .status(status)
                .type(request.type())
                .observation(request.observation())
                .hasNf(request.hasNf() != null ? request.hasNf() : false)
                .totalAmount(totalAmount)
                .build();

        return financialTransactionRepository.save(entity);
    }

    @Transactional
    public FinancialTransaction update(Long id, UpdateFinancialTransactionRequest request) {
        FinancialTransaction transaction = findMutableById(id);

        if (transaction.getType() != request.type()) {
            throw new IllegalArgumentException("Financial transaction type cannot be changed after creation.");
        }

        if (!transaction.getIssueDate().equals(request.issueDate())) {
            throw new IllegalArgumentException("Financial transaction issue date cannot be changed after creation.");
        }

        Counterparty counterparty = request.counterpartyId() == null
                ? null
                : counterpartyRepository.findById(request.counterpartyId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Counterparty not found: " + request.counterpartyId()
                ));

        transaction.setDescription(request.description());
        transaction.setCounterparty(counterparty);
        transaction.setDueDate(request.dueDate());
        transaction.setDocumentNumber(request.documentNumber());
        transaction.setObservation(request.observation());
        transaction.setHasNf(request.hasNf() != null ? request.hasNf() : false);

        return financialTransactionRepository.save(transaction);
    }

    @Transactional
    public FinancialTransaction cancel(Long id) {
        return cancel(id, null);
    }

    @Transactional
    public FinancialTransaction cancel(Long id, CancelFinancialTransactionRequest request) {
        FinancialTransaction transaction = findById(id);
        rules.requireMutable(transaction);

        if (inventoryMovementRepository.existsByFinancialTransactionId(id)) {
            throw new IllegalArgumentException("Cannot cancel a financial transaction with inventory movements.");
        }

        List<FinancialTransactionFulfillment> activeFulfillments =
                fulfillmentRepository.findByFinancialTransactionIdAndStatus(id, CashMovementStatus.ACTIVE);

        if (!activeFulfillments.isEmpty() && (request == null || request.adjustmentDate() == null)) {
            throw new IllegalArgumentException("Adjustment date is required to cancel a paid financial transaction.");
        }

        for (FinancialTransactionFulfillment fulfillment : activeFulfillments) {
            fulfillmentAdjustmentService.cancel(
                    fulfillment,
                    request.adjustmentDate(),
                    request.observation()
            );
        }

        transaction.setStatus(FinancialTransactionStatus.CANCELED);
        return financialTransactionRepository.save(transaction);
    }

    @Transactional
    public FinancialTransaction recalculate(Long id) {
        FinancialTransaction transaction = findById(id);

        if (transaction.getStatus() == FinancialTransactionStatus.CANCELED) {
            return transaction;
        }

        BigDecimal totalAmount = rules.calculateTotalAmount(itemRepository.findByFinancialTransactionId(id));
        BigDecimal paidAmount = rules.calculatePaidAmount(fulfillmentRepository.findByFinancialTransactionId(id));

        transaction.setTotalAmount(totalAmount);
        transaction.setStatus(rules.resolveStatus(totalAmount, paidAmount));

        return financialTransactionRepository.save(transaction);
    }

    private BigDecimal calculateRequestedTotalAmount(List<FinancialTransactionItemRequest> items) {
        return items.stream()
                .map(this::resolveRequestedItemAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal resolveRequestedItemAmount(FinancialTransactionItemRequest item) {
        if (item.quantity() == null || item.unitPrice() == null) {
            return item.amount() == null ? BigDecimal.ZERO : item.amount();
        }

        return item.quantity()
                .multiply(item.unitPrice())
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateRequestedPaidAmount(List<FinancialTransactionFulfillmentRequest> fulfillments) {
        if (fulfillments == null || fulfillments.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return fulfillments.stream()
                .map(fulfillment -> fulfillment.amountPaid() == null ? BigDecimal.ZERO : fulfillment.amountPaid())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
