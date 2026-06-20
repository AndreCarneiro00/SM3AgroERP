package com.sm3Agro.SM3AgroERP.accounting.service;

import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.CreateActivityGroupRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.UpdateActivityGroupRequest;
import com.sm3Agro.SM3AgroERP.accounting.entity.ActivityGroup;
import com.sm3Agro.SM3AgroERP.accounting.repository.ActivityGroupRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ActivityGroupService {

    private final ActivityGroupRepository repository;

    public List<ActivityGroup> findAll() {
        return repository.findAll();
    }

    public ActivityGroup create(CreateActivityGroupRequest request) {
        ActivityGroup entity = new ActivityGroup();
        entity.setName(request.name());
        return repository.save(entity);
    }

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

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
