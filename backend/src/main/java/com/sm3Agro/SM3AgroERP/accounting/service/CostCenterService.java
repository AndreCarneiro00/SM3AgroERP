package com.sm3Agro.SM3AgroERP.accounting.service;

import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.CreateCostCenterRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.UpdateCostCenterRequest;
import com.sm3Agro.SM3AgroERP.accounting.entity.ActivityGroup;
import com.sm3Agro.SM3AgroERP.accounting.entity.CostCenter;
import com.sm3Agro.SM3AgroERP.accounting.repository.ActivityGroupRepository;
import com.sm3Agro.SM3AgroERP.accounting.repository.CostCenterRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CostCenterService {

    private final CostCenterRepository costCenterRepository;
    private final ActivityGroupRepository activityGroupRepository;

    public List<CostCenter> findAll() {
        return costCenterRepository.findAll();
    }

    @Transactional
    public CostCenter create(CreateCostCenterRequest request) {
        CostCenter.CostCenterBuilder newCostCenterBuilder = CostCenter.builder()
                .name(request.name())
                .description(request.description())
                .type(request.type())
                .acceptsTransaction(request.acceptsTransaction())
                .active(request.active())
                .code(request.code());

        if (request.parentId() != null) {
            CostCenter parent = costCenterRepository
                    .findById(request.parentId())
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "CostCenter not found: " + request.parentId()
                            )
                    );

            newCostCenterBuilder.parent(parent);
        }
        ActivityGroup activityGroup = activityGroupRepository
                .findById(request.activityGroupId())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "ActivityGroup not found: " + request.activityGroupId()
                        )
                );

        return costCenterRepository.save(
                newCostCenterBuilder
                        .activityGroup(activityGroup)
                        .build()
        );
    }

    @Transactional
    public CostCenter update(Long id, UpdateCostCenterRequest request) {
        CostCenter entity = costCenterRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "CostCenter not found: " + id
                        )
                );
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setType(request.type());
        entity.setAcceptsTransaction(request.acceptsTransaction());
        entity.setActive(request.active());
        entity.setCode(request.code());

        if (request.parentId() != null) {
            CostCenter parent = costCenterRepository
                    .findById(request.parentId())
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "CostCenter not found: " + request.parentId()
                            )
                    );

            entity.setParent(parent);

        } else {
            entity.setParent(null);
        }

        ActivityGroup activityGroup = activityGroupRepository
                .findById(request.activityGroupId())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "ActivityGroup not found: " + request.activityGroupId()
                        )
                );

        entity.setActivityGroup(activityGroup);

        return costCenterRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        costCenterRepository.deleteById(id);
    }
}
