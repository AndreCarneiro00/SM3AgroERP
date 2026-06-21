package com.sm3Agro.SM3AgroERP.financial.controller;

import com.sm3Agro.SM3AgroERP.financial.dto.incomeStatementGroup.CreateIncomeStatementGroupRequest;
import com.sm3Agro.SM3AgroERP.financial.dto.incomeStatementGroup.CreateIncomeStatementGroupResponse;
import com.sm3Agro.SM3AgroERP.financial.dto.incomeStatementGroup.FindAllIncomeStatementGroupResponse;
import com.sm3Agro.SM3AgroERP.financial.dto.incomeStatementGroup.UpdateIncomeStatementGroupRequest;
import com.sm3Agro.SM3AgroERP.financial.dto.incomeStatementGroup.UpdateIncomeStatementGroupResponse;
import com.sm3Agro.SM3AgroERP.financial.entity.IncomeStatementGroup;
import com.sm3Agro.SM3AgroERP.financial.service.IncomeStatementGroupService;
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
@RequestMapping("/income-statement-group")
public class IncomeStatementGroupController {

    private final IncomeStatementGroupService service;

    @GetMapping
    public List<FindAllIncomeStatementGroupResponse> findAllIncomeStatementGroup() {
        List<IncomeStatementGroup> groups = service.findAll();
        return groups.stream()
                .map(group -> new FindAllIncomeStatementGroupResponse(
                        group.getId(),
                        group.getName(),
                        group.getDisplayOrder()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateIncomeStatementGroupResponse createIncomeStatementGroup(
            @RequestBody CreateIncomeStatementGroupRequest request
    ) {
        IncomeStatementGroup created = service.create(request);
        return new CreateIncomeStatementGroupResponse(
                created.getId(),
                created.getName(),
                created.getDisplayOrder()
        );
    }

    @PutMapping("/{id}")
    public UpdateIncomeStatementGroupResponse updateIncomeStatementGroup(
            @PathVariable Long id,
            @RequestBody UpdateIncomeStatementGroupRequest request
    ) {
        IncomeStatementGroup updated = service.update(id, request);
        return new UpdateIncomeStatementGroupResponse(
                updated.getId(),
                updated.getName(),
                updated.getDisplayOrder()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteIncomeStatementGroup(@PathVariable Long id) {
        service.delete(id);
    }
}
