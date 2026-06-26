package com.sm3Agro.SM3AgroERP.counterparty.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty.CreateCounterpartyRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty.UpdateCounterpartyRequest;
import com.sm3Agro.SM3AgroERP.counterparty.entity.Counterparty;
import com.sm3Agro.SM3AgroERP.counterparty.entity.CounterpartyType;
import com.sm3Agro.SM3AgroERP.counterparty.entity.Segment;
import com.sm3Agro.SM3AgroERP.counterparty.enums.CounterpartyDocumentType;
import com.sm3Agro.SM3AgroERP.counterparty.repository.CounterpartyRepository;
import com.sm3Agro.SM3AgroERP.counterparty.repository.CounterpartyTypeRepository;
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
class CounterpartyControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CounterpartyRepository counterpartyRepository;

    @Autowired
    private CounterpartyTypeRepository counterpartyTypeRepository;

    @Autowired
    private SegmentRepository segmentRepository;

    @BeforeEach
    void setup() {
        counterpartyRepository.deleteAll();
        counterpartyTypeRepository.deleteAll();
        segmentRepository.deleteAll();
    }

    @Test
    void shouldCreateCounterparty() throws Exception {
        CounterpartyType counterpartyType = counterpartyTypeRepository.save(
                CounterpartyType.builder().name("Fornecedor").description("Fornecedor local").active(true).build()
        );
        Segment segment = segmentRepository.save(Segment.builder().name("Insumos").build());

        CreateCounterpartyRequest request = new CreateCounterpartyRequest(
                counterpartyType.getId(),
                "Agro Insumos Ltda",
                "Agro Insumos",
                "Ribeirao Preto",
                "SP",
                "16999999999",
                "contato@agro.com",
                "12345678000190",
                CounterpartyDocumentType.CNPJ,
                segment.getId(),
                true
        );

        mockMvc.perform(post("/counterparty")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.legalName").value("Agro Insumos Ltda"))
                .andExpect(jsonPath("$.counterpartyTypeId").value(counterpartyType.getId()))
                .andExpect(jsonPath("$.counterpartyTypeName").value("Fornecedor"))
                .andExpect(jsonPath("$.segmentId").value(segment.getId()))
                .andExpect(jsonPath("$.segmentName").value("Insumos"))
                .andExpect(jsonPath("$.documentType").value("CNPJ"));
    }

    @Test
    void shouldReturnAllCounterparties() throws Exception {
        counterpartyRepository.save(Counterparty.builder()
                .legalName("Cliente Teste")
                .documentType(CounterpartyDocumentType.CPF)
                .active(true)
                .build());

        mockMvc.perform(get("/counterparty"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].legalName").value("Cliente Teste"));
    }

    @Test
    void shouldUpdateCounterparty() throws Exception {
        CounterpartyType counterpartyType = counterpartyTypeRepository.save(
                CounterpartyType.builder().name("Cliente").description("Comprador").active(true).build()
        );
        Segment segment = segmentRepository.save(Segment.builder().name("Comercial").build());
        Counterparty counterparty = counterpartyRepository.save(Counterparty.builder()
                .legalName("Nome Antigo")
                .active(true)
                .build());

        UpdateCounterpartyRequest request = new UpdateCounterpartyRequest(
                counterpartyType.getId(),
                "Nome Novo",
                "Fantasia Nova",
                "Uberaba",
                "MG",
                "3433333333",
                "novo@cliente.com",
                "12345678901",
                CounterpartyDocumentType.CPF,
                segment.getId(),
                false
        );

        mockMvc.perform(put("/counterparty/{id}", counterparty.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(counterparty.getId()))
                .andExpect(jsonPath("$.legalName").value("Nome Novo"))
                .andExpect(jsonPath("$.counterpartyTypeName").value("Cliente"))
                .andExpect(jsonPath("$.segmentName").value("Comercial"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldDeleteCounterparty() throws Exception {
        Counterparty counterparty = counterpartyRepository.save(Counterparty.builder()
                .legalName("Excluir")
                .active(true)
                .build());

        mockMvc.perform(delete("/counterparty/{id}", counterparty.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingCounterparty() throws Exception {
        mockMvc.perform(delete("/counterparty/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Counterparty not found: 999"));
    }

    @Test
    void shouldReturnBadRequestForInvalidDocumentType() throws Exception {
        String payload = """
                {
                    "legalName": "Teste",
                    "documentType": "INVALID_DOCUMENT",
                    "active": true
                }
                """;

        mockMvc.perform(post("/counterparty")
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }
}
