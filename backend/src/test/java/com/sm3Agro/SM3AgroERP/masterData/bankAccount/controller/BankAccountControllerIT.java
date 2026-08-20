package com.sm3Agro.SM3AgroERP.masterData.bankAccount.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.dto.CreateBankAccountRequest;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.dto.UpdateBankAccountRequest;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.entity.BankTransfer;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.repository.BankAccountRepository;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.repository.BankTransferRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionAttachmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentAllocationRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionItemRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BankAccountControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BankAccountRepository repository;

    @Autowired
    private BankTransferRepository bankTransferRepository;

    @Autowired
    private FinancialTransactionFulfillmentAllocationRepository fulfillmentAllocationRepository;

    @Autowired
    private FinancialTransactionFulfillmentRepository fulfillmentRepository;

    @Autowired
    private FinancialTransactionAttachmentRepository attachmentRepository;

    @Autowired
    private FinancialTransactionItemRepository itemRepository;

    @Autowired
    private FinancialTransactionRepository transactionRepository;

    @BeforeEach
    void setup() {
        fulfillmentAllocationRepository.deleteAll();
        fulfillmentRepository.deleteAll();
        attachmentRepository.deleteAll();
        itemRepository.deleteAll();
        transactionRepository.deleteAll();
        bankTransferRepository.deleteAll();
        repository.deleteAll();
    }

    @Test
    void shouldCreateBankAccount() throws Exception {
        CreateBankAccountRequest request = new CreateBankAccountRequest(
                "CHECKING",
                "MAIN",
                "Conta Principal",
                true,
                new BigDecimal("1500.50"),
                LocalDate.of(2024, 1, 10),
                "Banco XPTO",
                "0001",
                "12345-6"
        );

        mockMvc.perform(post("/bank-account")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Conta Principal"))
                .andExpect(jsonPath("$.accountType").value("CHECKING"))
                .andExpect(jsonPath("$.financialInstitution").value("Banco XPTO"))
                .andExpect(jsonPath("$.currentBalance").value(1500.50));
    }

    @Test
    void shouldReturnAllBankAccounts() throws Exception {
        BankAccount bankAccount = BankAccount.builder()
                .name("Conta A")
                .accountType("SAVINGS")
                .build();

        repository.save(bankAccount);

        mockMvc.perform(get("/bank-account"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Conta A"))
                .andExpect(jsonPath("$[0].currentBalance").value(0));
    }

    @Test
    void shouldUpdateBankAccount() throws Exception {
        BankAccount bankAccount = BankAccount.builder()
                .name("Conta Antiga")
                .accountType("CHECKING")
                .build();

        bankAccount = repository.save(bankAccount);

        UpdateBankAccountRequest request = new UpdateBankAccountRequest(
                "SAVINGS",
                "INVEST",
                "Conta Nova",
                false,
                null,
                null,
                "Banco Atualizado",
                "0002",
                "99999-9"
        );

        mockMvc.perform(put("/bank-account/{id}", bankAccount.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(bankAccount.getId()))
                .andExpect(jsonPath("$.name").value("Conta Nova"))
                .andExpect(jsonPath("$.accountType").value("SAVINGS"))
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.currentBalance").value(0));
    }

    @Test
    void shouldRejectChangingInitialBalanceAfterCreation() throws Exception {
        BankAccount bankAccount = repository.save(BankAccount.builder()
                .name("Conta Base")
                .initialBalance(BigDecimal.ZERO)
                .build());

        UpdateBankAccountRequest request = new UpdateBankAccountRequest(
                null,
                null,
                "Conta Base",
                true,
                new BigDecimal("1.00"),
                null,
                null,
                null,
                null
        );

        mockMvc.perform(put("/bank-account/{id}", bankAccount.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Initial bank balance cannot be changed after account creation."
                ));
    }

    @Test
    void shouldCreateBankAccountWithZeroInitialBalanceWhenRequestIsNull() throws Exception {
        CreateBankAccountRequest request = new CreateBankAccountRequest(
                null,
                null,
                "Conta Sem Saldo",
                true,
                null,
                null,
                null,
                null,
                null
        );

        mockMvc.perform(post("/bank-account")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.initialBalance").value(0))
                .andExpect(jsonPath("$.currentBalance").value(0));
    }

    @Test
    void shouldDeleteBankAccount() throws Exception {
        BankAccount bankAccount = BankAccount.builder()
                .name("Conta Excluir")
                .build();

        bankAccount = repository.save(bankAccount);

        mockMvc.perform(delete("/bank-account/{id}", bankAccount.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldRejectDeletingBankAccountWithTransfer() throws Exception {
        BankAccount source = repository.save(BankAccount.builder()
                .name("Conta Origem")
                .initialBalance(new BigDecimal("100.00"))
                .build());
        BankAccount destination = repository.save(BankAccount.builder()
                .name("Conta Destino")
                .initialBalance(BigDecimal.ZERO)
                .build());
        bankTransferRepository.save(BankTransfer.builder()
                .sourceBankAccount(source)
                .destinationBankAccount(destination)
                .amount(new BigDecimal("10.00"))
                .transferDate(LocalDate.of(2026, 7, 1))
                .build());

        mockMvc.perform(delete("/bank-account/{id}", source.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Bank account cannot be deleted because it has financial movements."
                ));
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingBankAccount() throws Exception {
        mockMvc.perform(delete("/bank-account/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("BankAccount not found: 999"));
    }
}

