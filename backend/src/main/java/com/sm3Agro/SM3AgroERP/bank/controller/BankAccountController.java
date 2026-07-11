package com.sm3Agro.SM3AgroERP.bank.controller;

import com.sm3Agro.SM3AgroERP.bank.dto.bankAccount.CreateBankAccountRequest;
import com.sm3Agro.SM3AgroERP.bank.dto.bankAccount.CreateBankAccountResponse;
import com.sm3Agro.SM3AgroERP.bank.dto.bankAccount.FindAllBankAccountResponse;
import com.sm3Agro.SM3AgroERP.bank.dto.bankAccount.UpdateBankAccountRequest;
import com.sm3Agro.SM3AgroERP.bank.dto.bankAccount.UpdateBankAccountResponse;
import com.sm3Agro.SM3AgroERP.bank.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.bank.service.BankBalanceService;
import com.sm3Agro.SM3AgroERP.bank.service.BankAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/bank-account")
public class BankAccountController {

    private final BankAccountService service;
    private final BankBalanceService balanceService;

    @GetMapping
    public List<FindAllBankAccountResponse> findAllBankAccount() {
        List<BankAccount> bankAccounts = service.findAll();
        return bankAccounts.stream()
                .map(this::toFindAllResponse)
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateBankAccountResponse createBankAccount(@RequestBody CreateBankAccountRequest request) {
        BankAccount created = service.create(request);
        return toCreateResponse(created);
    }

    @PutMapping("/{id}")
    public UpdateBankAccountResponse updateBankAccount(
            @PathVariable Long id,
            @RequestBody UpdateBankAccountRequest request
    ) {
        BankAccount updated = service.update(id, request);
        return toUpdateResponse(updated);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteBankAccount(@PathVariable Long id) {
        service.delete(id);
    }

    private FindAllBankAccountResponse toFindAllResponse(BankAccount bankAccount) {
        return new FindAllBankAccountResponse(
                bankAccount.getId(),
                bankAccount.getAccountType(),
                bankAccount.getAccountGroup(),
                bankAccount.getName(),
                bankAccount.getActive(),
                bankAccount.getInitialBalance(),
                bankAccount.getInitialBalanceDate(),
                bankAccount.getFinancialInstitution(),
                bankAccount.getAgency(),
                bankAccount.getAccountNumber(),
                balanceService.calculateCurrentBalance(bankAccount)
        );
    }

    private CreateBankAccountResponse toCreateResponse(BankAccount bankAccount) {
        return new CreateBankAccountResponse(
                bankAccount.getId(),
                bankAccount.getAccountType(),
                bankAccount.getAccountGroup(),
                bankAccount.getName(),
                bankAccount.getActive(),
                bankAccount.getInitialBalance(),
                bankAccount.getInitialBalanceDate(),
                bankAccount.getFinancialInstitution(),
                bankAccount.getAgency(),
                bankAccount.getAccountNumber(),
                balanceService.calculateCurrentBalance(bankAccount)
        );
    }

    private UpdateBankAccountResponse toUpdateResponse(BankAccount bankAccount) {
        return new UpdateBankAccountResponse(
                bankAccount.getId(),
                bankAccount.getAccountType(),
                bankAccount.getAccountGroup(),
                bankAccount.getName(),
                bankAccount.getActive(),
                bankAccount.getInitialBalance(),
                bankAccount.getInitialBalanceDate(),
                bankAccount.getFinancialInstitution(),
                bankAccount.getAgency(),
                bankAccount.getAccountNumber(),
                balanceService.calculateCurrentBalance(bankAccount)
        );
    }
}
