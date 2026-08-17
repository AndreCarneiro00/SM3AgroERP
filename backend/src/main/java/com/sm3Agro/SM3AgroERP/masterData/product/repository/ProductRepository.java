package com.sm3Agro.SM3AgroERP.masterData.product.repository;

import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
