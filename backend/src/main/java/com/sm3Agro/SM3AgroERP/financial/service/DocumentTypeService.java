package com.sm3Agro.SM3AgroERP.financial.service;

import com.sm3Agro.SM3AgroERP.financial.dto.documentType.CreateDocumentTypeRequest;
import com.sm3Agro.SM3AgroERP.financial.dto.documentType.UpdateDocumentTypeRequest;
import com.sm3Agro.SM3AgroERP.financial.entity.DocumentType;
import com.sm3Agro.SM3AgroERP.financial.repository.DocumentTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class DocumentTypeService {

    private final DocumentTypeRepository repository;

    public List<DocumentType> findAll() {
        return repository.findAll();
    }

    @Transactional
    public DocumentType create(CreateDocumentTypeRequest request) {
        DocumentType entity = DocumentType.builder()
                .name(request.name())
                .build();
        return repository.save(entity);
    }

    @Transactional
    public DocumentType update(Long id, UpdateDocumentTypeRequest request) {
        DocumentType entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("DocumentType not found: " + id));

        entity.setName(request.name());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
