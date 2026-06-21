package com.sm3Agro.SM3AgroERP.counterparty.controller;

import com.sm3Agro.SM3AgroERP.counterparty.dto.segment.CreateSegmentRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.segment.CreateSegmentResponse;
import com.sm3Agro.SM3AgroERP.counterparty.dto.segment.FindAllSegmentResponse;
import com.sm3Agro.SM3AgroERP.counterparty.dto.segment.UpdateSegmentRequest;
import com.sm3Agro.SM3AgroERP.counterparty.dto.segment.UpdateSegmentResponse;
import com.sm3Agro.SM3AgroERP.counterparty.entity.Segment;
import com.sm3Agro.SM3AgroERP.counterparty.service.SegmentService;
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
@RequestMapping("/segment")
public class SegmentController {

    private final SegmentService service;

    @GetMapping
    public List<FindAllSegmentResponse> findAllSegment() {
        List<Segment> segments = service.findAll();
        return segments.stream()
                .map(segment -> new FindAllSegmentResponse(
                        segment.getId(),
                        segment.getName()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateSegmentResponse createSegment(@RequestBody CreateSegmentRequest request) {
        Segment created = service.create(request);
        return new CreateSegmentResponse(
                created.getId(),
                created.getName()
        );
    }

    @PutMapping("/{id}")
    public UpdateSegmentResponse updateSegment(@PathVariable Long id, @RequestBody UpdateSegmentRequest request) {
        Segment updated = service.update(id, request);
        return new UpdateSegmentResponse(
                updated.getId(),
                updated.getName()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteSegment(@PathVariable Long id) {
        service.delete(id);
    }
}
