package com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.controller;

import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.dto.CreateAdjustmentRootCauseRequest;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.dto.CreateAdjustmentRootCauseResponse;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.dto.FindAllAdjustmentRootCauseResponse;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.dto.UpdateAdjustmentRootCauseRequest;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.dto.UpdateAdjustmentRootCauseResponse;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.entity.AdjustmentRootCause;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.service.AdjustmentRootCauseService;
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
@RequestMapping("/adjustment-root-cause")
public class AdjustmentRootCauseController {

    private final AdjustmentRootCauseService service;

    @GetMapping
    public List<FindAllAdjustmentRootCauseResponse> findAllAdjustmentRootCause() {
        List<AdjustmentRootCause> adjustmentRootCauses = service.findAll();
        return adjustmentRootCauses.stream()
                .map(adjustmentRootCause -> new FindAllAdjustmentRootCauseResponse(
                        adjustmentRootCause.getId(),
                        adjustmentRootCause.getName()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateAdjustmentRootCauseResponse createAdjustmentRootCause(
            @RequestBody CreateAdjustmentRootCauseRequest request
    ) {
        AdjustmentRootCause created = service.create(request);
        return new CreateAdjustmentRootCauseResponse(
                created.getId(),
                created.getName()
        );
    }

    @PutMapping("/{id}")
    public UpdateAdjustmentRootCauseResponse updateAdjustmentRootCause(
            @PathVariable Long id,
            @RequestBody UpdateAdjustmentRootCauseRequest request
    ) {
        AdjustmentRootCause updated = service.update(id, request);
        return new UpdateAdjustmentRootCauseResponse(
                updated.getId(),
                updated.getName()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteAdjustmentRootCause(@PathVariable Long id) {
        service.delete(id);
    }
}
