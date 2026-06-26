package com.sm3Agro.SM3AgroERP.accounting.entity;

import com.sm3Agro.SM3AgroERP.accounting.enums.ChartOfAccountType;
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

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "chart_of_account")
public class ChartOfAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private ChartOfAccount parent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChartOfAccountType type;

    @Builder.Default
    @Column(name = "accepts_transaction")
    private Boolean acceptsTransaction = true;

    @Builder.Default
    @Column(columnDefinition = "BOOLEAN DEFAULT 1")
    private Boolean active = true;

    private String code;
}
