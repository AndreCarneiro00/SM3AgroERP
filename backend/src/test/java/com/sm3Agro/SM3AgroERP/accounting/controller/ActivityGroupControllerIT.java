package com.sm3Agro.SM3AgroERP.accounting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.CreateActivityGroupRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.UpdateActivityGroupRequest;
import com.sm3Agro.SM3AgroERP.accounting.entity.ActivityGroup;
import com.sm3Agro.SM3AgroERP.accounting.repository.ActivityGroupRepository;
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
class ActivityGroupControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ActivityGroupRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldCreateActivityGroup() throws Exception {

        CreateActivityGroupRequest request =
                new CreateActivityGroupRequest("Agriculture");

        mockMvc.perform(post("/activity-group")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Agriculture"));
    }

    @Test
    void shouldReturnAllActivityGroups() throws Exception {

        ActivityGroup group = new ActivityGroup();
        group.setName("Operations");

        repository.save(group);

        mockMvc.perform(get("/activity-group"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Operations"));
    }

    @Test
    void shouldUpdateActivityGroup() throws Exception {

        ActivityGroup group = new ActivityGroup();
        group.setName("Old Name");

        group = repository.save(group);

        UpdateActivityGroupRequest request =
                new UpdateActivityGroupRequest("New Name");

        mockMvc.perform(
                        put("/activity-group/{id}", group.getId())
                                .contentType(APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(group.getId()))
                .andExpect(jsonPath("$.name").value("New Name"));
    }

    @Test
    void shouldDeleteActivityGroup() throws Exception {

        ActivityGroup group = new ActivityGroup();
        group.setName("Delete Me");

        group = repository.save(group);

        mockMvc.perform(delete("/activity-group/{id}", group.getId()))
                .andExpect(status().isNoContent());
    }
}