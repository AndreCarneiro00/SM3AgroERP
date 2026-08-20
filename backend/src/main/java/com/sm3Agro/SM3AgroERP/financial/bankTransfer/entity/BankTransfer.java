package com.sm3Agro.SM3AgroERP.financial.bankTransfer.entity;

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
@Table(name = "bank_transfer")
public class BankTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "source_bank_account_id", nullable = false)
    private BankAccount sourceBankAccount;

    @ManyToOne(optional = false)
    @JoinColumn(name = "destination_bank_account_id", nullable = false)
    private BankAccount destinationBankAccount;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "transfer_date", nullable = false)
    private LocalDate transferDate;

    private String observation;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CashMovementStatus status = CashMovementStatus.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "cancel_id")
    private BankTransfer cancelTransfer;
}
