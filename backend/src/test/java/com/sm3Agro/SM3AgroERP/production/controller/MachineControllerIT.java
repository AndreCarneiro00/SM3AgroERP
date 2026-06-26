package com.sm3Agro.SM3AgroERP.production.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sm3Agro.SM3AgroERP.production.dto.machine.CreateMachineRequest;
import com.sm3Agro.SM3AgroERP.production.dto.machine.UpdateMachineRequest;
import com.sm3Agro.SM3AgroERP.production.entity.Machine;
import com.sm3Agro.SM3AgroERP.production.enums.MachineType;
import com.sm3Agro.SM3AgroERP.production.repository.MachineRepository;
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
class MachineControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MachineRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldCreateMachine() throws Exception {
        CreateMachineRequest request = new CreateMachineRequest(
                "Trator 01",
                MachineType.TRACTOR,
                "John Deere",
                "5070E",
                2023,
                true,
                "Principal"
        );

        mockMvc.perform(post("/machine")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Trator 01"))
                .andExpect(jsonPath("$.machineType").value("TRACTOR"))
                .andExpect(jsonPath("$.manufacturer").value("John Deere"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldReturnAllMachines() throws Exception {
        repository.save(Machine.builder()
                .name("Pulverizador")
                .machineType(MachineType.SPRAYER)
                .manufacturer("Jacto")
                .model("XP")
                .year(2022)
                .active(true)
                .observation("Campo")
                .build());

        mockMvc.perform(get("/machine"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Pulverizador"))
                .andExpect(jsonPath("$[0].machineType").value("SPRAYER"));
    }

    @Test
    void shouldUpdateMachine() throws Exception {
        Machine entity = repository.save(Machine.builder()
                .name("Maquina Antiga")
                .machineType(MachineType.MOWER)
                .manufacturer("Marca A")
                .model("M1")
                .year(2018)
                .active(true)
                .observation("Antiga")
                .build());

        UpdateMachineRequest request = new UpdateMachineRequest(
                "Maquina Nova",
                MachineType.BALER,
                "Marca B",
                "B2",
                2024,
                false,
                "Atualizada"
        );

        mockMvc.perform(put("/machine/{id}", entity.getId())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entity.getId()))
                .andExpect(jsonPath("$.name").value("Maquina Nova"))
                .andExpect(jsonPath("$.machineType").value("BALER"))
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.observation").value("Atualizada"));
    }

    @Test
    void shouldDeleteMachine() throws Exception {
        Machine entity = repository.save(Machine.builder()
                .name("Excluir")
                .machineType(MachineType.OTHER)
                .active(true)
                .build());

        mockMvc.perform(delete("/machine/{id}", entity.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingMachine() throws Exception {
        mockMvc.perform(delete("/machine/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Machine not found: 999"));
    }
}
