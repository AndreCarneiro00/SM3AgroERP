package com.sm3Agro.SM3AgroERP.inventory.entity;

import com.sm3Agro.SM3AgroERP.inventory.enums.InventoryAdjustmentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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
@Table(name = "inventory_adjustment")
public class InventoryAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryAdjustmentType type;

    @ManyToOne(optional = false)
    @JoinColumn(name = "root_cause_id", nullable = false)
    private AdjustmentRootCause rootCause;

    private String observation;

    @OneToOne(optional = false)
    @JoinColumn(name = "inventory_movement_id", nullable = false)
    private InventoryMovement inventoryMovement;
}
