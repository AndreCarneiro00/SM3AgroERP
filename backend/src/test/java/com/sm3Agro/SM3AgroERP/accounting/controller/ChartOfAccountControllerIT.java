package com.sm3Agro.SM3AgroERP.accounting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.accounting.dto.chartOfAccount.CreateChartOfAccountRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.chartOfAccount.UpdateChartOfAccountRequest;
import com.sm3Agro.SM3AgroERP.accounting.entity.ChartOfAccount;
import com.sm3Agro.SM3AgroERP.accounting.enums.ChartOfAccountType;
import com.sm3Agro.SM3AgroERP.accounting.repository.ChartOfAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

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
class ChartOfAccountControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ChartOfAccountRepository chartOfAccountRepository;

    @BeforeEach
    void setup() {
        chartOfAccountRepository.deleteAll();
    }

    @Test
    void shouldCreateChartOfAccount() throws Exception {
        CreateChartOfAccountRequest request = new CreateChartOfAccountRequest(
                "Receita de Vendas",
                null,
                ChartOfAccountType.INCOME,
                true,
                true,
                "1.01"
        );

        mockMvc.perform(post("/chart-of-account")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Receita de Vendas"))
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.acceptsTransaction").value(true))
                .andExpect(jsonPath("$.code").value("1.01"));
    }

    @Test
    void shouldReturnAllChartOfAccounts() throws Exception {
        chartOfAccountRepository.save(ChartOfAccount.builder()
                .name("Despesa Operacional")
                .type(ChartOfAccountType.EXPENSE)
                .acceptsTransaction(true)
                .active(true)
                .code("2.01")
                .build());

        mockMvc.perform(get("/chart-of-account"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Despesa Operacional"));
    }

    @Test
    void shouldUpdateChartOfAccount() throws Exception {
        ChartOfAccount parent = chartOfAccountRepository.save(ChartOfAccount.builder()
                .name("Receitas")
                .type(ChartOfAccountType.INCOME)
                .acceptsTransaction(false)
                .active(true)
                .code("1")
                .build());
        ChartOfAccount chartOfAccount = chartOfAccountRepository.save(ChartOfAccount.builder()
                .name("Conta Antiga")
                .type(ChartOfAccountType.MANAGERIAL)
                .acceptsTransaction(false)
                .active(true)
                .code("9.01")
                .build());

        UpdateChartOfAccountRequest request = new UpdateChartOfAccountRequest(
                "Conta Nova",
                parent.getId(),
                ChartOfAccountType.INCOME,
                true,
                false,
                "1.02"
        );

        mockMvc.perform(put("/chart-of-account/{id}", chartOfAccount.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(chartOfAccount.getId()))
                .andExpect(jsonPath("$.name").value("Conta Nova"))
                .andExpect(jsonPath("$.parentId").value(parent.getId()))
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldDeleteChartOfAccount() throws Exception {
        ChartOfAccount chartOfAccount = chartOfAccountRepository.save(ChartOfAccount.builder()
                .name("Excluir")
                .type(ChartOfAccountType.EXPENSE)
                .acceptsTransaction(true)
                .active(true)
                .build());

        mockMvc.perform(delete("/chart-of-account/{id}", chartOfAccount.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnBadRequestForInvalidChartOfAccountType() throws Exception {
        String payload = """
                {
                    "name": "Conta",
                    "type": "INVALID_TYPE",
                    "acceptsTransaction": true,
                    "active": true
                }
                """;

        mockMvc.perform(post("/chart-of-account")
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }
}
