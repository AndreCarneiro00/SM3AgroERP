package com.sm3Agro.SM3AgroERP.counterparty.controller;

import com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty.CreateCounterpartyRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty.CreateCounterpartyResponse;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty.FindAllCounterpartyResponse;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty.UpdateCounterpartyRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty.UpdateCounterpartyResponse;
import com.sm3Agro.SM3AgroERP.counterparty.entity.Counterparty;
import com.sm3Agro.SM3AgroERP.counterparty.service.CounterpartyService;
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
@RequestMapping("/counterparty")
public class CounterpartyController {

    private final CounterpartyService service;

    @GetMapping
    public List<FindAllCounterpartyResponse> findAllCounterparty() {
        List<Counterparty> counterparties = service.findAll();
        return counterparties.stream()
                .map(this::toFindAllResponse)
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateCounterpartyResponse createCounterparty(@RequestBody CreateCounterpartyRequest request) {
        Counterparty created = service.create(request);
        return toCreateResponse(created);
    }

    @PutMapping("/{id}")
    public UpdateCounterpartyResponse updateCounterparty(
            @PathVariable Long id,
            @RequestBody UpdateCounterpartyRequest request
    ) {
        Counterparty updated = service.update(id, request);
        return toUpdateResponse(updated);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteCounterparty(@PathVariable Long id) {
        service.delete(id);
    }

    private FindAllCounterpartyResponse toFindAllResponse(Counterparty counterparty) {
        return new FindAllCounterpartyResponse(
                counterparty.getId(),
                counterparty.getCounterpartyType() != null ? counterparty.getCounterpartyType().getId() : null,
                counterparty.getCounterpartyType() != null ? counterparty.getCounterpartyType().getName() : null,
                counterparty.getLegalName(),
                counterparty.getTradeName(),
                counterparty.getCity(),
                counterparty.getState(),
                counterparty.getPhoneNumber(),
                counterparty.getEmail(),
                counterparty.getDocument(),
                counterparty.getDocumentType(),
                counterparty.getSegment() != null ? counterparty.getSegment().getId() : null,
                counterparty.getSegment() != null ? counterparty.getSegment().getName() : null,
                counterparty.getActive()
        );
    }

    private CreateCounterpartyResponse toCreateResponse(Counterparty counterparty) {
        return new CreateCounterpartyResponse(
                counterparty.getId(),
                counterparty.getCounterpartyType() != null ? counterparty.getCounterpartyType().getId() : null,
                counterparty.getCounterpartyType() != null ? counterparty.getCounterpartyType().getName() : null,
                counterparty.getLegalName(),
                counterparty.getTradeName(),
                counterparty.getCity(),
                counterparty.getState(),
                counterparty.getPhoneNumber(),
                counterparty.getEmail(),
                counterparty.getDocument(),
                counterparty.getDocumentType(),
                counterparty.getSegment() != null ? counterparty.getSegment().getId() : null,
                counterparty.getSegment() != null ? counterparty.getSegment().getName() : null,
                counterparty.getActive()
        );
    }

    private UpdateCounterpartyResponse toUpdateResponse(Counterparty counterparty) {
        return new UpdateCounterpartyResponse(
                counterparty.getId(),
                counterparty.getCounterpartyType() != null ? counterparty.getCounterpartyType().getId() : null,
                counterparty.getCounterpartyType() != null ? counterparty.getCounterpartyType().getName() : null,
                counterparty.getLegalName(),
                counterparty.getTradeName(),
                counterparty.getCity(),
                counterparty.getState(),
                counterparty.getPhoneNumber(),
                counterparty.getEmail(),
                counterparty.getDocument(),
                counterparty.getDocumentType(),
                counterparty.getSegment() != null ? counterparty.getSegment().getId() : null,
                counterparty.getSegment() != null ? counterparty.getSegment().getName() : null,
                counterparty.getActive()
        );
    }
}
