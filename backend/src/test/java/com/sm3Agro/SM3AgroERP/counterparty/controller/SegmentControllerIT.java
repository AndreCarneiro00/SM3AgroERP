package com.sm3Agro.SM3AgroERP.counterparty.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.counterparty.dto.segment.CreateSegmentRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.segment.UpdateSegmentRequest;
import com.sm3Agro.SM3AgroERP.counterparty.entity.Segment;
import com.sm3Agro.SM3AgroERP.counterparty.repository.SegmentRepository;
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
class SegmentControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SegmentRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldCreateSegment() throws Exception {
        CreateSegmentRequest request = new CreateSegmentRequest("Atacado");

        mockMvc.perform(post("/segment")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Atacado"));
    }

    @Test
    void shouldReturnAllSegments() throws Exception {
        repository.save(Segment.builder().name("Exportacao").build());

        mockMvc.perform(get("/segment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Exportacao"));
    }

    @Test
    void shouldUpdateSegment() throws Exception {
        Segment entity = repository.save(Segment.builder().name("Sul").build());

        UpdateSegmentRequest request = new UpdateSegmentRequest("Sudeste");

        mockMvc.perform(put("/segment/{id}", entity.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entity.getId()))
                .andExpect(jsonPath("$.name").value("Sudeste"));
    }

    @Test
    void shouldDeleteSegment() throws Exception {
        Segment entity = repository.save(Segment.builder().name("Excluir").build());

        mockMvc.perform(delete("/segment/{id}", entity.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingSegment() throws Exception {
        mockMvc.perform(delete("/segment/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Segment not found: 999"));
    }
}
