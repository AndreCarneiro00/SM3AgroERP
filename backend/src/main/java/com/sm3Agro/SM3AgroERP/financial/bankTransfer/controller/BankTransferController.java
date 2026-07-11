package com.sm3Agro.SM3AgroERP.financial.bankTransfer.controller;

import com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer.CreateBankTransferRequest;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer.CreateBankTransferResponse;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer.FindAllBankTransferResponse;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer.UpdateBankTransferRequest;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer.UpdateBankTransferResponse;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.entity.BankTransfer;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.service.BankTransferService;
import jakarta.validation.Valid;
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
@RequestMapping("/bank-transfers")
public class BankTransferController {

    private final BankTransferService service;

    @GetMapping
    public List<FindAllBankTransferResponse> findAllBankTransfers() {
        return service.findAll().stream()
                .map(this::toFindAllResponse)
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateBankTransferResponse createBankTransfer(
            @Valid @RequestBody CreateBankTransferRequest request
    ) {
        return toCreateResponse(service.create(request));
    }

    @PutMapping("/{id}")
    public UpdateBankTransferResponse updateBankTransfer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBankTransferRequest request
    ) {
        return toUpdateResponse(service.update(id, request));
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteBankTransfer(@PathVariable Long id) {
        service.delete(id);
    }

    private FindAllBankTransferResponse toFindAllResponse(BankTransfer bankTransfer) {
        return new FindAllBankTransferResponse(
                bankTransfer.getId(),
                bankTransfer.getSourceBankAccount().getId(),
                bankTransfer.getDestinationBankAccount().getId(),
                bankTransfer.getAmount(),
                bankTransfer.getTransferDate(),
                bankTransfer.getObservation()
        );
    }

    private CreateBankTransferResponse toCreateResponse(BankTransfer bankTransfer) {
        return new CreateBankTransferResponse(
                bankTransfer.getId(),
                bankTransfer.getSourceBankAccount().getId(),
                bankTransfer.getDestinationBankAccount().getId(),
                bankTransfer.getAmount(),
                bankTransfer.getTransferDate(),
                bankTransfer.getObservation()
        );
    }

    private UpdateBankTransferResponse toUpdateResponse(BankTransfer bankTransfer) {
        return new UpdateBankTransferResponse(
                bankTransfer.getId(),
                bankTransfer.getSourceBankAccount().getId(),
                bankTransfer.getDestinationBankAccount().getId(),
                bankTransfer.getAmount(),
                bankTransfer.getTransferDate(),
                bankTransfer.getObservation()
        );
    }
}
