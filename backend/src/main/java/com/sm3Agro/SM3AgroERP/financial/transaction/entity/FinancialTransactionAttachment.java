package com.sm3Agro.SM3AgroERP.financial.transaction.entity;

import com.sm3Agro.SM3AgroERP.financial.masterData.entity.DocumentType;
import jakarta.persistence.Column;
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

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "financial_transaction_attachment")
public class FinancialTransactionAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "financial_transaction_id", nullable = false)
    private FinancialTransaction financialTransaction;

    @Column(nullable = false)
    private String fileName;

    private String declaredContentType;

    private Long sizeBytes;

    @ManyToOne(optional = false)
    @JoinColumn(name = "document_type_id", nullable = false)
    private DocumentType documentType;

    @Column(nullable = false)
    private String storageProvider;

    private String storagePath;

    private String externalFileId;

    private String externalParentId;

    private String webUrl;

    private String checksumSha256;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    private String observation;
}
