package com.sm3Agro.SM3AgroERP.inventory.service;

import com.sm3Agro.SM3AgroERP.inventory.dto.baseUnit.CreateBaseUnitRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.baseUnit.UpdateBaseUnitRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.BaseUnit;
import com.sm3Agro.SM3AgroERP.inventory.repository.BaseUnitRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class BaseUnitService {

    private final BaseUnitRepository repository;

    public List<BaseUnit> findAll() {
        return repository.findAll();
    }

    @Transactional
    public BaseUnit create(CreateBaseUnitRequest request) {
        BaseUnit entity = BaseUnit.builder()
                .name(request.name())
                .build();
        return repository.save(entity);
    }

    @Transactional
    public BaseUnit update(Long id, UpdateBaseUnitRequest request) {
        BaseUnit entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BaseUnit not found: " + id));

        entity.setName(request.name());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
