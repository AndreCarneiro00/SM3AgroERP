package com.sm3Agro.SM3AgroERP.masterData.incomeStatementRelationship.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.entity.ChartOfAccount;
import com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.enums.ChartOfAccountType;
import com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.repository.ChartOfAccountRepository;
import com.sm3Agro.SM3AgroERP.masterData.incomeStatementRelationship.dto.CreateIncomeStatementRelationshipRequest;
import com.sm3Agro.SM3AgroERP.masterData.incomeStatementRelationship.dto.UpdateIncomeStatementRelationshipRequest;
import com.sm3Agro.SM3AgroERP.masterData.incomeStatementGroup.entity.IncomeStatementGroup;
import com.sm3Agro.SM3AgroERP.masterData.incomeStatementRelationship.entity.IncomeStatementRelationship;
import com.sm3Agro.SM3AgroERP.masterData.incomeStatementGroup.repository.IncomeStatementGroupRepository;
import com.sm3Agro.SM3AgroERP.masterData.incomeStatementRelationship.repository.IncomeStatementRelationshipRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

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
@Transactional
class IncomeStatementRelationshipControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IncomeStatementRelationshipRepository relationshipRepository;

    @Autowired
    private IncomeStatementGroupRepository incomeStatementGroupRepository;

    @Autowired
    private ChartOfAccountRepository chartOfAccountRepository;

    @BeforeEach
    void setup() {
        relationshipRepository.deleteAll();
        incomeStatementGroupRepository.deleteAll();
        chartOfAccountRepository.deleteAll();
    }

    @Test
    void shouldCreateIncomeStatementRelationship() throws Exception {
        ChartOfAccount chartOfAccount = createChartOfAccount("Expenses 1", "EXP-01");
        IncomeStatementGroup group = createIncomeStatementGroup("Operational Expenses", 1);

        CreateIncomeStatementRelationshipRequest request = new CreateIncomeStatementRelationshipRequest(
                chartOfAccount.getId(),
                group.getId()
        );

        mockMvc.perform(post("/income-statement-relationships")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.chartOfAccountId").value(chartOfAccount.getId()))
                .andExpect(jsonPath("$.incomeStatementGroupId").value(group.getId()));
    }

    @Test
    void shouldReturnAllIncomeStatementRelationships() throws Exception {
        ChartOfAccount chartOfAccount = createChartOfAccount("Expenses 1", "EXP-01");
        IncomeStatementGroup group = createIncomeStatementGroup("Operational Expenses", 1);

        relationshipRepository.save(
                IncomeStatementRelationship.builder()
                        .chartOfAccount(chartOfAccount)
                        .incomeStatementGroup(group)
                        .build()
        );

        mockMvc.perform(get("/income-statement-relationships"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].chartOfAccountId").value(chartOfAccount.getId()))
                .andExpect(jsonPath("$[0].incomeStatementGroupId").value(group.getId()));
    }

    @Test
    void shouldUpdateIncomeStatementRelationship() throws Exception {
        ChartOfAccount originalChart = createChartOfAccount("Expenses 1", "EXP-01");
        IncomeStatementGroup originalGroup = createIncomeStatementGroup("Operational Expenses", 1);

        IncomeStatementRelationship relationship = relationshipRepository.save(
                IncomeStatementRelationship.builder()
                        .chartOfAccount(originalChart)
                        .incomeStatementGroup(originalGroup)
                        .build()
        );

        ChartOfAccount newChart = createChartOfAccount("Expenses 2", "EXP-02");
        IncomeStatementGroup newGroup = createIncomeStatementGroup("Administrative Expenses", 2);

        UpdateIncomeStatementRelationshipRequest request = new UpdateIncomeStatementRelationshipRequest(
                newChart.getId(),
                newGroup.getId()
        );

        mockMvc.perform(put("/income-statement-relationships/{id}", relationship.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(relationship.getId()))
                .andExpect(jsonPath("$.chartOfAccountId").value(newChart.getId()))
                .andExpect(jsonPath("$.incomeStatementGroupId").value(newGroup.getId()));
    }

    @Test
    void shouldDeleteIncomeStatementRelationship() throws Exception {
        ChartOfAccount chartOfAccount = createChartOfAccount("Expenses 1", "EXP-01");
        IncomeStatementGroup group = createIncomeStatementGroup("Operational Expenses", 1);

        IncomeStatementRelationship relationship = relationshipRepository.save(
                IncomeStatementRelationship.builder()
                        .chartOfAccount(chartOfAccount)
                        .incomeStatementGroup(group)
                        .build()
        );

        mockMvc.perform(delete("/income-statement-relationships/{id}", relationship.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingIncomeStatementRelationship() throws Exception {
        mockMvc.perform(delete("/income-statement-relationships/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("IncomeStatementRelationship not found: 999"));
    }

    private ChartOfAccount createChartOfAccount(String name, String code) {
        return chartOfAccountRepository.save(
                ChartOfAccount.builder()
                        .name(name)
                        .type(ChartOfAccountType.EXPENSE)
                        .acceptsTransaction(true)
                        .active(true)
                        .code(code)
                        .build()
        );
    }

    private IncomeStatementGroup createIncomeStatementGroup(String name, Integer displayOrder) {
        return incomeStatementGroupRepository.save(
                IncomeStatementGroup.builder()
                        .name(name)
                        .displayOrder(displayOrder)
                        .build()
        );
    }
}

