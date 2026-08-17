package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.sm3Agro.SM3AgroERP.inventory.dto.inventoryMovement.InventoryMovementResponse;
import com.sm3Agro.SM3AgroERP.inventory.repository.InventoryMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/inventory-movements")
public class InventoryMovementController {

    private final InventoryMovementRepository repository;

    @GetMapping
    public List<InventoryMovementResponse> findAllInventoryMovements() {
        return repository.findAllByOrderByMovementDateDescIdDesc()
                .stream()
                .map(inventoryMovement -> new InventoryMovementResponse(
                        inventoryMovement.getId(),
                        inventoryMovement.getBatch().getId(),
                        inventoryMovement.getMovementType(),
                        inventoryMovement.getQuantity(),
                        inventoryMovement.getUnitCost(),
                        inventoryMovement.getMovementDate(),
                        inventoryMovement.getFinancialTransactionItemId()
                ))
                .toList();
    }
}
