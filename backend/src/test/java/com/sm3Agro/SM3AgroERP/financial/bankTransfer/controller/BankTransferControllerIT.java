package com.sm3Agro.SM3AgroERP.financial.bankTransfer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.bank.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.bank.repository.BankAccountRepository;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer.CreateBankTransferRequest;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer.UpdateBankTransferRequest;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.entity.BankTransfer;
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
class BankTransferControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BankTransferRepository repository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

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
        repository.deleteAll();
        bankAccountRepository.deleteAll();
    }

    @Test
    void shouldCreateBankTransfer() throws Exception {
        BankAccount source = createBankAccount("Conta Origem", "1000.00", "2026-07-01");
        BankAccount destination = createBankAccount("Conta Destino", "100.00", "2026-07-01");

        CreateBankTransferRequest request = new CreateBankTransferRequest(
                source.getId(),
                destination.getId(),
                new BigDecimal("350.75"),
                LocalDate.of(2026, 7, 5),
                "Transferencia operacional"
        );

        mockMvc.perform(post("/bank-transfers")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.sourceBankAccountId").value(source.getId()))
                .andExpect(jsonPath("$.destinationBankAccountId").value(destination.getId()))
                .andExpect(jsonPath("$.amount").value(350.75))
                .andExpect(jsonPath("$.transferDate").value("2026-07-05"))
                .andExpect(jsonPath("$.observation").value("Transferencia operacional"));
    }

    @Test
    void shouldReturnAllBankTransfers() throws Exception {
        BankAccount source = createBankAccount("Conta A", "1000.00", "2026-07-01");
        BankAccount destination = createBankAccount("Conta B", "100.00", "2026-07-01");

        repository.save(BankTransfer.builder()
                .sourceBankAccount(source)
                .destinationBankAccount(destination)
                .amount(new BigDecimal("120.00"))
                .transferDate(LocalDate.of(2026, 7, 4))
                .observation("Movimentacao interna")
                .build());

        mockMvc.perform(get("/bank-transfers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].sourceBankAccountId").value(source.getId()))
                .andExpect(jsonPath("$[0].destinationBankAccountId").value(destination.getId()))
                .andExpect(jsonPath("$[0].amount").value(120.00));
    }

    @Test
    void shouldUpdateBankTransfer() throws Exception {
        BankAccount source = createBankAccount("Conta Principal", "1000.00", "2026-07-01");
        BankAccount destination = createBankAccount("Conta Filial", "100.00", "2026-07-01");
        BankAccount newDestination = createBankAccount("Conta Investimentos", "150.00", "2026-07-01");

        BankTransfer bankTransfer = repository.save(BankTransfer.builder()
                .sourceBankAccount(source)
                .destinationBankAccount(destination)
                .amount(new BigDecimal("90.00"))
                .transferDate(LocalDate.of(2026, 7, 1))
                .observation("Original")
                .build());

        UpdateBankTransferRequest request = new UpdateBankTransferRequest(
                source.getId(),
                newDestination.getId(),
                new BigDecimal("145.20"),
                LocalDate.of(2026, 7, 6),
                "Ajuste de caixa"
        );

        mockMvc.perform(put("/bank-transfers/{id}", bankTransfer.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(bankTransfer.getId()))
                .andExpect(jsonPath("$.destinationBankAccountId").value(newDestination.getId()))
                .andExpect(jsonPath("$.amount").value(145.20))
                .andExpect(jsonPath("$.transferDate").value("2026-07-06"))
                .andExpect(jsonPath("$.observation").value("Ajuste de caixa"));
    }

    @Test
    void shouldDeleteBankTransfer() throws Exception {
        BankAccount source = createBankAccount("Conta Caixa", "500.00", "2026-07-01");
        BankAccount destination = createBankAccount("Conta Reserva", "50.00", "2026-07-01");

        BankTransfer bankTransfer = repository.save(BankTransfer.builder()
                .sourceBankAccount(source)
                .destinationBankAccount(destination)
                .amount(new BigDecimal("60.00"))
                .transferDate(LocalDate.of(2026, 7, 3))
                .build());

        mockMvc.perform(delete("/bank-transfers/{id}", bankTransfer.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnBadRequestWhenAccountsAreTheSame() throws Exception {
        BankAccount bankAccount = createBankAccount("Conta Unica", "500.00", "2026-07-01");

        CreateBankTransferRequest request = new CreateBankTransferRequest(
                bankAccount.getId(),
                bankAccount.getId(),
                new BigDecimal("10.00"),
                LocalDate.of(2026, 7, 5),
                "Invalida"
        );

        mockMvc.perform(post("/bank-transfers")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Source and destination bank accounts must be different."));
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingBankTransfer() throws Exception {
        mockMvc.perform(delete("/bank-transfers/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("BankTransfer not found: 999"));
    }

    @Test
    void shouldRejectTransferWhenSourceBalanceWouldBecomeNegative() throws Exception {
        BankAccount source = createBankAccount("Conta Operacional", "100.00", "2026-07-01");
        BankAccount destination = createBankAccount("Conta Reserva", "50.00", "2026-07-01");

        CreateBankTransferRequest request = new CreateBankTransferRequest(
                source.getId(),
                destination.getId(),
                new BigDecimal("150.00"),
                LocalDate.of(2026, 7, 5),
                "Sem saldo"
        );

        mockMvc.perform(post("/bank-transfers")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Transfer would make source bank account 'Conta Operacional' negative on 2026-07-05."
                ));
    }

    @Test
    void shouldRejectRetroactiveTransferThatBreaksFutureBalance() throws Exception {
        BankAccount source = createBankAccount("Conta Caixa", "100.00", "2026-07-01");
        BankAccount destination = createBankAccount("Conta Reserva", "0.00", "2026-07-01");

        repository.save(BankTransfer.builder()
                .sourceBankAccount(source)
                .destinationBankAccount(destination)
                .amount(new BigDecimal("100.00"))
                .transferDate(LocalDate.of(2026, 7, 10))
                .observation("Compromisso futuro")
                .build());

        CreateBankTransferRequest request = new CreateBankTransferRequest(
                source.getId(),
                destination.getId(),
                new BigDecimal("10.00"),
                LocalDate.of(2026, 7, 5),
                "Retroativa"
        );

        mockMvc.perform(post("/bank-transfers")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Transfer would make source bank account 'Conta Caixa' negative on 2026-07-10."
                ));
    }

    @Test
    void shouldRejectTransferBeforeInitialBalanceDate() throws Exception {
        BankAccount source = createBankAccount("Conta Base", "500.00", "2026-07-03");
        BankAccount destination = createBankAccount("Conta Destino", "50.00", "2026-07-01");

        CreateBankTransferRequest request = new CreateBankTransferRequest(
                source.getId(),
                destination.getId(),
                new BigDecimal("50.00"),
                LocalDate.of(2026, 7, 2),
                "Data invalida"
        );

        mockMvc.perform(post("/bank-transfers")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Source bank account 'Conta Base' cannot receive movements before its initial balance date (2026-07-03)."
                ));
    }

    private BankAccount createBankAccount(String name, String initialBalance, String initialBalanceDate) {
        return bankAccountRepository.save(BankAccount.builder()
                .name(name)
                .active(true)
                .initialBalance(new BigDecimal(initialBalance))
                .initialBalanceDate(LocalDate.parse(initialBalanceDate))
                .build());
    }
}
