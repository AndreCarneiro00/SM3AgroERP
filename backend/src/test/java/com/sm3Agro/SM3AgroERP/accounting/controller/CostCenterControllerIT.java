package com.sm3Agro.SM3AgroERP.accounting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.CreateCostCenterRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.UpdateCostCenterRequest;
import com.sm3Agro.SM3AgroERP.accounting.entity.ActivityGroup;
import com.sm3Agro.SM3AgroERP.accounting.entity.CostCenter;
import com.sm3Agro.SM3AgroERP.accounting.enums.CostCenterType;
import com.sm3Agro.SM3AgroERP.accounting.repository.ActivityGroupRepository;
import com.sm3Agro.SM3AgroERP.accounting.repository.CostCenterRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CostCenterControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CostCenterRepository costCenterRepository;

    @Autowired
    private ActivityGroupRepository activityGroupRepository;

    @BeforeEach
    void setup() {
        activityGroupRepository.deleteAll();
        costCenterRepository.deleteAll();
    }

    @Test
    void shouldCreateCostCenter() throws Exception {

        ActivityGroup group = new ActivityGroup();
        group.setName("Operations");

        group = activityGroupRepository.save(group);

        CreateCostCenterRequest request =
                new CreateCostCenterRequest(
                        "Farm Cost Center",
                        "Farm expenses",
                        CostCenterType.OPEX,
                        true,
                        true,
                        null,
                        group.getId(),
                        "CC001"
                );

        mockMvc.perform(post("/cost-center")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Farm Cost Center"))
                .andExpect(jsonPath("$.type").value("OPEX"))
                .andExpect(jsonPath("$.activityGroupId").value(group.getId()));
    }

    @Test
    void shouldReturnAllCostCenters() throws Exception {

        ActivityGroup group = new ActivityGroup();
        group.setName("Operations");

        group = activityGroupRepository.save(group);

        CostCenter costCenter = new CostCenter();
        costCenter.setName("Center A");
        costCenter.setActivityGroup(group);

        costCenterRepository.save(costCenter);

        mockMvc.perform(get("/cost-center"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Center A"));
    }

    @Test
    void shouldUpdateCostCenter() throws Exception {

        ActivityGroup group = new ActivityGroup();
        group.setName("Operations");

        group = activityGroupRepository.save(group);

        CostCenter costCenter = new CostCenter();
        costCenter.setName("Old Name");
        costCenter.setActivityGroup(group);

        costCenter = costCenterRepository.save(costCenter);

        UpdateCostCenterRequest request =
                new UpdateCostCenterRequest(
                        "New Name",
                        "Updated Description",
                        CostCenterType.CAPEX,
                        true,
                        true,
                        null,
                        group.getId(),
                        "CC999"
                );

        mockMvc.perform(
                        put("/cost-center/{id}", costCenter.getId())
                                .contentType(APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(costCenter.getId()))
                .andExpect(jsonPath("$.name").value("New Name"))
                .andExpect(jsonPath("$.type").value("CAPEX"));
    }

    @Test
    void shouldDeleteCostCenter() throws Exception {

        ActivityGroup group = new ActivityGroup();
        group.setName("Operations");

        group = activityGroupRepository.save(group);

        CostCenter costCenter = new CostCenter();
        costCenter.setName("Delete Me");
        costCenter.setActivityGroup(group);

        costCenter = costCenterRepository.save(costCenter);

        mockMvc.perform(delete("/cost-center/{id}", costCenter.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingCostCenter() throws Exception {
        mockMvc.perform(delete("/cost-center/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("CostCenter not found: 999"));
    }

    @Test
    void shouldReturnBadRequestForInvalidEnum() throws Exception {

        String payload = """
                {
                    "name": "Center",
                    "description": "Test",
                    "type": "INVALID_ENUM",
                    "acceptsTransaction": true,
                    "active": true,
                    "activityGroupId": 1,
                    "code": "CC01"
                }
                """;

        mockMvc.perform(post("/cost-center")
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }
}
