package com.sm3Agro.SM3AgroERP.accounting.service;

import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.CreateActivityGroupRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.UpdateActivityGroupRequest;
import com.sm3Agro.SM3AgroERP.accounting.entity.ActivityGroup;
import com.sm3Agro.SM3AgroERP.accounting.repository.ActivityGroupRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ActivityGroupService {

    private final ActivityGroupRepository repository;

    public List<ActivityGroup> findAll() {
        return repository.findAll();
    }

    @Transactional
    public ActivityGroup create(CreateActivityGroupRequest request) {
        ActivityGroup entity = ActivityGroup.builder()
                .name(request.name())
                .build();
        return repository.save(entity);
    }

    @Transactional
    public ActivityGroup update(Long id, UpdateActivityGroupRequest request) {
        ActivityGroup entity = repository.findById(id)
                                .orElseThrow(() ->
                                        new EntityNotFoundException(
                                                "ActivityGroup not found: " + id
                                        )
                                );
        entity.setName(request.name());
        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("ActivityGroup not found: " + id);
        }
        repository.deleteById(id);
    }
}
