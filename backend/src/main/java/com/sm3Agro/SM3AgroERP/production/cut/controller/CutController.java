package com.sm3Agro.SM3AgroERP.production.cut.controller;

import com.sm3Agro.SM3AgroERP.production.cut.dto.CutResponse;
import com.sm3Agro.SM3AgroERP.production.cut.dto.LaunchCutRequest;
import com.sm3Agro.SM3AgroERP.production.cut.service.CutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/cuts")
public class CutController {

    private final CutService service;

    @GetMapping
    public List<CutResponse> findAllCuts() {
        return service.findAll();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CutResponse launchCut(@RequestBody LaunchCutRequest request) {
        return service.launch(request);
    }

    @PostMapping("/{id}/cancel")
    public CutResponse cancelCut(@PathVariable Long id) {
        return service.cancel(id);
    }
}
