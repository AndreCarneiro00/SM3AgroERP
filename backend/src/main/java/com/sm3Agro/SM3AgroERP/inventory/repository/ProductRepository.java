package com.sm3Agro.SM3AgroERP.inventory.repository;

import com.sm3Agro.SM3AgroERP.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
