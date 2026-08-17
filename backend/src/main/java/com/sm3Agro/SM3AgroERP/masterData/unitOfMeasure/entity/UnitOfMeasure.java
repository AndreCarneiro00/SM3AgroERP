package com.sm3Agro.SM3AgroERP.masterData.unitOfMeasure.entity;

import com.sm3Agro.SM3AgroERP.masterData.baseUnit.entity.BaseUnit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "unit_of_measure")
public class UnitOfMeasure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "base_unit_id", nullable = false)
    private BaseUnit baseUnit;

    @Builder.Default
    @Column(name = "conversion_factor", nullable = false)
    private BigDecimal conversionFactor = BigDecimal.ONE;
}
