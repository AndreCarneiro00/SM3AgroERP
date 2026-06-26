package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure.CreateUnitOfMeasureRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure.UpdateUnitOfMeasureRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.BaseUnit;
import com.sm3Agro.SM3AgroERP.inventory.entity.UnitOfMeasure;
import com.sm3Agro.SM3AgroERP.inventory.repository.BaseUnitRepository;
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
class UnitOfMeasureControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UnitOfMeasureRepository unitOfMeasureRepository;

    @Autowired
    private BaseUnitRepository baseUnitRepository;

    @BeforeEach
    void setup() {
        unitOfMeasureRepository.deleteAll();
        baseUnitRepository.deleteAll();
    }

    @Test
    void shouldCreateUnitOfMeasure() throws Exception {
        BaseUnit baseUnit = baseUnitRepository.save(BaseUnit.builder().name("Peso").build());
        CreateUnitOfMeasureRequest request = new CreateUnitOfMeasureRequest(
                "Kg",
                baseUnit.getId(),
                new BigDecimal("1.0000")
        );

        mockMvc.perform(post("/unit-of-measure")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Kg"))
                .andExpect(jsonPath("$.baseUnitId").value(baseUnit.getId()))
                .andExpect(jsonPath("$.baseUnitName").value("Peso"))
                .andExpect(jsonPath("$.conversionFactor").value(1.0000));
    }

    @Test
    void shouldReturnAllUnitsOfMeasure() throws Exception {
        BaseUnit baseUnit = baseUnitRepository.save(BaseUnit.builder().name("Volume").build());
        unitOfMeasureRepository.save(UnitOfMeasure.builder()
                .name("Litro")
                .baseUnit(baseUnit)
                .conversionFactor(new BigDecimal("1.0000"))
                .build());

        mockMvc.perform(get("/unit-of-measure"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Litro"))
                .andExpect(jsonPath("$[0].baseUnitName").value("Volume"));
    }

    @Test
    void shouldUpdateUnitOfMeasure() throws Exception {
        BaseUnit oldBaseUnit = baseUnitRepository.save(BaseUnit.builder().name("Peso").build());
        BaseUnit newBaseUnit = baseUnitRepository.save(BaseUnit.builder().name("Area").build());
        UnitOfMeasure entity = unitOfMeasureRepository.save(UnitOfMeasure.builder()
                .name("Kg")
                .baseUnit(oldBaseUnit)
                .conversionFactor(new BigDecimal("1.0000"))
                .build());

        UpdateUnitOfMeasureRequest request = new UpdateUnitOfMeasureRequest(
                "Metro Quadrado",
                newBaseUnit.getId(),
                new BigDecimal("2.5000")
        );

        mockMvc.perform(put("/unit-of-measure/{id}", entity.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entity.getId()))
                .andExpect(jsonPath("$.name").value("Metro Quadrado"))
                .andExpect(jsonPath("$.baseUnitId").value(newBaseUnit.getId()))
                .andExpect(jsonPath("$.baseUnitName").value("Area"))
                .andExpect(jsonPath("$.conversionFactor").value(2.5000));
    }

    @Test
    void shouldDeleteUnitOfMeasure() throws Exception {
        BaseUnit baseUnit = baseUnitRepository.save(BaseUnit.builder().name("Peso").build());
        UnitOfMeasure entity = unitOfMeasureRepository.save(UnitOfMeasure.builder()
                .name("Kg")
                .baseUnit(baseUnit)
                .conversionFactor(BigDecimal.ONE)
                .build());

        mockMvc.perform(delete("/unit-of-measure/{id}", entity.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingUnitOfMeasure() throws Exception {
        mockMvc.perform(delete("/unit-of-measure/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("UnitOfMeasure not found: 999"));
    }

    @Test
    void shouldReturnBadRequestWhenCreatingUnitOfMeasureWithInvalidConversionFactor() throws Exception {
        BaseUnit baseUnit = baseUnitRepository.save(BaseUnit.builder().name("Peso").build());
        CreateUnitOfMeasureRequest request = new CreateUnitOfMeasureRequest(
                "Kg",
                baseUnit.getId(),
                BigDecimal.ZERO
        );

        mockMvc.perform(post("/unit-of-measure")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("conversionFactor must be greater than zero"));
    }
}
