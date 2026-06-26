package com.sm3Agro.SM3AgroERP.financial.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.financial.dto.incomeStatementGroup.CreateIncomeStatementGroupRequest;
import com.sm3Agro.SM3AgroERP.financial.dto.incomeStatementGroup.UpdateIncomeStatementGroupRequest;
import com.sm3Agro.SM3AgroERP.financial.entity.IncomeStatementGroup;
import com.sm3Agro.SM3AgroERP.financial.repository.IncomeStatementGroupRepository;
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
class IncomeStatementGroupControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IncomeStatementGroupRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldCreateIncomeStatementGroup() throws Exception {
        CreateIncomeStatementGroupRequest request =
                new CreateIncomeStatementGroupRequest("Receitas", 1);

        mockMvc.perform(post("/income-statement-group")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Receitas"))
                .andExpect(jsonPath("$.displayOrder").value(1));
    }

    @Test
    void shouldReturnAllIncomeStatementGroups() throws Exception {
        repository.save(IncomeStatementGroup.builder()
                .name("Custos")
                .displayOrder(2)
                .build());

        mockMvc.perform(get("/income-statement-group"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Custos"));
    }

    @Test
    void shouldUpdateIncomeStatementGroup() throws Exception {
        IncomeStatementGroup entity = repository.save(IncomeStatementGroup.builder()
                .name("Grupo A")
                .displayOrder(3)
                .build());

        UpdateIncomeStatementGroupRequest request =
                new UpdateIncomeStatementGroupRequest("Grupo B", 4);

        mockMvc.perform(put("/income-statement-group/{id}", entity.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entity.getId()))
                .andExpect(jsonPath("$.name").value("Grupo B"))
                .andExpect(jsonPath("$.displayOrder").value(4));
    }

    @Test
    void shouldDeleteIncomeStatementGroup() throws Exception {
        IncomeStatementGroup entity = repository.save(IncomeStatementGroup.builder()
                .name("Excluir")
                .build());

        mockMvc.perform(delete("/income-statement-group/{id}", entity.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingIncomeStatementGroup() throws Exception {
        mockMvc.perform(delete("/income-statement-group/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("IncomeStatementGroup not found: 999"));
    }
}
