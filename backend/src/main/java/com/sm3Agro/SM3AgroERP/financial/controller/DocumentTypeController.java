package com.sm3Agro.SM3AgroERP.financial.controller;

import com.sm3Agro.SM3AgroERP.financial.dto.documentType.CreateDocumentTypeRequest;
import com.sm3Agro.SM3AgroERP.financial.dto.documentType.CreateDocumentTypeResponse;
import com.sm3Agro.SM3AgroERP.financial.dto.documentType.FindAllDocumentTypeResponse;
import com.sm3Agro.SM3AgroERP.financial.dto.documentType.UpdateDocumentTypeRequest;
import com.sm3Agro.SM3AgroERP.financial.dto.documentType.UpdateDocumentTypeResponse;
import com.sm3Agro.SM3AgroERP.financial.entity.DocumentType;
import com.sm3Agro.SM3AgroERP.financial.service.DocumentTypeService;
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
@RequestMapping("/document-type")
public class DocumentTypeController {

    private final DocumentTypeService service;

    @GetMapping
    public List<FindAllDocumentTypeResponse> findAllDocumentType() {
        List<DocumentType> documentTypes = service.findAll();
        return documentTypes.stream()
                .map(documentType -> new FindAllDocumentTypeResponse(
                        documentType.getId(),
                        documentType.getName()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateDocumentTypeResponse createDocumentType(@RequestBody CreateDocumentTypeRequest request) {
        DocumentType created = service.create(request);
        return new CreateDocumentTypeResponse(
                created.getId(),
                created.getName()
        );
    }

    @PutMapping("/{id}")
    public UpdateDocumentTypeResponse updateDocumentType(
            @PathVariable Long id,
            @RequestBody UpdateDocumentTypeRequest request
    ) {
        DocumentType updated = service.update(id, request);
        return new UpdateDocumentTypeResponse(
                updated.getId(),
                updated.getName()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteDocumentType(@PathVariable Long id) {
        service.delete(id);
    }
}
