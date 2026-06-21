package com.sm3Agro.SM3AgroERP.inventory.controller;

import com.sm3Agro.SM3AgroERP.inventory.dto.baseUnit.CreateBaseUnitRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.baseUnit.CreateBaseUnitResponse;
import com.sm3Agro.SM3AgroERP.inventory.dto.baseUnit.FindAllBaseUnitResponse;
import com.sm3Agro.SM3AgroERP.inventory.dto.baseUnit.UpdateBaseUnitRequest;
import com.sm3Agro.SM3AgroERP.inventory.dto.baseUnit.UpdateBaseUnitResponse;
import com.sm3Agro.SM3AgroERP.inventory.entity.BaseUnit;
import com.sm3Agro.SM3AgroERP.inventory.service.BaseUnitService;
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
@RequestMapping("/base-unit")
public class BaseUnitController {

    private final BaseUnitService service;

    @GetMapping
    public List<FindAllBaseUnitResponse> findAllBaseUnit() {
        List<BaseUnit> baseUnits = service.findAll();
        return baseUnits.stream()
                .map(baseUnit -> new FindAllBaseUnitResponse(
                        baseUnit.getId(),
                        baseUnit.getName()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateBaseUnitResponse createBaseUnit(@RequestBody CreateBaseUnitRequest request) {
        BaseUnit created = service.create(request);
        return new CreateBaseUnitResponse(
                created.getId(),
                created.getName()
        );
    }

    @PutMapping("/{id}")
    public UpdateBaseUnitResponse updateBaseUnit(@PathVariable Long id, @RequestBody UpdateBaseUnitRequest request) {
        BaseUnit updated = service.update(id, request);
        return new UpdateBaseUnitResponse(
                updated.getId(),
                updated.getName()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteBaseUnit(@PathVariable Long id) {
        service.delete(id);
    }
}
