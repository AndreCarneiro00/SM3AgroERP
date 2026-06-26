package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.inventory.dto.product.CreateProductRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.product.UpdateProductRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.BaseUnit;
import com.sm3Agro.SM3AgroERP.inventory.entity.Product;
import com.sm3Agro.SM3AgroERP.inventory.entity.ProductFamily;
import com.sm3Agro.SM3AgroERP.inventory.entity.UnitOfMeasure;
import com.sm3Agro.SM3AgroERP.inventory.enums.ProductType;
import com.sm3Agro.SM3AgroERP.inventory.repository.BaseUnitRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductFamilyRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.UnitOfMeasureRepository;
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
class ProductControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductFamilyRepository productFamilyRepository;

    @Autowired
    private UnitOfMeasureRepository unitOfMeasureRepository;

    @Autowired
    private BaseUnitRepository baseUnitRepository;

    @BeforeEach
    void setup() {
        productRepository.deleteAll();
        productFamilyRepository.deleteAll();
        unitOfMeasureRepository.deleteAll();
        baseUnitRepository.deleteAll();
    }

    @Test
    void shouldCreateProduct() throws Exception {
        BaseUnit baseUnit = baseUnitRepository.save(BaseUnit.builder().name("Peso").build());
        UnitOfMeasure unit = unitOfMeasureRepository.save(UnitOfMeasure.builder()
                .name("Kg")
                .baseUnit(baseUnit)
                .conversionFactor(BigDecimal.ONE)
                .build());
        ProductFamily family = productFamilyRepository.save(ProductFamily.builder().name("Feno").build());

        CreateProductRequest request = new CreateProductRequest(
                "Feno Premium",
                unit.getId(),
                family.getId(),
                ProductType.FINISHED_GOOD,
                true
        );

        mockMvc.perform(post("/product")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Feno Premium"))
                .andExpect(jsonPath("$.unitId").value(unit.getId()))
                .andExpect(jsonPath("$.unitName").value("Kg"))
                .andExpect(jsonPath("$.productFamilyId").value(family.getId()))
                .andExpect(jsonPath("$.productFamilyName").value("Feno"))
                .andExpect(jsonPath("$.productType").value("FINISHED_GOOD"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldReturnAllProducts() throws Exception {
        BaseUnit baseUnit = baseUnitRepository.save(BaseUnit.builder().name("Peso").build());
        UnitOfMeasure unit = unitOfMeasureRepository.save(UnitOfMeasure.builder()
                .name("Kg")
                .baseUnit(baseUnit)
                .conversionFactor(BigDecimal.ONE)
                .build());

        productRepository.save(Product.builder()
                .name("Adubo")
                .unit(unit)
                .productType(ProductType.CONSUMABLE)
                .active(true)
                .build());

        mockMvc.perform(get("/product"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Adubo"))
                .andExpect(jsonPath("$[0].unitName").value("Kg"));
    }

    @Test
    void shouldUpdateProduct() throws Exception {
        BaseUnit baseUnit = baseUnitRepository.save(BaseUnit.builder().name("Peso").build());
        UnitOfMeasure oldUnit = unitOfMeasureRepository.save(UnitOfMeasure.builder()
                .name("Kg")
                .baseUnit(baseUnit)
                .conversionFactor(BigDecimal.ONE)
                .build());
        UnitOfMeasure newUnit = unitOfMeasureRepository.save(UnitOfMeasure.builder()
                .name("Ton")
                .baseUnit(baseUnit)
                .conversionFactor(new BigDecimal("1000"))
                .build());
        ProductFamily family = productFamilyRepository.save(ProductFamily.builder().name("Feno").build());

        Product product = productRepository.save(Product.builder()
                .name("Produto Antigo")
                .unit(oldUnit)
                .productType(ProductType.RAW_MATERIAL)
                .active(true)
                .build());

        UpdateProductRequest request = new UpdateProductRequest(
                "Produto Novo",
                newUnit.getId(),
                family.getId(),
                ProductType.FINISHED_GOOD,
                false
        );

        mockMvc.perform(put("/product/{id}", product.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(product.getId()))
                .andExpect(jsonPath("$.name").value("Produto Novo"))
                .andExpect(jsonPath("$.unitName").value("Ton"))
                .andExpect(jsonPath("$.productFamilyName").value("Feno"))
                .andExpect(jsonPath("$.productType").value("FINISHED_GOOD"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldDeleteProduct() throws Exception {
        BaseUnit baseUnit = baseUnitRepository.save(BaseUnit.builder().name("Peso").build());
        UnitOfMeasure unit = unitOfMeasureRepository.save(UnitOfMeasure.builder()
                .name("Kg")
                .baseUnit(baseUnit)
                .conversionFactor(BigDecimal.ONE)
                .build());

        Product product = productRepository.save(Product.builder()
                .name("Excluir")
                .unit(unit)
                .productType(ProductType.CONSUMABLE)
                .active(true)
                .build());

        mockMvc.perform(delete("/product/{id}", product.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingProduct() throws Exception {
        mockMvc.perform(delete("/product/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Product not found: 999"));
    }

    @Test
    void shouldReturnBadRequestForInvalidProductType() throws Exception {
        String payload = """
                {
                    "name": "Produto",
                    "unitId": 1,
                    "productType": "INVALID_TYPE",
                    "active": true
                }
                """;

        mockMvc.perform(post("/product")
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }
}
