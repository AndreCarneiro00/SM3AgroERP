package com.sm3Agro.SM3AgroERP.accounting.service;

import com.sm3Agro.SM3AgroERP.accounting.dto.chartOfAccount.CreateChartOfAccountRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.chartOfAccount.UpdateChartOfAccountRequest;
import com.sm3Agro.SM3AgroERP.accounting.entity.ChartOfAccount;
import com.sm3Agro.SM3AgroERP.accounting.repository.ChartOfAccountRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ChartOfAccountService {

    private final ChartOfAccountRepository chartOfAccountRepository;

    public List<ChartOfAccount> findAll() {
        return chartOfAccountRepository.findAll();
    }

    @Transactional
    public ChartOfAccount create(CreateChartOfAccountRequest request) {
        ChartOfAccount.ChartOfAccountBuilder builder = ChartOfAccount.builder()
                .name(request.name())
                .type(request.type())
                .acceptsTransaction(request.acceptsTransaction())
                .active(request.active())
                .code(request.code());

        if (request.parentId() != null) {
            ChartOfAccount parent = chartOfAccountRepository.findById(request.parentId())
                    .orElseThrow(() -> new EntityNotFoundException("ChartOfAccount not found: " + request.parentId()));
            builder.parent(parent);
        }

        return chartOfAccountRepository.save(builder.build());
    }

    @Transactional
    public ChartOfAccount update(Long id, UpdateChartOfAccountRequest request) {
        ChartOfAccount entity = chartOfAccountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ChartOfAccount not found: " + id));

        entity.setName(request.name());
        entity.setType(request.type());
        entity.setAcceptsTransaction(request.acceptsTransaction());
        entity.setActive(request.active());
        entity.setCode(request.code());

        if (request.parentId() != null) {
            ChartOfAccount parent = chartOfAccountRepository.findById(request.parentId())
                    .orElseThrow(() -> new EntityNotFoundException("ChartOfAccount not found: " + request.parentId()));
            entity.setParent(parent);
        } else {
            entity.setParent(null);
        }

        return chartOfAccountRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        chartOfAccountRepository.deleteById(id);
    }
}
