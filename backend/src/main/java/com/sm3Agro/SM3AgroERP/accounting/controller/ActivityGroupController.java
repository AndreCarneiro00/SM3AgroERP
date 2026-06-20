package com.sm3Agro.SM3AgroERP.accounting.controller;

import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.CreateActivityGroupRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.CreateActivityGroupResponse;
import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.FindAllActivityGroupResponse;
import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.UpdateActivityGroupRequest;
import com.sm3Agro.SM3AgroERP.accounting.dto.activityGroup.UpdateActivityGroupResponse;
import com.sm3Agro.SM3AgroERP.accounting.entity.ActivityGroup;
import com.sm3Agro.SM3AgroERP.accounting.service.ActivityGroupService;
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
@RequestMapping("/activity-group")
public class ActivityGroupController {

    private final ActivityGroupService service;

    @GetMapping
    public List<FindAllActivityGroupResponse> findAllActivityGroup() {
        List<ActivityGroup> activityGroups = service.findAll();
        return activityGroups.stream()
                .map(group -> new FindAllActivityGroupResponse(
                        group.getId(),
                        group.getName()
                ))
                .toList();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public CreateActivityGroupResponse createActivityGroup(@RequestBody CreateActivityGroupRequest request) {
        ActivityGroup created = service.create(request);

        return new CreateActivityGroupResponse(
                created.getId(),
                created.getName()
        );
    }

    @PutMapping("/{id}")
    public UpdateActivityGroupResponse updateActivityGroup(@PathVariable Long id, @RequestBody UpdateActivityGroupRequest request) {
        ActivityGroup created = service.update(id, request);
        return new UpdateActivityGroupResponse(
                id,
                created.getName()
        );
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteActivityGroup(@PathVariable Long id) {
        service.delete(id);
    }

}
