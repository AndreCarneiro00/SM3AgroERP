package com.sm3Agro.SM3AgroERP.financial.transaction.support;

import com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.entity.ChartOfAccount;
import com.sm3Agro.SM3AgroERP.masterData.costCenter.entity.CostCenter;
import com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.enums.ChartOfAccountType;
import com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.repository.ChartOfAccountRepository;
import com.sm3Agro.SM3AgroERP.masterData.costCenter.repository.CostCenterRepository;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.repository.BankAccountRepository;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.repository.BankTransferRepository;
import com.sm3Agro.SM3AgroERP.masterData.counterparty.entity.Counterparty;
import com.sm3Agro.SM3AgroERP.masterData.counterparty.repository.CounterpartyRepository;
import com.sm3Agro.SM3AgroERP.masterData.counterpartyType.entity.CounterpartyType;
import com.sm3Agro.SM3AgroERP.masterData.counterpartyType.repository.CounterpartyTypeRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.storage.AttachmentStorageProperties;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionAttachmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentAllocationRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.masterData.documentType.entity.DocumentType;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionItem;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import com.sm3Agro.SM3AgroERP.masterData.documentType.repository.DocumentTypeRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionAttachmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentAllocationRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionItemRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionRepository;
import com.sm3Agro.SM3AgroERP.masterData.baseUnit.entity.BaseUnit;
import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
import com.sm3Agro.SM3AgroERP.masterData.unitOfMeasure.entity.UnitOfMeasure;
import com.sm3Agro.SM3AgroERP.masterData.product.enums.ProductType;
import com.sm3Agro.SM3AgroERP.masterData.baseUnit.repository.BaseUnitRepository;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.repository.InventoryAdjustmentRepository;
import com.sm3Agro.SM3AgroERP.inventory.batch.repository.InventoryBatchRepository;
import com.sm3Agro.SM3AgroERP.inventory.movement.repository.InventoryMovementRepository;
import com.sm3Agro.SM3AgroERP.masterData.product.repository.ProductRepository;
import com.sm3Agro.SM3AgroERP.masterData.unitOfMeasure.repository.UnitOfMeasureRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public abstract class AbstractFinancialTransactionIT {

    @Autowired
    protected FinancialTransactionRepository financialTransactionRepository;
    @Autowired
    protected FinancialTransactionItemRepository financialTransactionItemRepository;
    @Autowired
    protected FinancialTransactionAttachmentRepository financialTransactionAttachmentRepository;
    @Autowired
    protected FinancialTransactionFulfillmentRepository financialTransactionFulfillmentRepository;
    @Autowired
    protected FinancialTransactionFulfillmentAllocationRepository financialTransactionFulfillmentAllocationRepository;
    @Autowired
    protected CounterpartyRepository counterpartyRepository;
    @Autowired
    protected CounterpartyTypeRepository counterpartyTypeRepository;
    @Autowired
    protected ChartOfAccountRepository chartOfAccountRepository;
    @Autowired
    protected CostCenterRepository costCenterRepository;
    @Autowired
    protected DocumentTypeRepository documentTypeRepository;
    @Autowired
    protected BankAccountRepository bankAccountRepository;
    @Autowired
    protected BankTransferRepository bankTransferRepository;
    @Autowired
    protected ProductRepository productRepository;
    @Autowired
    protected InventoryBatchRepository inventoryBatchRepository;
    @Autowired
    protected InventoryMovementRepository inventoryMovementRepository;
    @Autowired
    protected InventoryAdjustmentRepository inventoryAdjustmentRepository;
    @Autowired
    protected UnitOfMeasureRepository unitOfMeasureRepository;
    @Autowired
    protected BaseUnitRepository baseUnitRepository;
    @Autowired
    protected AttachmentStorageProperties attachmentStorageProperties;

    @BeforeEach
    @AfterEach
    void cleanupFinancialData() {
        cleanupAttachmentStorage();
        bankTransferRepository.deleteAll();
        financialTransactionFulfillmentAllocationRepository.deleteAll();
        financialTransactionFulfillmentRepository.deleteAll();
        financialTransactionAttachmentRepository.deleteAll();
        inventoryAdjustmentRepository.deleteAll();
        inventoryMovementRepository.deleteAll();
        inventoryBatchRepository.deleteAll();
        financialTransactionItemRepository.deleteAll();
        financialTransactionRepository.deleteAll();
        documentTypeRepository.deleteAll();
        bankAccountRepository.deleteAll();
        productRepository.deleteAll();
        unitOfMeasureRepository.deleteAll();
        baseUnitRepository.deleteAll();
        counterpartyRepository.deleteAll();
        counterpartyTypeRepository.deleteAll();
        costCenterRepository.deleteAll();
        chartOfAccountRepository.deleteAll();
    }

    protected void cleanupAttachmentStorage() {
        Path rootPath = getAttachmentStorageRootPath();

        if (!Files.exists(rootPath)) {
            return;
        }

        try (var paths = Files.walk(rootPath)) {
            paths.sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException exception) {
                            throw new UncheckedIOException(exception);
                        }
                    });
        } catch (IOException exception) {
            throw new IllegalStateException("Could not clean attachment storage root.", exception);
        }
    }

    protected Counterparty createCounterparty() {
        CounterpartyType type = counterpartyTypeRepository.save(
                CounterpartyType.builder()
                        .name("Supplier")
                        .description("Test type")
                        .build()
        );

        return counterpartyRepository.save(
                Counterparty.builder()
                        .counterpartyType(type)
                        .legalName("Fornecedor Teste")
                        .active(true)
                        .build()
        );
    }

    protected ChartOfAccount createChartOfAccount() {
        return chartOfAccountRepository.save(
                ChartOfAccount.builder()
                        .name("Expenses")
                        .type(ChartOfAccountType.EXPENSE)
                        .acceptsTransaction(true)
                        .active(true)
                        .code("EXP-01")
                        .build()
        );
    }

    protected CostCenter createCostCenter() {
        return costCenterRepository.save(
                CostCenter.builder()
                        .name("Farm Cost Center")
                        .acceptsTransaction(true)
                        .active(true)
                        .code("CC-01")
                        .build()
        );
    }

    protected Product createProduct() {
        BaseUnit baseUnit = baseUnitRepository.save(
                BaseUnit.builder()
                        .name("Kilogram")
                        .build()
        );

        UnitOfMeasure unit = unitOfMeasureRepository.save(
                UnitOfMeasure.builder()
                        .name("Kg")
                        .baseUnit(baseUnit)
                        .conversionFactor(BigDecimal.ONE)
                        .build()
        );

        return productRepository.save(
                Product.builder()
                        .name("Fertilizer")
                        .unit(unit)
                        .productType(ProductType.RAW_MATERIAL)
                        .active(true)
                        .hasStock(false)
                        .build()
        );
    }

    protected Product createStockControlledProduct(LocalDate stockControlStartDate) {
        BaseUnit baseUnit = baseUnitRepository.save(
                BaseUnit.builder()
                        .name("Stock kilogram")
                        .build()
        );

        UnitOfMeasure unit = unitOfMeasureRepository.save(
                UnitOfMeasure.builder()
                        .name("Stock Kg")
                        .baseUnit(baseUnit)
                        .conversionFactor(BigDecimal.ONE)
                        .build()
        );

        return productRepository.save(
                Product.builder()
                        .name("Stock Fertilizer")
                        .unit(unit)
                        .productType(ProductType.RAW_MATERIAL)
                        .active(true)
                        .hasStock(true)
                        .stockControlStartDate(stockControlStartDate)
                        .build()
        );
    }

    protected DocumentType createDocumentType() {
        return documentTypeRepository.save(
                DocumentType.builder()
                        .name("Invoice")
                        .build()
        );
    }

    protected BankAccount createBankAccount() {
        return bankAccountRepository.save(
                BankAccount.builder()
                        .name("Main Account")
                        .active(true)
                        .initialBalance(new BigDecimal("1000.00"))
                        .initialBalanceDate(LocalDate.of(2026, 6, 1))
                        .build()
        );
    }

    protected FinancialTransaction createPersistedTransaction() {
        return financialTransactionRepository.save(
                FinancialTransaction.builder()
                        .description("Transaction Base")
                        .counterparty(createCounterparty())
                        .issueDate(LocalDate.of(2026, 6, 29))
                        .documentNumber("FT-001")
                        .status(com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionStatus.PENDING)
                        .type(FinancialTransactionType.EXPENSE)
                        .hasNf(false)
                        .totalAmount(new BigDecimal("100.00"))
                        .build()
        );
    }

    protected FinancialTransactionItem createPersistedTransactionItem(FinancialTransaction transaction) {
        return financialTransactionItemRepository.save(
                FinancialTransactionItem.builder()
                        .financialTransaction(transaction)
                        .chartOfAccount(createChartOfAccount())
                        .costCenter(createCostCenter())
                        .quantity(new BigDecimal("1.00"))
                        .unitPrice(new BigDecimal("100.00"))
                        .amount(new BigDecimal("100.00"))
                        .product(createProduct())
                        .build()
        );
    }

    protected MockMultipartFile createAttachmentFile() {
        return new MockMultipartFile(
                "files",
                "invoice.pdf",
                "application/pdf",
                "invoice attachment content".getBytes(StandardCharsets.UTF_8)
        );
    }

    protected List<MultipartFile> createAttachmentFiles() {
        return List.of(createAttachmentFile());
    }

    protected Path getAttachmentStorageRootPath() {
        return Path.of(attachmentStorageProperties.getLocalRoot())
                .toAbsolutePath()
                .normalize();
    }

    protected Path resolveStoredAttachmentPath(String storagePath) {
        return getAttachmentStorageRootPath().resolve(storagePath).normalize();
    }

    protected CreateFinancialTransactionRequest createValidRequest() {
        Counterparty counterparty = createCounterparty();
        ChartOfAccount chartOfAccount = createChartOfAccount();
        CostCenter costCenter = createCostCenter();
        Product product = createProduct();
        DocumentType documentType = createDocumentType();
        BankAccount bankAccount = createBankAccount();

        return new CreateFinancialTransactionRequest(
                "Purchase fertilizer",
                counterparty.getId(),
                LocalDate.of(2026, 6, 29),
                LocalDate.of(2026, 7, 10),
                "DOC-001",
                FinancialTransactionType.EXPENSE,
                "Created in test",
                true,
                List.of(
                        new FinancialTransactionItemRequest(
                                chartOfAccount.getId(),
                                costCenter.getId(),
                                new BigDecimal("2.00"),
                                new BigDecimal("50.00"),
                                new BigDecimal("100.00"),
                                product.getId()
                        )
                ),
                List.of(
                        new FinancialTransactionAttachmentRequest(
                                documentType.getId(),
                                0,
                                "invoice attachment"
                        )
                ),
                List.of(
                        new FinancialTransactionFulfillmentRequest(
                                bankAccount.getId(),
                                LocalDate.of(2026, 6, 29),
                                new BigDecimal("100.00"),
                                "paid at launch",
                                List.of(new FinancialTransactionFulfillmentAllocationRequest(
                                        null,
                                        0,
                                        new BigDecimal("100.00")
                                ))
                        )
                )
        );
    }
}

