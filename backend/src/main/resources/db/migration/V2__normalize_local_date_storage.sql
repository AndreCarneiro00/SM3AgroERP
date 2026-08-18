-- Normalize LocalDate columns previously persisted by Hibernate/SQLite as epoch milliseconds.
UPDATE product
SET stock_control_start_date = strftime('%Y-%m-%d 00:00:00.000', CAST(stock_control_start_date AS INTEGER) / 1000, 'unixepoch', 'localtime')
WHERE stock_control_start_date IS NOT NULL
  AND instr(CAST(stock_control_start_date AS TEXT), '-') = 0;

UPDATE bank_account
SET initial_balance_date = strftime('%Y-%m-%d 00:00:00.000', CAST(initial_balance_date AS INTEGER) / 1000, 'unixepoch', 'localtime')
WHERE initial_balance_date IS NOT NULL
  AND instr(CAST(initial_balance_date AS TEXT), '-') = 0;

UPDATE cut
SET cut_date = strftime('%Y-%m-%d 00:00:00.000', CAST(cut_date AS INTEGER) / 1000, 'unixepoch', 'localtime')
WHERE cut_date IS NOT NULL
  AND instr(CAST(cut_date AS TEXT), '-') = 0;

UPDATE field_operation
SET operation_date = strftime('%Y-%m-%d 00:00:00.000', CAST(operation_date AS INTEGER) / 1000, 'unixepoch', 'localtime')
WHERE operation_date IS NOT NULL
  AND instr(CAST(operation_date AS TEXT), '-') = 0;

UPDATE financial_transaction
SET issue_date = strftime('%Y-%m-%d 00:00:00.000', CAST(issue_date AS INTEGER) / 1000, 'unixepoch', 'localtime')
WHERE issue_date IS NOT NULL
  AND instr(CAST(issue_date AS TEXT), '-') = 0;

UPDATE financial_transaction
SET due_date = strftime('%Y-%m-%d 00:00:00.000', CAST(due_date AS INTEGER) / 1000, 'unixepoch', 'localtime')
WHERE due_date IS NOT NULL
  AND instr(CAST(due_date AS TEXT), '-') = 0;

UPDATE financial_transaction_fulfillment
SET payment_date = strftime('%Y-%m-%d 00:00:00.000', CAST(payment_date AS INTEGER) / 1000, 'unixepoch', 'localtime')
WHERE payment_date IS NOT NULL
  AND instr(CAST(payment_date AS TEXT), '-') = 0;

UPDATE bank_transfer
SET transfer_date = strftime('%Y-%m-%d 00:00:00.000', CAST(transfer_date AS INTEGER) / 1000, 'unixepoch', 'localtime')
WHERE transfer_date IS NOT NULL
  AND instr(CAST(transfer_date AS TEXT), '-') = 0;

UPDATE inventory_batch
SET batch_date = strftime('%Y-%m-%d 00:00:00.000', CAST(batch_date AS INTEGER) / 1000, 'unixepoch', 'localtime')
WHERE batch_date IS NOT NULL
  AND instr(CAST(batch_date AS TEXT), '-') = 0;

UPDATE inventory_movement
SET movement_date = strftime('%Y-%m-%d 00:00:00.000', CAST(movement_date AS INTEGER) / 1000, 'unixepoch', 'localtime')
WHERE movement_date IS NOT NULL
  AND instr(CAST(movement_date AS TEXT), '-') = 0;

UPDATE cut
SET days_since_last_cut = (
    SELECT CAST(
        julianday(substr(CAST(cut.cut_date AS TEXT), 1, 10))
        - julianday(substr(CAST(previous.cut_date AS TEXT), 1, 10))
        AS INTEGER
    )
    FROM cut previous
    WHERE previous.field_id = cut.field_id
      AND previous.status = 'DONE'
      AND previous.id <> cut.id
      AND substr(CAST(previous.cut_date AS TEXT), 1, 10) < substr(CAST(cut.cut_date AS TEXT), 1, 10)
    ORDER BY substr(CAST(previous.cut_date AS TEXT), 1, 10) DESC, previous.id DESC
    LIMIT 1
)
WHERE days_since_last_cut IS NULL
  AND status = 'DONE'
  AND EXISTS (
      SELECT 1
      FROM cut previous
      WHERE previous.field_id = cut.field_id
        AND previous.status = 'DONE'
        AND previous.id <> cut.id
        AND substr(CAST(previous.cut_date AS TEXT), 1, 10) < substr(CAST(cut.cut_date AS TEXT), 1, 10)
  );
