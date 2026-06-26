package com.sm3Agro.SM3AgroERP.counterparty.service;

import com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty.CreateCounterpartyRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty.UpdateCounterpartyRequest;
import com.sm3Agro.SM3AgroERP.counterparty.entity.Counterparty;
import com.sm3Agro.SM3AgroERP.counterparty.entity.CounterpartyType;
import com.sm3Agro.SM3AgroERP.counterparty.entity.Segment;
import com.sm3Agro.SM3AgroERP.counterparty.repository.CounterpartyRepository;
import com.sm3Agro.SM3AgroERP.counterparty.repository.CounterpartyTypeRepository;
import com.sm3Agro.SM3AgroERP.counterparty.repository.SegmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CounterpartyService {

    private final CounterpartyRepository counterpartyRepository;
    private final CounterpartyTypeRepository counterpartyTypeRepository;
    private final SegmentRepository segmentRepository;

    public List<Counterparty> findAll() {
        return counterpartyRepository.findAll();
    }

    @Transactional
    public Counterparty create(CreateCounterpartyRequest request) {
        Counterparty.CounterpartyBuilder builder = Counterparty.builder()
                .legalName(request.legalName())
                .tradeName(request.tradeName())
                .city(request.city())
                .state(request.state())
                .phoneNumber(request.phoneNumber())
                .email(request.email())
                .document(request.document())
                .documentType(request.documentType())
                .active(request.active());

        if (request.counterpartyTypeId() != null) {
            CounterpartyType counterpartyType = counterpartyTypeRepository.findById(request.counterpartyTypeId())
                    .orElseThrow(() -> new EntityNotFoundException("CounterpartyType not found: " + request.counterpartyTypeId()));
            builder.counterpartyType(counterpartyType);
        }

        if (request.segmentId() != null) {
            Segment segment = segmentRepository.findById(request.segmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Segment not found: " + request.segmentId()));
            builder.segment(segment);
        }

        return counterpartyRepository.save(builder.build());
    }

    @Transactional
    public Counterparty update(Long id, UpdateCounterpartyRequest request) {
        Counterparty entity = counterpartyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Counterparty not found: " + id));

        entity.setLegalName(request.legalName());
        entity.setTradeName(request.tradeName());
        entity.setCity(request.city());
        entity.setState(request.state());
        entity.setPhoneNumber(request.phoneNumber());
        entity.setEmail(request.email());
        entity.setDocument(request.document());
        entity.setDocumentType(request.documentType());
        entity.setActive(request.active());

        if (request.counterpartyTypeId() != null) {
            CounterpartyType counterpartyType = counterpartyTypeRepository.findById(request.counterpartyTypeId())
                    .orElseThrow(() -> new EntityNotFoundException("CounterpartyType not found: " + request.counterpartyTypeId()));
            entity.setCounterpartyType(counterpartyType);
        } else {
            entity.setCounterpartyType(null);
        }

        if (request.segmentId() != null) {
            Segment segment = segmentRepository.findById(request.segmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Segment not found: " + request.segmentId()));
            entity.setSegment(segment);
        } else {
            entity.setSegment(null);
        }

        return counterpartyRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!counterpartyRepository.existsById(id)) {
            throw new EntityNotFoundException("Counterparty not found: " + id);
        }
        counterpartyRepository.deleteById(id);
    }
}
