package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.inventory.dto.adjustmentRootCause.CreateAdjustmentRootCauseRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.adjustmentRootCause.UpdateAdjustmentRootCauseRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.AdjustmentRootCause;
import com.sm3Agro.SM3AgroERP.inventory.repository.AdjustmentRootCauseRepository;
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
class AdjustmentRootCauseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdjustmentRootCauseRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldCreateAdjustmentRootCause() throws Exception {
        CreateAdjustmentRootCauseRequest request = new CreateAdjustmentRootCauseRequest("Inventario");

        mockMvc.perform(post("/adjustment-root-cause")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Inventario"));
    }

    @Test
    void shouldReturnAllAdjustmentRootCauses() throws Exception {
        repository.save(AdjustmentRootCause.builder().name("Perda").build());

        mockMvc.perform(get("/adjustment-root-cause"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Perda"));
    }

    @Test
    void shouldUpdateAdjustmentRootCause() throws Exception {
        AdjustmentRootCause entity = repository.save(
                AdjustmentRootCause.builder().name("Antigo").build()
        );

        UpdateAdjustmentRootCauseRequest request = new UpdateAdjustmentRootCauseRequest("Novo");

        mockMvc.perform(put("/adjustment-root-cause/{id}", entity.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entity.getId()))
                .andExpect(jsonPath("$.name").value("Novo"));
    }

    @Test
    void shouldDeleteAdjustmentRootCause() throws Exception {
        AdjustmentRootCause entity = repository.save(
                AdjustmentRootCause.builder().name("Excluir").build()
        );

        mockMvc.perform(delete("/adjustment-root-cause/{id}", entity.getId()))
                .andExpect(status().isNoContent());
    }
}
