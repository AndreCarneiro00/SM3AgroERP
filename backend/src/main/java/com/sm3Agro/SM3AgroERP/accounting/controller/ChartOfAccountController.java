package com.sm3Agro.SM3AgroERP.accounting.controller;

import com.sm3Agro.SM3AgroERP.accounting.dto.chartOfAccount.CreateChartOfAccountRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.chartOfAccount.CreateChartOfAccountResponse;
import com.sm3Agro.SM3AgroERP.accounting.dto.chartOfAccount.FindAllChartOfAccountResponse;
import com.sm3Agro.SM3AgroERP.accounting.dto.chartOfAccount.UpdateChartOfAccountRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.chartOfAccount.UpdateChartOfAccountResponse;
import com.sm3Agro.SM3AgroERP.accounting.entity.ChartOfAccount;
import com.sm3Agro.SM3AgroERP.accounting.service.ChartOfAccountService;
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
@RequestMapping("/chart-of-account")
public class ChartOfAccountController {

    private final ChartOfAccountService service;

    @GetMapping
    public List<FindAllChartOfAccountResponse> findAllChartOfAccount() {
        List<ChartOfAccount> chartOfAccounts = service.findAll();
        return chartOfAccounts.stream()
                .map(this::toFindAllResponse)
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateChartOfAccountResponse createChartOfAccount(@RequestBody CreateChartOfAccountRequest request) {
        ChartOfAccount created = service.create(request);
        return toCreateResponse(created);
    }

    @PutMapping("/{id}")
    public UpdateChartOfAccountResponse updateChartOfAccount(
            @PathVariable Long id,
            @RequestBody UpdateChartOfAccountRequest request
    ) {
        ChartOfAccount updated = service.update(id, request);
        return toUpdateResponse(updated);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteChartOfAccount(@PathVariable Long id) {
        service.delete(id);
    }

    private FindAllChartOfAccountResponse toFindAllResponse(ChartOfAccount chartOfAccount) {
        return new FindAllChartOfAccountResponse(
                chartOfAccount.getId(),
                chartOfAccount.getName(),
                chartOfAccount.getParent() != null ? chartOfAccount.getParent().getId() : null,
                chartOfAccount.getType(),
                chartOfAccount.getAcceptsTransaction(),
                chartOfAccount.getActive(),
                chartOfAccount.getCode()
        );
    }

    private CreateChartOfAccountResponse toCreateResponse(ChartOfAccount chartOfAccount) {
        return new CreateChartOfAccountResponse(
                chartOfAccount.getId(),
                chartOfAccount.getName(),
                chartOfAccount.getParent() != null ? chartOfAccount.getParent().getId() : null,
                chartOfAccount.getType(),
                chartOfAccount.getAcceptsTransaction(),
                chartOfAccount.getActive(),
                chartOfAccount.getCode()
        );
    }

    private UpdateChartOfAccountResponse toUpdateResponse(ChartOfAccount chartOfAccount) {
        return new UpdateChartOfAccountResponse(
                chartOfAccount.getId(),
                chartOfAccount.getName(),
                chartOfAccount.getParent() != null ? chartOfAccount.getParent().getId() : null,
                chartOfAccount.getType(),
                chartOfAccount.getAcceptsTransaction(),
                chartOfAccount.getActive(),
                chartOfAccount.getCode()
        );
    }
}
