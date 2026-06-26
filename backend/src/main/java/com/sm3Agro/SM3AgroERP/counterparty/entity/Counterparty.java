package com.sm3Agro.SM3AgroERP.counterparty.entity;

import com.sm3Agro.SM3AgroERP.counterparty.enums.CounterpartyDocumentType;
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

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "counterparty")
public class Counterparty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "counterparty_type_id")
    private CounterpartyType counterpartyType;

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "trade_name")
    private String tradeName;

    private String city;

    private String state;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String email;

    private String document;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type")
    private CounterpartyDocumentType documentType;

    @ManyToOne
    @JoinColumn(name = "segment_id")
    private Segment segment;

    @Builder.Default
    @Column(columnDefinition = "BOOLEAN DEFAULT 1")
    private Boolean active = true;
}
