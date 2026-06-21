package com.sm3Agro.SM3AgroERP.counterparty.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType.CreateCounterpartyTypeRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType.UpdateCounterpartyTypeRequest;
import com.sm3Agro.SM3AgroERP.counterparty.entity.CounterpartyType;
import com.sm3Agro.SM3AgroERP.counterparty.repository.CounterpartyTypeRepository;
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
class CounterpartyTypeControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CounterpartyTypeRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldCreateCounterpartyType() throws Exception {
        CreateCounterpartyTypeRequest request = new CreateCounterpartyTypeRequest(
                "Fornecedor",
                "Parceiros fornecedores",
                true
        );

        mockMvc.perform(post("/counterparty-type")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Fornecedor"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldReturnAllCounterpartyTypes() throws Exception {
        CounterpartyType entity = CounterpartyType.builder()
                .name("Cliente")
                .description("Varejo")
                .build();

        repository.save(entity);

        mockMvc.perform(get("/counterparty-type"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Cliente"));
    }

    @Test
    void shouldUpdateCounterpartyType() throws Exception {
        CounterpartyType entity = CounterpartyType.builder()
                .name("Antigo")
                .description("Desc antiga")
                .active(true)
                .build();

        entity = repository.save(entity);

        UpdateCounterpartyTypeRequest request = new UpdateCounterpartyTypeRequest(
                "Novo",
                "Nova descricao",
                false
        );

        mockMvc.perform(put("/counterparty-type/{id}", entity.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entity.getId()))
                .andExpect(jsonPath("$.name").value("Novo"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldDeleteCounterpartyType() throws Exception {
        CounterpartyType entity = CounterpartyType.builder()
                .name("Excluir")
                .build();

        entity = repository.save(entity);

        mockMvc.perform(delete("/counterparty-type/{id}", entity.getId()))
                .andExpect(status().isNoContent());
    }
}
