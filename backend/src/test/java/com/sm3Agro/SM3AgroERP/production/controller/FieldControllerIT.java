package com.sm3Agro.SM3AgroERP.production.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.production.dto.field.CreateFieldRequest;
import com.sm3Agro.SM3AgroERP.production.dto.field.UpdateFieldRequest;
import com.sm3Agro.SM3AgroERP.production.entity.Field;
import com.sm3Agro.SM3AgroERP.production.repository.FieldRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

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
class FieldControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FieldRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldCreateField() throws Exception {
        CreateFieldRequest request = new CreateFieldRequest("Talhao 01", new BigDecimal("12.50"));

        mockMvc.perform(post("/field")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Talhao 01"))
                .andExpect(jsonPath("$.areaHectares").value(12.50));
    }

    @Test
    void shouldReturnAllFields() throws Exception {
        repository.save(Field.builder()
                .name("Talhao 02")
                .areaHectares(new BigDecimal("8.00"))
                .build());

        mockMvc.perform(get("/field"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Talhao 02"));
    }

    @Test
    void shouldUpdateField() throws Exception {
        Field entity = repository.save(Field.builder()
                .name("Talhao Antigo")
                .areaHectares(new BigDecimal("7.25"))
                .build());

        UpdateFieldRequest request = new UpdateFieldRequest("Talhao Novo", new BigDecimal("9.75"));

        mockMvc.perform(put("/field/{id}", entity.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entity.getId()))
                .andExpect(jsonPath("$.name").value("Talhao Novo"))
                .andExpect(jsonPath("$.areaHectares").value(9.75));
    }

    @Test
    void shouldDeleteField() throws Exception {
        Field entity = repository.save(Field.builder()
                .name("Excluir")
                .areaHectares(new BigDecimal("3.00"))
                .build());

        mockMvc.perform(delete("/field/{id}", entity.getId()))
                .andExpect(status().isNoContent());
    }
}
