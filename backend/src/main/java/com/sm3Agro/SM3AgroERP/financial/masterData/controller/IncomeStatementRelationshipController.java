package com.sm3Agro.SM3AgroERP.financial.masterData.controller;

import com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship.CreateIncomeStatementRelationshipRequest;
import com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship.CreateIncomeStatementRelationshipResponse;
import com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship.FindAllIncomeStatementRelationshipResponse;
import com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship.UpdateIncomeStatementRelationshipRequest;
import com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship.UpdateIncomeStatementRelationshipResponse;
import com.sm3Agro.SM3AgroERP.financial.masterData.entity.IncomeStatementRelationship;
import com.sm3Agro.SM3AgroERP.financial.masterData.service.IncomeStatementRelationshipService;
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
@RequestMapping("/income-statement-relationships")
public class IncomeStatementRelationshipController {

    private final IncomeStatementRelationshipService service;

    @GetMapping
    public List<FindAllIncomeStatementRelationshipResponse> findAllIncomeStatementRelationships() {
        return service.findAll().stream()
                .map(this::toFindAllResponse)
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateIncomeStatementRelationshipResponse createIncomeStatementRelationship(
            @RequestBody CreateIncomeStatementRelationshipRequest request
    ) {
        IncomeStatementRelationship created = service.create(request);
        return toCreateResponse(created);
    }

    @PutMapping("/{id}")
    public UpdateIncomeStatementRelationshipResponse updateIncomeStatementRelationship(
            @PathVariable Long id,
            @RequestBody UpdateIncomeStatementRelationshipRequest request
    ) {
        IncomeStatementRelationship updated = service.update(id, request);
        return toUpdateResponse(updated);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteIncomeStatementRelationship(@PathVariable Long id) {
        service.delete(id);
    }

    private FindAllIncomeStatementRelationshipResponse toFindAllResponse(IncomeStatementRelationship entity) {
        return new FindAllIncomeStatementRelationshipResponse(
                entity.getId(),
                entity.getChartOfAccount().getId(),
                entity.getIncomeStatementGroup().getId()
        );
    }

    private CreateIncomeStatementRelationshipResponse toCreateResponse(IncomeStatementRelationship entity) {
        return new CreateIncomeStatementRelationshipResponse(
                entity.getId(),
                entity.getChartOfAccount().getId(),
                entity.getIncomeStatementGroup().getId()
        );
    }

    private UpdateIncomeStatementRelationshipResponse toUpdateResponse(IncomeStatementRelationship entity) {
        return new UpdateIncomeStatementRelationshipResponse(
                entity.getId(),
                entity.getChartOfAccount().getId(),
                entity.getIncomeStatementGroup().getId()
        );
    }
}
