package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.inventory.dto.baseUnit.CreateBaseUnitRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.baseUnit.UpdateBaseUnitRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.BaseUnit;
import com.sm3Agro.SM3AgroERP.inventory.repository.BaseUnitRepository;
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
class BaseUnitControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BaseUnitRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldCreateBaseUnit() throws Exception {
        CreateBaseUnitRequest request = new CreateBaseUnitRequest("Kg");

        mockMvc.perform(post("/base-unit")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Kg"));
    }

    @Test
    void shouldReturnAllBaseUnits() throws Exception {
        repository.save(BaseUnit.builder().name("L").build());

        mockMvc.perform(get("/base-unit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("L"));
    }

    @Test
    void shouldUpdateBaseUnit() throws Exception {
        BaseUnit entity = repository.save(BaseUnit.builder().name("MT").build());

        UpdateBaseUnitRequest request = new UpdateBaseUnitRequest("M2");

        mockMvc.perform(put("/base-unit/{id}", entity.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entity.getId()))
                .andExpect(jsonPath("$.name").value("M2"));
    }

    @Test
    void shouldDeleteBaseUnit() throws Exception {
        BaseUnit entity = repository.save(BaseUnit.builder().name("Excluir").build());

        mockMvc.perform(delete("/base-unit/{id}", entity.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingBaseUnit() throws Exception {
        mockMvc.perform(delete("/base-unit/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("BaseUnit not found: 999"));
    }
}
