package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.sm3Agro.SM3AgroERP.inventory.dto.inventoryAdjustment.InventoryAdjustmentResponse;
import com.sm3Agro.SM3AgroERP.inventory.repository.InventoryAdjustmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/inventory-adjustments")
public class InventoryAdjustmentController {

    private final InventoryAdjustmentRepository repository;

    @GetMapping
    public List<InventoryAdjustmentResponse> findAllInventoryAdjustments() {
        return repository.findAllByOrderByIdDesc()
                .stream()
                .map(inventoryAdjustment -> new InventoryAdjustmentResponse(
                        inventoryAdjustment.getId(),
                        inventoryAdjustment.getType(),
                        inventoryAdjustment.getRootCause().getId(),
                        inventoryAdjustment.getObservation(),
                        inventoryAdjustment.getInventoryMovement().getId()
                ))
                .toList();
    }
}
