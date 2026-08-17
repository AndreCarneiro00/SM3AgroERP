package com.sm3Agro.SM3AgroERP.financial.bankTransfer.service;

import com.sm3Agro.SM3AgroERP.financial.balance.BankBalanceService;
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

import java.util.List;

@RequiredArgsConstructor
@Service
public class BankTransferService {

    private final BankTransferRepository repository;
    private final BankAccountRepository bankAccountRepository;
    private final BankBalanceService bankBalanceService;

    public List<BankTransfer> findAll() {
        return repository.findAll();
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

        validateDistinctBankAccounts(request.sourceBankAccountId(), request.destinationBankAccountId());
        BankAccount sourceBankAccount = resolveBankAccount(request.sourceBankAccountId());
        BankAccount destinationBankAccount = resolveBankAccount(request.destinationBankAccountId());
        bankBalanceService.validateTransfer(
                sourceBankAccount,
                destinationBankAccount,
                request.transferDate(),
                request.amount(),
                id
        );

        entity.setSourceBankAccount(sourceBankAccount);
        entity.setDestinationBankAccount(destinationBankAccount);
        entity.setAmount(request.amount());
        entity.setTransferDate(request.transferDate());
        entity.setObservation(request.observation());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("BankTransfer not found: " + id);
        }

        repository.deleteById(id);
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
}
