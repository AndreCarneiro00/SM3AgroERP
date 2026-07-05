package com.sm3Agro.SM3AgroERP.financial.masterData.entity;

import com.sm3Agro.SM3AgroERP.accounting.entity.ChartOfAccount;
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

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "income_statement_relationship")
public class IncomeStatementRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "chart_of_account_id", nullable = false)
    private ChartOfAccount chartOfAccount;

    @ManyToOne(optional = false)
    @JoinColumn(name = "income_statement_group_id", nullable = false)
    private IncomeStatementGroup incomeStatementGroup;
}
