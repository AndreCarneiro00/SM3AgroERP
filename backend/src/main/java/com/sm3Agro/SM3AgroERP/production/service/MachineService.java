package com.sm3Agro.SM3AgroERP.production.service;

import com.sm3Agro.SM3AgroERP.production.dto.machine.CreateMachineRequest;
import com.sm3Agro.SM3AgroERP.production.dto.machine.UpdateMachineRequest;
import com.sm3Agro.SM3AgroERP.production.entity.Machine;
import com.sm3Agro.SM3AgroERP.production.repository.MachineRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class MachineService {

    private final MachineRepository repository;

    public List<Machine> findAll() {
        return repository.findAll();
    }

    @Transactional
    public Machine create(CreateMachineRequest request) {
        Machine.MachineBuilder builder = Machine.builder()
                .name(request.name())
                .machineType(request.machineType())
                .manufacturer(request.manufacturer())
                .model(request.model())
                .year(request.year())
                .observation(request.observation());

        if (request.active() != null) {
            builder.active(request.active());
        }

        return repository.save(builder.build());
    }

    @Transactional
    public Machine update(Long id, UpdateMachineRequest request) {
        Machine entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Machine not found: " + id));

        entity.setName(request.name());
        entity.setMachineType(request.machineType());
        entity.setManufacturer(request.manufacturer());
        entity.setModel(request.model());
        entity.setYear(request.year());
        entity.setObservation(request.observation());
        if (request.active() != null) {
            entity.setActive(request.active());
        }

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
