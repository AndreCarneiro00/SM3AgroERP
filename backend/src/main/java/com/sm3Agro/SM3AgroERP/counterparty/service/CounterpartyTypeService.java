package com.sm3Agro.SM3AgroERP.counterparty.service;

import com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType.CreateCounterpartyTypeRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType.UpdateCounterpartyTypeRequest;
import com.sm3Agro.SM3AgroERP.counterparty.entity.CounterpartyType;
import com.sm3Agro.SM3AgroERP.counterparty.repository.CounterpartyTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CounterpartyTypeService {

    private final CounterpartyTypeRepository repository;

    public List<CounterpartyType> findAll() {
        return repository.findAll();
    }

    @Transactional
    public CounterpartyType create(CreateCounterpartyTypeRequest request) {
        CounterpartyType.CounterpartyTypeBuilder builder = CounterpartyType.builder()
                .name(request.name())
                .description(request.description())
                ;
        if (request.active() != null) {
            builder.active(request.active());
        }
        CounterpartyType entity = builder.build();
        return repository.save(entity);
    }

    @Transactional
    public CounterpartyType update(Long id, UpdateCounterpartyTypeRequest request) {
        CounterpartyType entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CounterpartyType not found: " + id));

        entity.setName(request.name());
        entity.setDescription(request.description());
        if (request.active() != null) {
            entity.setActive(request.active());
        }

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
