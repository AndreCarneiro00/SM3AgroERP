package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.inventory.dto.productFamily.CreateProductFamilyRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.productFamily.UpdateProductFamilyRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.ProductFamily;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductFamilyRepository;
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
class ProductFamilyControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductFamilyRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldCreateProductFamily() throws Exception {
        CreateProductFamilyRequest request = new CreateProductFamilyRequest("Cana");

        mockMvc.perform(post("/product-family")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Cana"));
    }

    @Test
    void shouldReturnAllProductFamilies() throws Exception {
        repository.save(ProductFamily.builder().name("Graos").build());

        mockMvc.perform(get("/product-family"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Graos"));
    }

    @Test
    void shouldUpdateProductFamily() throws Exception {
        ProductFamily entity = repository.save(ProductFamily.builder().name("Antiga").build());

        UpdateProductFamilyRequest request = new UpdateProductFamilyRequest("Nova");

        mockMvc.perform(put("/product-family/{id}", entity.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entity.getId()))
                .andExpect(jsonPath("$.name").value("Nova"));
    }

    @Test
    void shouldDeleteProductFamily() throws Exception {
        ProductFamily entity = repository.save(ProductFamily.builder().name("Excluir").build());

        mockMvc.perform(delete("/product-family/{id}", entity.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingProductFamily() throws Exception {
        mockMvc.perform(delete("/product-family/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("ProductFamily not found: 999"));
    }
}
