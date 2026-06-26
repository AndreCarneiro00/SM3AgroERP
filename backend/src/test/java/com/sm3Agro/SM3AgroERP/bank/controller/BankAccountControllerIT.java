package com.sm3Agro.SM3AgroERP.bank.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.bank.dto.bankAccount.CreateBankAccountRequest;
import com.sm3Agro.SM3AgroERP.bank.dto.bankAccount.UpdateBankAccountRequest;
import com.sm3Agro.SM3AgroERP.bank.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.bank.repository.BankAccountRepository;
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

    @BeforeEach
    void setup() {
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
                .andExpect(jsonPath("$.financialInstitution").value("Banco XPTO"));
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
                .andExpect(jsonPath("$[0].name").value("Conta A"));
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
                new BigDecimal("900.00"),
                LocalDate.of(2024, 2, 5),
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
                .andExpect(jsonPath("$.active").value(false));
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
    void shouldReturnNotFoundWhenDeletingMissingBankAccount() throws Exception {
        mockMvc.perform(delete("/bank-account/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("BankAccount not found: 999"));
    }
}
