package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure.CreateUnitOfMeasureRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure.CreateUnitOfMeasureResponse;
import com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure.FindAllUnitOfMeasureResponse;
import com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure.UpdateUnitOfMeasureRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure.UpdateUnitOfMeasureResponse;
import com.sm3Agro.SM3AgroERP.inventory.entity.UnitOfMeasure;
import com.sm3Agro.SM3AgroERP.inventory.service.UnitOfMeasureService;
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
@RequestMapping("/unit-of-measure")
public class UnitOfMeasureController {

    private final UnitOfMeasureService service;

    @GetMapping
    public List<FindAllUnitOfMeasureResponse> findAllUnitOfMeasure() {
        List<UnitOfMeasure> unitOfMeasures = service.findAll();
        return unitOfMeasures.stream()
                .map(unitOfMeasure -> new FindAllUnitOfMeasureResponse(
                        unitOfMeasure.getId(),
                        unitOfMeasure.getName(),
                        unitOfMeasure.getBaseUnit().getId(),
                        unitOfMeasure.getBaseUnit().getName(),
                        unitOfMeasure.getConversionFactor()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateUnitOfMeasureResponse createUnitOfMeasure(@RequestBody CreateUnitOfMeasureRequest request) {
        UnitOfMeasure created = service.create(request);
        return new CreateUnitOfMeasureResponse(
                created.getId(),
                created.getName(),
                created.getBaseUnit().getId(),
                created.getBaseUnit().getName(),
                created.getConversionFactor()
        );
    }

    @PutMapping("/{id}")
    public UpdateUnitOfMeasureResponse updateUnitOfMeasure(
            @PathVariable Long id,
            @RequestBody UpdateUnitOfMeasureRequest request
    ) {
        UnitOfMeasure updated = service.update(id, request);
        return new UpdateUnitOfMeasureResponse(
                updated.getId(),
                updated.getName(),
                updated.getBaseUnit().getId(),
                updated.getBaseUnit().getName(),
                updated.getConversionFactor()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteUnitOfMeasure(@PathVariable Long id) {
        service.delete(id);
    }
}
