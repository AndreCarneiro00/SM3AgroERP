package com.sm3Agro.SM3AgroERP.financial.bankTransfer.service;

import com.sm3Agro.SM3AgroERP.financial.balance.BankBalanceService;
import com.sm3Agro.SM3AgroERP.financial.cashMovement.enums.CashMovementStatus;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer.CancelBankTransferRequest;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.repository.BankAccountRepository;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer.CreateBankTransferRequest;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer.UpdateBankTransferRequest;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.entity.BankTransfer;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.repository.BankTransferRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@RequiredArgsConstructor
@Service
public class BankTransferService {

    private final BankTransferRepository repository;
    private final BankAccountRepository bankAccountRepository;
    private final BankBalanceService bankBalanceService;

    public List<BankTransfer> findAll() {
        return findAll(null, null);
    }

    public List<BankTransfer> findAll(LocalDate startDate, LocalDate endDate) {
        return repository.findAllByTransferDatePeriod(startDate, endDate);
    }

    @Transactional
    public BankTransfer create(CreateBankTransferRequest request) {
        validateDistinctBankAccounts(request.sourceBankAccountId(), request.destinationBankAccountId());
        BankAccount sourceBankAccount = resolveBankAccount(request.sourceBankAccountId());
        BankAccount destinationBankAccount = resolveBankAccount(request.destinationBankAccountId());
        bankBalanceService.validateTransfer(
                sourceBankAccount,
                destinationBankAccount,
                request.transferDate(),
                request.amount(),
                null
        );

        BankTransfer entity = BankTransfer.builder()
                .sourceBankAccount(sourceBankAccount)
                .destinationBankAccount(destinationBankAccount)
                .amount(request.amount())
                .transferDate(request.transferDate())
                .observation(request.observation())
                .build();

        return repository.save(entity);
    }

    @Transactional
    public BankTransfer update(Long id, UpdateBankTransferRequest request) {
        BankTransfer entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BankTransfer not found: " + id));

        requireCashFieldsUnchanged(entity, request);
        entity.setObservation(request.observation());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("BankTransfer not found: " + id);
        }

        throw new IllegalArgumentException("Bank transfer cannot be deleted. Use a cancellation adjustment.");
    }

    @Transactional
    public BankTransfer cancel(Long id, CancelBankTransferRequest request) {
        BankTransfer originalTransfer = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BankTransfer not found: " + id));
        if (originalTransfer.getStatus() != CashMovementStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active bank transfers can be canceled.");
        }
        if (request == null || request.adjustmentDate() == null) {
            throw new IllegalArgumentException("Adjustment date is required.");
        }

        bankBalanceService.validateTransferAdjustment(originalTransfer, request.adjustmentDate());

        BankTransfer adjustment = BankTransfer.builder()
                .sourceBankAccount(originalTransfer.getDestinationBankAccount())
                .destinationBankAccount(originalTransfer.getSourceBankAccount())
                .amount(originalTransfer.getAmount())
                .transferDate(request.adjustmentDate())
                .observation(request.observation())
                .status(CashMovementStatus.ADJUSTMENT)
                .cancelTransfer(originalTransfer)
                .build();

        originalTransfer.setStatus(CashMovementStatus.CANCELED);
        repository.save(originalTransfer);
        return repository.save(adjustment);
    }

    private BankAccount resolveBankAccount(Long bankAccountId) {
        return bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new EntityNotFoundException("BankAccount not found: " + bankAccountId));
    }

    private void validateDistinctBankAccounts(Long sourceBankAccountId, Long destinationBankAccountId) {
        if (sourceBankAccountId != null && sourceBankAccountId.equals(destinationBankAccountId)) {
            throw new IllegalArgumentException("Source and destination bank accounts must be different.");
        }
    }

    private void requireCashFieldsUnchanged(BankTransfer entity, UpdateBankTransferRequest request) {
        if (!Objects.equals(entity.getSourceBankAccount().getId(), request.sourceBankAccountId())
                || !Objects.equals(entity.getDestinationBankAccount().getId(), request.destinationBankAccountId())
                || moneyChanged(entity.getAmount(), request.amount())
                || !Objects.equals(entity.getTransferDate(), request.transferDate())) {
            throw new IllegalArgumentException(
                    "Bank transfer cash fields cannot be changed. Use a cancellation adjustment."
            );
        }
    }

    private boolean moneyChanged(BigDecimal currentValue, BigDecimal requestedValue) {
        BigDecimal normalizedCurrentValue = currentValue != null ? currentValue : BigDecimal.ZERO;
        BigDecimal normalizedRequestedValue = requestedValue != null ? requestedValue : BigDecimal.ZERO;

        return normalizedCurrentValue.compareTo(normalizedRequestedValue) != 0;
    }
}
