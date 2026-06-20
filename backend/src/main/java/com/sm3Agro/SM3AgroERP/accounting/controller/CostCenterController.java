package com.sm3Agro.SM3AgroERP.accounting.controller;

import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.CreateCostCenterRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.CreateCostCenterResponse;
import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.FindAllCostCenterResponse;
import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.UpdateCostCenterRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.costCenter.UpdateCostCenterResponse;
import com.sm3Agro.SM3AgroERP.accounting.entity.CostCenter;
import com.sm3Agro.SM3AgroERP.accounting.service.CostCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
@RequestMapping("/cost-center")
public class CostCenterController {

    private final CostCenterService service;

    @GetMapping
    public List<FindAllCostCenterResponse> findAllCostCenter() {
        List<CostCenter> costCenters = service.findAll();
        return costCenters.stream()
                .map(costCenter -> new FindAllCostCenterResponse(
                            costCenter.getId(),
                            costCenter.getName(),
                            costCenter.getDescription(),
                            costCenter.getType(),
                            costCenter.getAcceptsTransaction(),
                            costCenter.getActive(),
                            costCenter.getParent() != null ? costCenter.getParent().getId() : null,
                            costCenter.getActivityGroup().getId() != null ? costCenter.getActivityGroup().getId() : null,
                            costCenter.getCode()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateCostCenterResponse createCostCenter(@RequestBody CreateCostCenterRequest request) {
        CostCenter created = service.create(request);
        return new CreateCostCenterResponse(
                created.getId(),
                created.getName(),
                created.getDescription(),
                created.getType(),
                created.getAcceptsTransaction(),
                created.getActive(),
                created.getParent() != null ? created.getParent().getId() : null,
                created.getActivityGroup().getId(),
                created.getCode()
        );
    }

    @PutMapping("/{id}")
    public UpdateCostCenterResponse updateCostCenter(@PathVariable Long id, @RequestBody UpdateCostCenterRequest request) {
        CostCenter updatedCostCenter = service.update(id, request);
        return new UpdateCostCenterResponse(
                updatedCostCenter.getId(),
                updatedCostCenter.getName(),
                updatedCostCenter.getDescription(),
                updatedCostCenter.getType(),
                updatedCostCenter.getAcceptsTransaction(),
                updatedCostCenter.getActive(),
                updatedCostCenter.getParent() != null
                        ? updatedCostCenter.getParent().getId()
                        : null,
                updatedCostCenter.getActivityGroup().getId(),
                updatedCostCenter.getCode()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteCostCenter(@PathVariable Long id) {
        service.delete(id);
    }

}
