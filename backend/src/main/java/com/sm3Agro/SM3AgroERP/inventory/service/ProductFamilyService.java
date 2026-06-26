package com.sm3Agro.SM3AgroERP.inventory.service;

import com.sm3Agro.SM3AgroERP.inventory.dto.productFamily.CreateProductFamilyRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.productFamily.UpdateProductFamilyRequest;
import com.sm3Agro.SM3AgroERP.inventory.entity.ProductFamily;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductFamilyRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ProductFamilyService {

    private final ProductFamilyRepository repository;

    public List<ProductFamily> findAll() {
        return repository.findAll();
    }

    @Transactional
    public ProductFamily create(CreateProductFamilyRequest request) {
        ProductFamily entity = ProductFamily.builder()
                .name(request.name())
                .build();
        return repository.save(entity);
    }

    @Transactional
    public ProductFamily update(Long id, UpdateProductFamilyRequest request) {
        ProductFamily entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ProductFamily not found: " + id));

        entity.setName(request.name());

        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("ProductFamily not found: " + id);
        }
        repository.deleteById(id);
    }
}
