package com.sm3Agro.SM3AgroERP.inventory.service;

import com.sm3Agro.SM3AgroERP.inventory.dto.adjustmentRootCause.CreateAdjustmentRootCauseRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.adjustmentRootCause.UpdateAdjustmentRootCauseRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.AdjustmentRootCause;
import com.sm3Agro.SM3AgroERP.inventory.repository.AdjustmentRootCauseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class AdjustmentRootCauseService {

    private final AdjustmentRootCauseRepository repository;

    public List<AdjustmentRootCause> findAll() {
        return repository.findAll();
    }

    @Transactional
    public AdjustmentRootCause create(CreateAdjustmentRootCauseRequest request) {
        AdjustmentRootCause entity = AdjustmentRootCause.builder()
                .name(request.name())
                .build();
        return repository.save(entity);
    }

    @Transactional
    public AdjustmentRootCause update(Long id, UpdateAdjustmentRootCauseRequest request) {
        AdjustmentRootCause entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AdjustmentRootCause not found: " + id));

        entity.setName(request.name());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
