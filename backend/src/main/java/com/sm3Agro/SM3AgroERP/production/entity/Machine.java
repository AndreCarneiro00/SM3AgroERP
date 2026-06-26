package com.sm3Agro.SM3AgroERP.production.entity;

import com.sm3Agro.SM3AgroERP.production.enums.MachineType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "machine")
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "machine_type", nullable = false)
    private MachineType machineType;

    private String manufacturer;

    private String model;

    private Integer year;

    @Builder.Default
    @Column(columnDefinition = "BOOLEAN DEFAULT 1")
    private Boolean active = true;

    private String observation;
}
