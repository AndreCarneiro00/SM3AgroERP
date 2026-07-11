package com.sm3Agro.SM3AgroERP.financial.bankTransfer.repository;

import com.sm3Agro.SM3AgroERP.financial.bankTransfer.entity.BankTransfer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BankTransferRepository extends JpaRepository<BankTransfer, Long> {

    List<BankTransfer> findBySourceBankAccountIdOrDestinationBankAccountId(
            Long sourceBankAccountId,
            Long destinationBankAccountId
    );
}
