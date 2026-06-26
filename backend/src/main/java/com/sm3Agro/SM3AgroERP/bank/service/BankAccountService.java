package com.sm3Agro.SM3AgroERP.bank.service;

import com.sm3Agro.SM3AgroERP.bank.dto.bankAccount.CreateBankAccountRequest;
import com.sm3Agro.SM3AgroERP.bank.dto.bankAccount.UpdateBankAccountRequest;
import com.sm3Agro.SM3AgroERP.bank.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.bank.repository.BankAccountRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class BankAccountService {

    private final BankAccountRepository repository;

    public List<BankAccount> findAll() {
        return repository.findAll();
    }

    @Transactional
    public BankAccount create(CreateBankAccountRequest request) {
        BankAccount.BankAccountBuilder builder = BankAccount.builder()
                .accountType(request.accountType())
                .accountGroup(request.accountGroup())
                .name(request.name())
                .initialBalance(request.initialBalance())
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

        entity.setAccountType(request.accountType());
        entity.setAccountGroup(request.accountGroup());
        entity.setName(request.name());
        if (request.active() != null) {
            entity.setActive(request.active());
        }
        entity.setInitialBalance(request.initialBalance());
        entity.setInitialBalanceDate(request.initialBalanceDate());
        entity.setFinancialInstitution(request.financialInstitution());
        entity.setAgency(request.agency());
        entity.setAccountNumber(request.accountNumber());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("BankAccount not found: " + id);
        }
        repository.deleteById(id);
    }
}
