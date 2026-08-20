package com.sm3Agro.SM3AgroERP.masterData.bankAccount.service;

import com.sm3Agro.SM3AgroERP.financial.bankTransfer.repository.BankTransferRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentRepository;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.dto.CreateBankAccountRequest;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.dto.UpdateBankAccountRequest;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.repository.BankAccountRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@RequiredArgsConstructor
@Service
public class BankAccountService {

    private final BankAccountRepository repository;
    private final FinancialTransactionFulfillmentRepository fulfillmentRepository;
    private final BankTransferRepository bankTransferRepository;

    public List<BankAccount> findAll() {
        return repository.findAll();
    }

    @Transactional
    public BankAccount create(CreateBankAccountRequest request) {
        BankAccount.BankAccountBuilder builder = BankAccount.builder()
                .accountType(request.accountType())
                .accountGroup(request.accountGroup())
                .name(request.name())
                .initialBalance(request.initialBalance() != null ? request.initialBalance() : BigDecimal.ZERO)
                .initialBalanceDate(request.initialBalanceDate())
                .financialInstitution(request.financialInstitution())
                .agency(request.agency())
                .accountNumber(request.accountNumber());
        if (request.active() != null) {
            builder.active(request.active());
        }
        BankAccount entity = builder.build();
        return repository.save(entity);
    }

    @Transactional
    public BankAccount update(Long id, UpdateBankAccountRequest request) {
        BankAccount entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BankAccount not found: " + id));

        requireInitialBalanceUnchanged(entity, request);

        entity.setAccountType(request.accountType());
        entity.setAccountGroup(request.accountGroup());
        entity.setName(request.name());
        if (request.active() != null) {
            entity.setActive(request.active());
        }
        entity.setFinancialInstitution(request.financialInstitution());
        entity.setAgency(request.agency());
        entity.setAccountNumber(request.accountNumber());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        BankAccount entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BankAccount not found: " + id));

        if (fulfillmentRepository.existsByBankAccountId(id)
                || bankTransferRepository.existsBySourceBankAccountIdOrDestinationBankAccountId(id, id)) {
            throw new IllegalArgumentException("Bank account cannot be deleted because it has financial movements.");
        }

        repository.delete(entity);
    }

    private void requireInitialBalanceUnchanged(BankAccount entity, UpdateBankAccountRequest request) {
        if (!sameMoneyValue(entity.getInitialBalance(), request.initialBalance())
                || !Objects.equals(entity.getInitialBalanceDate(), request.initialBalanceDate())) {
            throw new IllegalArgumentException("Initial bank balance cannot be changed after account creation.");
        }
    }

    private boolean sameMoneyValue(BigDecimal currentValue, BigDecimal requestedValue) {
        BigDecimal normalizedCurrentValue = currentValue != null ? currentValue : BigDecimal.ZERO;
        BigDecimal normalizedRequestedValue = requestedValue != null ? requestedValue : BigDecimal.ZERO;

        return normalizedCurrentValue.compareTo(normalizedRequestedValue) == 0;
    }
}
