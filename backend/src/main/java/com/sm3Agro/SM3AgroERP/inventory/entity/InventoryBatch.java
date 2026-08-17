package com.sm3Agro.SM3AgroERP.inventory.entity;

import com.sm3Agro.SM3AgroERP.inventory.enums.InventoryBatchStatus;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "inventory_batch")
public class InventoryBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String code;

    @Column(name = "batch_date", nullable = false)
    private LocalDate batchDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryBatchStatus status = InventoryBatchStatus.ACTIVE;

    @Column(name = "unit_cost")
    private BigDecimal unitCost;

    @Builder.Default
    @Column(nullable = false)
    private BigDecimal quantity = BigDecimal.ZERO;

    public BigDecimal getUnitCost() {
        return normalizeMinimumScale(unitCost);
    }

    public BigDecimal getQuantity() {
        return normalizeMinimumScale(quantity);
    }

    private BigDecimal normalizeMinimumScale(BigDecimal value) {
        if (value == null || value.scale() >= 2) {
            return value;
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
