package com.sm3Agro.SM3AgroERP.financial.bankTransfer.repository;

import com.sm3Agro.SM3AgroERP.financial.bankTransfer.entity.BankTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BankTransferRepository extends JpaRepository<BankTransfer, Long> {

    @Query("""
            select bankTransfer
            from BankTransfer bankTransfer
            where (:startDate is null or bankTransfer.transferDate >= :startDate)
              and (:endDate is null or bankTransfer.transferDate <= :endDate)
            order by bankTransfer.transferDate desc, bankTransfer.id desc
            """)
    List<BankTransfer> findAllByTransferDatePeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<BankTransfer> findBySourceBankAccountIdOrDestinationBankAccountId(
            Long sourceBankAccountId,
            Long destinationBankAccountId
    );
}
