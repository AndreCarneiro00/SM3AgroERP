package com.sm3Agro.SM3AgroERP.production.productionBatch.controller;

import com.sm3Agro.SM3AgroERP.production.productionBatch.dto.ProductionBatchResponse;
import com.sm3Agro.SM3AgroERP.production.productionBatch.repository.ProductionBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/production-batches")
public class ProductionBatchController {

    private final ProductionBatchRepository repository;

    @GetMapping
    public List<ProductionBatchResponse> findAllProductionBatches() {
        return repository.findAllByOrderByIdDesc()
                .stream()
                .map(productionBatch -> new ProductionBatchResponse(
                        productionBatch.getId(),
                        productionBatch.getInventoryBatch().getId(),
                        productionBatch.getInventoryMovement().getId(),
                        productionBatch.getQuantity(),
                        productionBatch.getQualityGrade(),
                        productionBatch.getCut().getId(),
                        productionBatch.getObservation()
                ))
                .toList();
    }
}
