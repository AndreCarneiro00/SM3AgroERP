package com.sm3Agro.SM3AgroERP.accounting.service;

import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.CreateCostCenterRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.UpdateCostCenterRequest;
import com.sm3Agro.SM3AgroERP.accounting.entity.ActivityGroup;
import com.sm3Agro.SM3AgroERP.accounting.entity.CostCenter;
import com.sm3Agro.SM3AgroERP.accounting.repository.ActivityGroupRepository;
import com.sm3Agro.SM3AgroERP.accounting.repository.CostCenterRepository;
import com.sm3Agro.SM3AgroERP.accounting.enums.CostCenterType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Locale;

@RequiredArgsConstructor
@Service
public class CostCenterService {

    private final CostCenterRepository costCenterRepository;
    private final ActivityGroupRepository activityGroupRepository;

    public List<CostCenter> findAll() {
        return costCenterRepository.findAll();
    }

    public CostCenter create(CreateCostCenterRequest request) {
        CostCenter newCostCenter = new CostCenter();

        newCostCenter.setName(request.name());
        newCostCenter.setDescription(request.description());
        newCostCenter.setType(request.type());
        newCostCenter.setAcceptsTransaction(request.acceptsTransaction());
        newCostCenter.setActive(request.active());
        newCostCenter.setCode(request.code());

        if (request.parentId() != null) {
            CostCenter parent = costCenterRepository
                    .findById(request.parentId())
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "CostCenter not found: " + request.parentId()
                            )
                    );

            newCostCenter.setParent(parent);
        }
        ActivityGroup activityGroup = activityGroupRepository
                .findById(request.activityGroupId())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "ActivityGroup not found: " + request.activityGroupId()
                        )
                );

        newCostCenter.setActivityGroup(activityGroup);

        return costCenterRepository.save(newCostCenter);
    }

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
//
    public void delete(Long id) {
        costCenterRepository.deleteById(id);
    }
}
