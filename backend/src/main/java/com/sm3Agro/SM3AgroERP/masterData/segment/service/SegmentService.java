package com.sm3Agro.SM3AgroERP.masterData.segment.service;

import com.sm3Agro.SM3AgroERP.masterData.segment.dto.CreateSegmentRequest;
import com.sm3Agro.SM3AgroERP.masterData.segment.dto.UpdateSegmentRequest;
import com.sm3Agro.SM3AgroERP.masterData.segment.entity.Segment;
import com.sm3Agro.SM3AgroERP.masterData.segment.repository.SegmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class SegmentService {

    private final SegmentRepository repository;

    public List<Segment> findAll() {
        return repository.findAll();
    }

    @Transactional
    public Segment create(CreateSegmentRequest request) {
        Segment entity = Segment.builder()
                .name(request.name())
                .build();
        return repository.save(entity);
    }

    @Transactional
    public Segment update(Long id, UpdateSegmentRequest request) {
        Segment entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Segment not found: " + id));

        entity.setName(request.name());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Segment not found: " + id);
        }
        repository.deleteById(id);
    }
}
