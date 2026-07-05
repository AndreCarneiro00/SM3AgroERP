package com.sm3Agro.SM3AgroERP.financial.transaction.entity;

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
@Table(name = "financial_transaction_fulfillment_item_allocation")
public class FinancialTransactionFulfillmentAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fulfillment_id", nullable = false)
    private FinancialTransactionFulfillment fulfillment;

    @ManyToOne(optional = false)
    @JoinColumn(name = "financial_transaction_item_id", nullable = false)
    private FinancialTransactionItem financialTransactionItem;

    @Column(nullable = false)
    private BigDecimal amount;
}
