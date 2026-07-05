package com.sm3Agro.SM3AgroERP.financial.masterData.service;

import com.sm3Agro.SM3AgroERP.accounting.entity.ChartOfAccount;
import com.sm3Agro.SM3AgroERP.accounting.repository.ChartOfAccountRepository;
import com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship.CreateIncomeStatementRelationshipRequest;
import com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship.UpdateIncomeStatementRelationshipRequest;
import com.sm3Agro.SM3AgroERP.financial.masterData.entity.IncomeStatementGroup;
import com.sm3Agro.SM3AgroERP.financial.masterData.entity.IncomeStatementRelationship;
import com.sm3Agro.SM3AgroERP.financial.masterData.repository.IncomeStatementGroupRepository;
import com.sm3Agro.SM3AgroERP.financial.masterData.repository.IncomeStatementRelationshipRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class IncomeStatementRelationshipService {

    private final IncomeStatementRelationshipRepository repository;
    private final ChartOfAccountRepository chartOfAccountRepository;
    private final IncomeStatementGroupRepository incomeStatementGroupRepository;

    public List<IncomeStatementRelationship> findAll() {
        return repository.findAll();
    }

    @Transactional
    public IncomeStatementRelationship create(CreateIncomeStatementRelationshipRequest request) {
        ChartOfAccount chartOfAccount = chartOfAccountRepository.findById(request.chartOfAccountId())
                .orElseThrow(() -> new EntityNotFoundException("ChartOfAccount not found: " + request.chartOfAccountId()));

        IncomeStatementGroup incomeStatementGroup = incomeStatementGroupRepository.findById(request.incomeStatementGroupId())
                .orElseThrow(() -> new EntityNotFoundException("IncomeStatementGroup not found: " + request.incomeStatementGroupId()));

        IncomeStatementRelationship entity = IncomeStatementRelationship.builder()
                .chartOfAccount(chartOfAccount)
                .incomeStatementGroup(incomeStatementGroup)
                .build();

        return repository.save(entity);
    }

    @Transactional
    public IncomeStatementRelationship update(Long id, UpdateIncomeStatementRelationshipRequest request) {
        IncomeStatementRelationship entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("IncomeStatementRelationship not found: " + id));

        ChartOfAccount chartOfAccount = chartOfAccountRepository.findById(request.chartOfAccountId())
                .orElseThrow(() -> new EntityNotFoundException("ChartOfAccount not found: " + request.chartOfAccountId()));

        IncomeStatementGroup incomeStatementGroup = incomeStatementGroupRepository.findById(request.incomeStatementGroupId())
                .orElseThrow(() -> new EntityNotFoundException("IncomeStatementGroup not found: " + request.incomeStatementGroupId()));

        entity.setChartOfAccount(chartOfAccount);
        entity.setIncomeStatementGroup(incomeStatementGroup);

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("IncomeStatementRelationship not found: " + id);
        }
        repository.deleteById(id);
    }
}
