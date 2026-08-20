package com.sm3Agro.SM3AgroERP.financial.transaction.entity;

import com.sm3Agro.SM3AgroERP.financial.cashMovement.enums.CashMovementStatus;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.entity.BankAccount;
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
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "financial_transaction_fulfillment")
public class FinancialTransactionFulfillment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "financial_transaction_id", nullable = false)
    private FinancialTransaction financialTransaction;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;

    private LocalDate paymentDate;

    private BigDecimal amountPaid;

    private String observation;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CashMovementStatus status = CashMovementStatus.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "cancel_id")
    private FinancialTransactionFulfillment cancelFulfillment;
}
