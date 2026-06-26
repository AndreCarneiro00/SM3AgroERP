package com.sm3Agro.SM3AgroERP.production.controller;

import com.sm3Agro.SM3AgroERP.production.dto.field.CreateFieldRequest;
import com.sm3Agro.SM3AgroERP.production.dto.field.CreateFieldResponse;
import com.sm3Agro.SM3AgroERP.production.dto.field.FindAllFieldResponse;
import com.sm3Agro.SM3AgroERP.production.dto.field.UpdateFieldRequest;
import com.sm3Agro.SM3AgroERP.production.dto.field.UpdateFieldResponse;
import com.sm3Agro.SM3AgroERP.production.entity.Field;
import com.sm3Agro.SM3AgroERP.production.service.FieldService;
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
@RequestMapping("/field")
public class FieldController {

    private final FieldService service;

    @GetMapping
    public List<FindAllFieldResponse> findAllField() {
        List<Field> fields = service.findAll();
        return fields.stream()
                .map(field -> new FindAllFieldResponse(
                        field.getId(),
                        field.getName(),
                        field.getAreaHectares()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateFieldResponse createField(@RequestBody CreateFieldRequest request) {
        Field created = service.create(request);
        return new CreateFieldResponse(
                created.getId(),
                created.getName(),
                created.getAreaHectares()
        );
    }

    @PutMapping("/{id}")
    public UpdateFieldResponse updateField(@PathVariable Long id, @RequestBody UpdateFieldRequest request) {
        Field updated = service.update(id, request);
        return new UpdateFieldResponse(
                updated.getId(),
                updated.getName(),
                updated.getAreaHectares()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteField(@PathVariable Long id) {
        service.delete(id);
    }
}
