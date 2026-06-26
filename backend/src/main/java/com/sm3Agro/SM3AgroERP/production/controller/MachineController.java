package com.sm3Agro.SM3AgroERP.production.controller;

import com.sm3Agro.SM3AgroERP.production.dto.machine.CreateMachineRequest;
import com.sm3Agro.SM3AgroERP.production.dto.machine.CreateMachineResponse;
import com.sm3Agro.SM3AgroERP.production.dto.machine.FindAllMachineResponse;
import com.sm3Agro.SM3AgroERP.production.dto.machine.UpdateMachineRequest;
import com.sm3Agro.SM3AgroERP.production.dto.machine.UpdateMachineResponse;
import com.sm3Agro.SM3AgroERP.production.entity.Machine;
import com.sm3Agro.SM3AgroERP.production.service.MachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/machine")
public class MachineController {

    private final MachineService service;

    @GetMapping
    public List<FindAllMachineResponse> findAllMachine() {
        List<Machine> machines = service.findAll();
        return machines.stream()
                .map(machine -> new FindAllMachineResponse(
                        machine.getId(),
                        machine.getName(),
                        machine.getMachineType(),
                        machine.getManufacturer(),
                        machine.getModel(),
                        machine.getYear(),
                        machine.getActive(),
                        machine.getObservation()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateMachineResponse createMachine(@RequestBody CreateMachineRequest request) {
        Machine created = service.create(request);
        return new CreateMachineResponse(
                created.getId(),
                created.getName(),
                created.getMachineType(),
                created.getManufacturer(),
                created.getModel(),
                created.getYear(),
                created.getActive(),
                created.getObservation()
        );
    }

    @PutMapping("/{id}")
    public UpdateMachineResponse updateMachine(@PathVariable Long id, @RequestBody UpdateMachineRequest request) {
        Machine updated = service.update(id, request);
        return new UpdateMachineResponse(
                updated.getId(),
                updated.getName(),
                updated.getMachineType(),
                updated.getManufacturer(),
                updated.getModel(),
                updated.getYear(),
                updated.getActive(),
                updated.getObservation()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteMachine(@PathVariable Long id) {
        service.delete(id);
    }
}
