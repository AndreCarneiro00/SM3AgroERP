package com.sm3Agro.SM3AgroERP.financial.service;

import com.sm3Agro.SM3AgroERP.financial.dto.incomeStatementGroup.CreateIncomeStatementGroupRequest;
import com.sm3Agro.SM3AgroERP.financial.dto.incomeStatementGroup.UpdateIncomeStatementGroupRequest;
import com.sm3Agro.SM3AgroERP.financial.entity.IncomeStatementGroup;
import com.sm3Agro.SM3AgroERP.financial.repository.IncomeStatementGroupRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class IncomeStatementGroupService {

    private final IncomeStatementGroupRepository repository;

    public List<IncomeStatementGroup> findAll() {
        return repository.findAll();
    }

    @Transactional
    public IncomeStatementGroup create(CreateIncomeStatementGroupRequest request) {
        IncomeStatementGroup entity = IncomeStatementGroup.builder()
                .name(request.name())
                .displayOrder(request.displayOrder())
                .build();
        return repository.save(entity);
    }

    @Transactional
    public IncomeStatementGroup update(Long id, UpdateIncomeStatementGroupRequest request) {
        IncomeStatementGroup entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("IncomeStatementGroup not found: " + id));

        entity.setName(request.name());
        entity.setDisplayOrder(request.displayOrder());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
