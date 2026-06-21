package com.sm3Agro.SM3AgroERP.counterparty.controller;

import com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType.CreateCounterpartyTypeRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType.CreateCounterpartyTypeResponse;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType.FindAllCounterpartyTypeResponse;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType.UpdateCounterpartyTypeRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType.UpdateCounterpartyTypeResponse;
import com.sm3Agro.SM3AgroERP.counterparty.entity.CounterpartyType;
import com.sm3Agro.SM3AgroERP.counterparty.service.CounterpartyTypeService;
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
@RequestMapping("/counterparty-type")
public class CounterpartyTypeController {

    private final CounterpartyTypeService service;

    @GetMapping
    public List<FindAllCounterpartyTypeResponse> findAllCounterpartyType() {
        List<CounterpartyType> counterpartyTypes = service.findAll();
        return counterpartyTypes.stream()
                .map(counterpartyType -> new FindAllCounterpartyTypeResponse(
                        counterpartyType.getId(),
                        counterpartyType.getName(),
                        counterpartyType.getDescription(),
                        counterpartyType.getActive()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateCounterpartyTypeResponse createCounterpartyType(@RequestBody CreateCounterpartyTypeRequest request) {
        CounterpartyType created = service.create(request);
        return new CreateCounterpartyTypeResponse(
                created.getId(),
                created.getName(),
                created.getDescription(),
                created.getActive()
        );
    }

    @PutMapping("/{id}")
    public UpdateCounterpartyTypeResponse updateCounterpartyType(
            @PathVariable Long id,
            @RequestBody UpdateCounterpartyTypeRequest request
    ) {
        CounterpartyType updated = service.update(id, request);
        return new UpdateCounterpartyTypeResponse(
                updated.getId(),
                updated.getName(),
                updated.getDescription(),
                updated.getActive()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteCounterpartyType(@PathVariable Long id) {
        service.delete(id);
    }
}
