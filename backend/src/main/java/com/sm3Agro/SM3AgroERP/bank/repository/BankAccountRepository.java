package com.sm3Agro.SM3AgroERP.bank.repository;

import com.sm3Agro.SM3AgroERP.bank.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
}
