package com.sm3Agro.SM3AgroERP.financial.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.financial.dto.documentType.CreateDocumentTypeRequest;
import com.sm3Agro.SM3AgroERP.financial.dto.documentType.UpdateDocumentTypeRequest;
import com.sm3Agro.SM3AgroERP.financial.entity.DocumentType;
import com.sm3Agro.SM3AgroERP.financial.repository.DocumentTypeRepository;
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
class DocumentTypeControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DocumentTypeRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldCreateDocumentType() throws Exception {
        CreateDocumentTypeRequest request = new CreateDocumentTypeRequest("Contrato");

        mockMvc.perform(post("/document-type")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Contrato"));
    }

    @Test
    void shouldReturnAllDocumentTypes() throws Exception {
        repository.save(DocumentType.builder().name("Nota").build());

        mockMvc.perform(get("/document-type"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Nota"));
    }

    @Test
    void shouldUpdateDocumentType() throws Exception {
        DocumentType entity = repository.save(DocumentType.builder().name("NF").build());

        UpdateDocumentTypeRequest request = new UpdateDocumentTypeRequest("Boleto");

        mockMvc.perform(put("/document-type/{id}", entity.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entity.getId()))
                .andExpect(jsonPath("$.name").value("Boleto"));
    }

    @Test
    void shouldDeleteDocumentType() throws Exception {
        DocumentType entity = repository.save(DocumentType.builder().name("Excluir").build());

        mockMvc.perform(delete("/document-type/{id}", entity.getId()))
                .andExpect(status().isNoContent());
    }
}
