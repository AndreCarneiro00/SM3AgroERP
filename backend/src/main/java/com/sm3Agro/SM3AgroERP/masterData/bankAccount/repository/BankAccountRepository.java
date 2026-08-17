package com.sm3Agro.SM3AgroERP.masterData.bankAccount.repository;

import com.sm3Agro.SM3AgroERP.masterData.bankAccount.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
}
