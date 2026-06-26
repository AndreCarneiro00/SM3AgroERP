package com.sm3Agro.SM3AgroERP.production.dto.machine;

import com.sm3Agro.SM3AgroERP.production.enums.MachineType;

public record CreateMachineResponse(
        Long id,
        String name,
        MachineType machineType,
        String manufacturer,
        String model,
        Integer year,
        Boolean active,
        String observation
) {
}
