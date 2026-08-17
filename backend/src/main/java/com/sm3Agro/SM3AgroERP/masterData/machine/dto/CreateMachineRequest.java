package com.sm3Agro.SM3AgroERP.masterData.machine.dto;

import com.sm3Agro.SM3AgroERP.masterData.machine.enums.MachineType;

public record CreateMachineRequest(
        String name,
        MachineType machineType,
        String manufacturer,
        String model,
        Integer year,
        Boolean active,
        String observation
) {
}
