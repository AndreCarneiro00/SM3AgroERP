package com.sm3Agro.SM3AgroERP.production.service;

import com.sm3Agro.SM3AgroERP.production.dto.field.CreateFieldRequest;
import com.sm3Agro.SM3AgroERP.production.dto.field.UpdateFieldRequest;
import com.sm3Agro.SM3AgroERP.production.entity.Field;
import com.sm3Agro.SM3AgroERP.production.repository.FieldRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class FieldService {

    private final FieldRepository repository;

    public List<Field> findAll() {
        return repository.findAll();
    }

    @Transactional
    public Field create(CreateFieldRequest request) {
        Field entity = Field.builder()
                .name(request.name())
                .areaHectares(request.areaHectares())
                .build();
        return repository.save(entity);
    }

    @Transactional
    public Field update(Long id, UpdateFieldRequest request) {
        Field entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Field not found: " + id));

        entity.setName(request.name());
        entity.setAreaHectares(request.areaHectares());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Field not found: " + id);
        }
        repository.deleteById(id);
    }
}
