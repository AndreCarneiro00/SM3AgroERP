package com.sm3Agro.SM3AgroERP.production.entity;

import com.sm3Agro.SM3AgroERP.inventory.entity.ProductFamily;
import com.sm3Agro.SM3AgroERP.production.enums.CutStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "cut")
public class Cut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_family_id", nullable = false)
    private ProductFamily productFamily;

    @Column(name = "cut_date", nullable = false)
    private LocalDate cutDate;

    @Column(name = "cut_number", nullable = false)
    private Integer cutNumber;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CutStatus status = CutStatus.DONE;

    private String observation;

    @Column(name = "days_since_last_cut")
    private Integer daysSinceLastCut;
}
