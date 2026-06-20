package com.sm3Agro.SM3AgroERP.accounting.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import com.sm3Agro.SM3AgroERP.accounting.enums.CostCenterType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "cost_center")
public class CostCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private CostCenterType type;

    private Boolean acceptsTransaction;

    private Boolean active = true;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private CostCenter parent;

    @ManyToOne
    @JoinColumn(name = "activity_group_id")
    private ActivityGroup activityGroup;

    private String code;
}