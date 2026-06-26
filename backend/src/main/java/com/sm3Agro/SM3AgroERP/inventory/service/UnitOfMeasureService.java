package com.sm3Agro.SM3AgroERP.inventory.service;

import com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure.CreateUnitOfMeasureRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure.UpdateUnitOfMeasureRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.BaseUnit;
import com.sm3Agro.SM3AgroERP.inventory.entity.UnitOfMeasure;
import com.sm3Agro.SM3AgroERP.inventory.repository.BaseUnitRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.UnitOfMeasureRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
@Service
public class UnitOfMeasureService {

    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final BaseUnitRepository baseUnitRepository;

    public List<UnitOfMeasure> findAll() {
        return unitOfMeasureRepository.findAll();
    }

    @Transactional
    public UnitOfMeasure create(CreateUnitOfMeasureRequest request) {
        BaseUnit baseUnit = baseUnitRepository.findById(request.baseUnitId())
                .orElseThrow(() -> new EntityNotFoundException("BaseUnit not found: " + request.baseUnitId()));

        BigDecimal conversionFactor = request.conversionFactor() == null
                ? BigDecimal.ONE
                : request.conversionFactor();

        if (conversionFactor.signum() <= 0) {
            throw new IllegalArgumentException("conversionFactor must be greater than zero");
        }

        UnitOfMeasure entity = UnitOfMeasure.builder()
                .name(request.name())
                .baseUnit(baseUnit)
                .conversionFactor(conversionFactor)
                .build();

        return unitOfMeasureRepository.save(entity);
    }

    @Transactional
    public UnitOfMeasure update(Long id, UpdateUnitOfMeasureRequest request) {
        UnitOfMeasure entity = unitOfMeasureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("UnitOfMeasure not found: " + id));

        BaseUnit baseUnit = baseUnitRepository.findById(request.baseUnitId())
                .orElseThrow(() -> new EntityNotFoundException("BaseUnit not found: " + request.baseUnitId()));

        if (request.conversionFactor() == null || request.conversionFactor().signum() <= 0) {
            throw new IllegalArgumentException("conversionFactor must be greater than zero");
        }

        entity.setName(request.name());
        entity.setBaseUnit(baseUnit);
        entity.setConversionFactor(request.conversionFactor());

        return unitOfMeasureRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!unitOfMeasureRepository.existsById(id)) {
            throw new EntityNotFoundException("UnitOfMeasure not found: " + id);
        }
        unitOfMeasureRepository.deleteById(id);
    }
}
