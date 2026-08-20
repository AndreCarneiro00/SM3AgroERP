ALTER TABLE financial_transaction_fulfillment
    ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE financial_transaction_fulfillment
    ADD COLUMN cancel_id INTEGER;

ALTER TABLE bank_transfer
    ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE bank_transfer
    ADD COLUMN cancel_id INTEGER;

-- ============================================================================
-- V4 SEED DATA: auditable cash movement examples
-- ============================================================================

INSERT INTO financial_transaction (
    id,
    description,
    counterparty_id,
    issue_date,
    due_date,
    document_number,
    status,
    type,
    observation,
    has_nf,
    total_amount
) VALUES
      (13, 'Venda cancelada - Haras Primavera', 2, '2025-06-06 00:00:00.000', '2025-06-18 00:00:00.000', 'NF-001237', 'CANCELED', 'INCOME', 'Exemplo de receita paga e estornada por ajuste de caixa', 1, 9000.00),
      (14, 'Manutencao cancelada - Mecanica Agricola Souza', 5, '2025-06-09 00:00:00.000', '2025-06-14 00:00:00.000', 'REC-0551', 'CANCELED', 'EXPENSE', 'Exemplo de despesa paga e estornada por ajuste de caixa', 0, 1800.00);

INSERT INTO financial_transaction_items (
    id,
    financial_transaction_id,
    chart_of_account_id,
    cost_center_id,
    quantity,
    unit_price,
    amount,
    product_id
) VALUES
      (13, 13, 8, 6, 1.00, 9000.00, 9000.00, NULL),
      (14, 14, 19, 12, 1.00, 1800.00, 1800.00, NULL);

INSERT INTO financial_transaction_fulfillment (
    id,
    financial_transaction_id,
    bank_account_id,
    payment_date,
    amount_paid,
    observation,
    status,
    cancel_id
) VALUES
      (7, 13, 1, '2025-06-06 00:00:00.000', 9000.00, 'Recebimento original cancelado por divergencia comercial', 'CANCELED', NULL),
      (8, 13, 1, '2025-06-24 00:00:00.000', 9000.00, 'Ajuste de estorno do recebimento cancelado', 'ADJUSTMENT', 7),
      (9, 14, 2, '2025-06-09 00:00:00.000', 1800.00, 'Pagamento original cancelado por nota rejeitada', 'CANCELED', NULL),
      (10, 14, 2, '2025-06-23 00:00:00.000', 1800.00, 'Ajuste de estorno do pagamento cancelado', 'ADJUSTMENT', 9);

INSERT INTO financial_transaction_fulfillment_item_allocation (
    id,
    fulfillment_id,
    financial_transaction_item_id,
    amount
) VALUES
      (7, 7, 13, 9000.00),
      (8, 9, 14, 1800.00);

INSERT INTO bank_transfer (
    id,
    source_bank_account_id,
    destination_bank_account_id,
    amount,
    transfer_date,
    observation,
    status,
    cancel_id
) VALUES
      (4, 1, 2, 3500.00, '2025-06-19 00:00:00.000', 'Transferencia cancelada para demonstrar auditoria de caixa', 'CANCELED', NULL),
      (5, 2, 1, 3500.00, '2025-06-24 00:00:00.000', 'Ajuste inverso da transferencia cancelada', 'ADJUSTMENT', 4);
