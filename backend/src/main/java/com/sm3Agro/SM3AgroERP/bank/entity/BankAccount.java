package com.sm3Agro.SM3AgroERP.bank.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "bank_account")
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_type")
    private String accountType;

    @Column(name = "account_group")
    private String accountGroup;

    @Column(nullable = false)
    private String name;

    @Builder.Default
    @Column(columnDefinition = "BOOLEAN DEFAULT 1")
    private Boolean active = true;

    @Column(name = "initial_balance")
    private BigDecimal initialBalance;

    @Column(name = "initial_balance_date")
    private LocalDate initialBalanceDate;

    @Column(name = "financial_institution")
    private String financialInstitution;

    private String agency;

    @Column(name = "account_number")
    private String accountNumber;
}
