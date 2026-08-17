package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.sm3Agro.SM3AgroERP.inventory.dto.inventoryBatch.InventoryBatchResponse;
import com.sm3Agro.SM3AgroERP.inventory.repository.InventoryBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/inventory-batches")
public class InventoryBatchController {

    private final InventoryBatchRepository repository;

    @GetMapping
    public List<InventoryBatchResponse> findAllInventoryBatches() {
        return repository.findAllByOrderByBatchDateDescIdDesc()
                .stream()
                .map(inventoryBatch -> new InventoryBatchResponse(
                        inventoryBatch.getId(),
                        inventoryBatch.getProduct().getId(),
                        inventoryBatch.getCode(),
                        inventoryBatch.getBatchDate(),
                        inventoryBatch.getStatus(),
                        inventoryBatch.getUnitCost(),
                        inventoryBatch.getQuantity()
                ))
                .toList();
    }
}
