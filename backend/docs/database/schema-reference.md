# Database Schema Reference

Source migrations:

- `backend/src/main/resources/db/migration/V1__initial_shema.sql`
- `backend/src/main/resources/db/migration/V2__normalize_local_date_storage.sql`
- `backend/src/main/resources/db/migration/V3__point_cut_to_product.sql`
- `backend/src/main/resources/db/migration/V4__add_cash_movement_audit_fields.sql`

This document is an agent-facing map of the initial database. Use it when changing
backend entities, DTOs, services, Flyway migrations, frontend API models, or tests
that depend on persistence behavior.

## Agent Quick Rules

- Treat `V1__initial_shema.sql` as the V1 source of truth. For schema changes, add a
  new Flyway migration instead of editing V1 after it has been applied locally or in
  another environment.
- The runtime database is SQLite through Flyway/JPA. Boolean columns are stored as
  `0`/`1`, and `DATE`/`DATETIME` typing follows SQLite affinity rules.
- Foreign keys do not declare `ON DELETE` or `ON UPDATE` actions. Deletion and
  cancellation behavior must be handled explicitly in services/use cases.
- There are no secondary indexes in V1. Add indexes in a later migration when adding
  query paths that filter or join heavily.
- There are almost no uniqueness constraints. Do not assume `name`, `code`,
  `document`, `document_number`, or `inventory_batch.code` are unique unless a later
  migration adds that rule.
- Monetary and quantity fields use `REAL` in V1. Avoid exact floating-point
  comparisons in code and tests.
- Product stock control fields already exist in V1. The recreated database starts
  with stockable products classified and with seed data broad enough to exercise
  the main financial, inventory, and production screens.
- Persisted totals and balances are mostly denormalized conventions, not database
  guarantees. Services should keep totals, item sums, paid amounts, allocations, and
  inventory quantities consistent.
- Enum values are enforced by SQL `CHECK` constraints. When adding or renaming an enum
  value, update the SQL migration, Java enum, DTO validation, frontend model, and tests
  together.

## Backend Domain Ownership Map

This is the expected ownership by table responsibility. It does not guarantee that
every table already has a complete controller/service/repository stack.

| Backend package | Main tables |
| --- | --- |
| `accounting` | `chart_of_account`, `cost_center`, `activity_group` |
| `bank` | `bank_account` |
| `counterparty` | `counterparty`, `counterparty_type`, `segment` |
| `financial.masterData` | `document_type`, `income_statement_group`, `income_statement_relationship` |
| `financial.transaction` | `financial_transaction`, `financial_transaction_items`, `financial_transaction_fulfillment`, `financial_transaction_fulfillment_item_allocation`, `financial_transaction_attachment` |
| `financial.bankTransfer` | `bank_transfer` |
| `inventory` | `base_unit`, `unit_of_measure`, `product_family`, `product`, `inventory_batch`, `inventory_movement`, `inventory_adjustment`, `adjustment_root_causes` |
| `production` | `field`, `machine`, `cut`, `field_operation`, `field_operation_machine`, `field_operation_items`, `production_batch` |

## Relationship Map

```text
base_unit <- unit_of_measure <- product -> product_family
product <- cut -> field
field <- field_operation -> cut
field_operation <- field_operation_machine -> machine
field_operation <- field_operation_items -> product

counterparty_type <- counterparty -> segment
counterparty <- financial_transaction
financial_transaction <- financial_transaction_items -> chart_of_account
financial_transaction_items -> cost_center
financial_transaction_items -> product
financial_transaction <- financial_transaction_fulfillment -> bank_account
financial_transaction_fulfillment <- financial_transaction_fulfillment_item_allocation
financial_transaction_items <- financial_transaction_fulfillment_item_allocation
financial_transaction <- financial_transaction_attachment -> document_type

chart_of_account <- chart_of_account.parent_id
cost_center <- cost_center.parent_id
activity_group <- cost_center
chart_of_account <- income_statement_relationship -> income_statement_group

bank_account <- bank_transfer.source_bank_account_id
bank_account <- bank_transfer.destination_bank_account_id

product <- inventory_batch <- inventory_movement
financial_transaction_items <- inventory_movement
inventory_movement <- inventory_adjustment -> adjustment_root_causes
inventory_batch <- production_batch -> inventory_movement
cut <- production_batch
inventory_movement <- field_operation_items
```

## Table Catalog

### Base And Lookup Tables

`income_statement_group`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Group label for income statement reporting. |
| `display_order` | `INTEGER` | no | Optional ordering hint. |

`base_unit`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Base unit family, for example weight, volume, unit, or bale. |

`product_family`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Product grouping for reporting. |

`document_type`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Attachment/document classification. |

`counterparty_type`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Type such as customer, supplier, or service provider. |
| `description` | `TEXT` | no | Free-text detail. |
| `active` | `BOOLEAN` | yes | Defaults to `1`. Use for deactivation, not hard delete. |

`segment`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Commercial or operational segment. |

`activity_group`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Groups cost centers by activity. |

`adjustment_root_causes`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Reason catalog for inventory adjustments. |

### Units And Products

`unit_of_measure`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Operational unit label, for example `kg`, `l`, `un`, `fardo`. |
| `base_unit_id` | `INTEGER` | yes | FK to `base_unit.id`. |
| `conversion_factor` | `REAL` | yes | Defaults to `1`; factor to the base unit. |

`product`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Product/service name. |
| `unit_id` | `INTEGER` | yes | FK to `unit_of_measure.id`. |
| `product_family_id` | `INTEGER` | no | FK to `product_family.id`. Reporting classification only; production cuts point to `product.id`. |
| `product_type` | `TEXT` | yes | `RAW_MATERIAL`, `FINISHED_GOOD`, `CONSUMABLE`, `SPARE_PART`, `SERVICE`. |
| `active` | `BOOLEAN` | yes | Defaults to `1`. |
| `has_stock` | `BOOLEAN` | no | Stock control toggle. Seeded stock items start with `1`; service items can stay `0`. |
| `stock_control_start_date` | `DATE` | no | Required by service rules when `has_stock = 1`; stock flows only apply from this date forward. |

### Production Master Data

`field`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Field/plot name. |
| `area_hectares` | `REAL` | no | Area in hectares. |

`machine`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Machine/equipment name. |
| `machine_type` | `TEXT` | yes | `TRACTOR`, `BALER`, `MOWER`, `SPRAYER`, `FERTILIZER_SPREADER`, `IRRIGATION`, `PUMP`, `OTHER`. |
| `manufacturer` | `TEXT` | no | Manufacturer. |
| `model` | `TEXT` | no | Model. |
| `year` | `INTEGER` | no | Model or manufacture year. |
| `active` | `BOOLEAN` | yes | Defaults to `1`. |
| `observation` | `TEXT` | no | Free-text notes. |

### Banking And Counterparties

`bank_account`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `account_type` | `TEXT` | no | No SQL enum in V1. Seed uses `CHECKING` and `CASH`. |
| `account_group` | `TEXT` | no | No SQL enum in V1. Seed uses `OPERATING`, `RECEIVABLES`, `PETTY_CASH`. |
| `name` | `TEXT` | yes | Display name. |
| `active` | `BOOLEAN` | yes | Defaults to `1`. |
| `initial_balance` | `REAL` | yes | Defaults to `0`. |
| `initial_balance_date` | `DATE` | no | Seed inserts numeric epoch-like values; verify Java conversion before changing. |
| `financial_institution` | `TEXT` | no | Bank/institution name. |
| `agency` | `TEXT` | no | Branch/agency identifier. |
| `account_number` | `TEXT` | no | Account number. |

`counterparty`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `counterparty_type_id` | `INTEGER` | no | FK to `counterparty_type.id`. |
| `legal_name` | `TEXT` | yes | Legal name. |
| `trade_name` | `TEXT` | no | Commercial name. |
| `city` | `TEXT` | no | City. |
| `state` | `TEXT` | no | State/UF. |
| `phone_number` | `TEXT` | no | Phone. |
| `email` | `TEXT` | no | Email. |
| `document` | `TEXT` | no | CPF/CNPJ value; not unique in V1. |
| `document_type` | `TEXT` | no | `CPF` or `CNPJ`. |
| `segment_id` | `INTEGER` | no | FK to `segment.id`. |
| `active` | `BOOLEAN` | yes | Defaults to `1`. |

### Accounting And Managerial Classification

`chart_of_account`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Account name. |
| `parent_id` | `INTEGER` | no | Self-FK to `chart_of_account.id`. Enables hierarchy. |
| `type` | `TEXT` | yes | `INCOME`, `EXPENSE`, `TRANSFER`, `MANAGERIAL`. |
| `accepts_transaction` | `BOOLEAN` | yes | Defaults to `1`; parent/group accounts can be non-postable. |
| `active` | `BOOLEAN` | yes | Defaults to `1`. |
| `code` | `TEXT` | no | Account code; not unique in V1. |

`cost_center`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `name` | `TEXT` | yes | Cost center name. |
| `description` | `TEXT` | no | Free-text detail. |
| `type` | `TEXT` | no | `CAPEX` or `OPEX`. |
| `accepts_transaction` | `BOOLEAN` | yes | Defaults to `1`; parent/group centers can be non-postable. |
| `active` | `BOOLEAN` | yes | Defaults to `1`. |
| `parent_id` | `INTEGER` | no | Self-FK to `cost_center.id`. Enables hierarchy. |
| `code` | `TEXT` | no | Cost center code; not unique in V1. |
| `activity_group_id` | `INTEGER` | yes | FK to `activity_group.id`. |

`income_statement_relationship`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `chart_of_account_id` | `INTEGER` | yes | FK to `chart_of_account.id`. |
| `income_statement_group_id` | `INTEGER` | yes | FK to `income_statement_group.id`. |

### Agricultural Production

`cut`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `field_id` | `INTEGER` | yes | FK to `field.id`. |
| `product_id` | `INTEGER` | yes | FK to `product.id`. Product produced by this cut. |
| `cut_date` | `DATE` | yes | Date of the cut. |
| `cut_number` | `INTEGER` | yes | Sequential number expected by domain logic; not unique in V1. |
| `status` | `TEXT` | yes | Defaults to `DONE`; allowed `DONE`, `CANCELED`. |
| `observation` | `TEXT` | no | Free-text notes. |
| `days_since_last_cut` | `INTEGER` | no | Derived or captured interval; not enforced by DB. |

`field_operation`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `field_id` | `INTEGER` | yes | FK to `field.id`. |
| `cut_id` | `INTEGER` | no | FK to `cut.id`, when operation belongs to a cut cycle. |
| `operation_type` | `TEXT` | yes | `PLANTING`, `FERTILIZATION`, `DEFENSIVE_APPLICATION`, `IRRIGATION`, `SOIL_CORRECTION`, `MOWING`, `BALING`, `FIELD_REFORM`, `OTHER`. |
| `operation_date` | `DATE` | yes | Date of operation. |
| `status` | `TEXT` | yes | Defaults to `DONE`; allowed `PLANNED`, `DONE`, `CANCELED`. |
| `observation` | `TEXT` | no | Free-text notes. |

`field_operation_machine`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `field_operation_id` | `INTEGER` | yes | FK to `field_operation.id`. |
| `machine_id` | `INTEGER` | yes | FK to `machine.id`. |
| `hours_worked` | `REAL` | no | Machine hours used by the operation. |
| `observation` | `TEXT` | no | Free-text notes. |

### Financial Transactions

`financial_transaction`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `description` | `TEXT` | yes | Transaction description. |
| `counterparty_id` | `INTEGER` | no | FK to `counterparty.id`. |
| `issue_date` | `DATE` | yes | Document or transaction issue date. |
| `due_date` | `DATE` | no | Due date. |
| `document_number` | `TEXT` | no | External document number; not unique in V1. |
| `status` | `TEXT` | yes | `PENDING`, `PAID`, `CANCELED`, `PARTIAL`. |
| `type` | `TEXT` | yes | `INCOME` or `EXPENSE`. |
| `observation` | `TEXT` | no | Free-text notes. |
| `has_nf` | `BOOLEAN` | yes | Defaults to `0`; indicates invoice/NF presence. |
| `total_amount` | `REAL` | yes | Defaults to `0`; should match item totals by service rule. |

`financial_transaction_attachment`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `financial_transaction_id` | `INTEGER` | yes | FK to `financial_transaction.id`. |
| `file_name` | `TEXT` | yes | Original or display file name. |
| `declared_content_type` | `TEXT` | no | Client/content type metadata. |
| `size_bytes` | `INTEGER` | no | File size. |
| `document_type_id` | `INTEGER` | yes | FK to `document_type.id`. |
| `storage_provider` | `TEXT` | yes | `LOCAL`, `ONEDRIVE`, or `S3`. |
| `storage_path` | `TEXT` | no | Local or provider path. |
| `external_file_id` | `TEXT` | no | Provider file id. |
| `external_parent_id` | `TEXT` | no | Provider parent/container id. |
| `web_url` | `TEXT` | no | Public/provider URL. |
| `checksum_sha256` | `TEXT` | no | Optional checksum. |
| `uploaded_at` | `DATETIME` | yes | Defaults to `CURRENT_TIMESTAMP`. |
| `active` | `BOOLEAN` | yes | Defaults to `1`. |
| `observation` | `TEXT` | no | Free-text notes. |

Attachment location rule: at least one of `storage_path`, `external_file_id`, or
`web_url` must be non-null.

`financial_transaction_items`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `financial_transaction_id` | `INTEGER` | yes | FK to `financial_transaction.id`. |
| `chart_of_account_id` | `INTEGER` | yes | FK to `chart_of_account.id`. |
| `cost_center_id` | `INTEGER` | no | FK to `cost_center.id`. |
| `quantity` | `REAL` | no | Quantity for product/service item. |
| `unit_price` | `REAL` | no | Unit price. |
| `amount` | `REAL` | yes | Line amount. |
| `product_id` | `INTEGER` | no | FK to `product.id`. |

`financial_transaction_fulfillment`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `financial_transaction_id` | `INTEGER` | yes | FK to `financial_transaction.id`. |
| `bank_account_id` | `INTEGER` | yes | FK to `bank_account.id`. |
| `payment_date` | `DATE` | yes | Payment or receipt date. |
| `amount_paid` | `REAL` | yes | Must be greater than `0`. |
| `observation` | `TEXT` | no | Free-text notes. |
| `status` | `TEXT` | yes | Defaults to `ACTIVE`; allowed `ACTIVE`, `CANCELED`, `ADJUSTMENT`. |
| `cancel_id` | `INTEGER` | no | Self-reference to the original fulfillment when this row is an adjustment. |

`financial_transaction_fulfillment_item_allocation`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `fulfillment_id` | `INTEGER` | yes | FK to `financial_transaction_fulfillment.id`. |
| `financial_transaction_item_id` | `INTEGER` | yes | FK to `financial_transaction_items.id`. |
| `amount` | `REAL` | yes | Must be greater than `0`. |

`bank_transfer`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `source_bank_account_id` | `INTEGER` | yes | FK to `bank_account.id`. |
| `destination_bank_account_id` | `INTEGER` | yes | FK to `bank_account.id`. |
| `amount` | `REAL` | yes | Transfer amount. No positive check in V1. |
| `transfer_date` | `DATE` | yes | Transfer date. |
| `observation` | `TEXT` | no | Free-text notes. |
| `status` | `TEXT` | yes | Defaults to `ACTIVE`; allowed `ACTIVE`, `CANCELED`, `ADJUSTMENT`. |
| `cancel_id` | `INTEGER` | no | Self-reference to the original transfer when this row is an adjustment. |

Transfer rule: `source_bank_account_id` must differ from
`destination_bank_account_id`.

### Inventory And Production Batches

`inventory_batch`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `product_id` | `INTEGER` | yes | FK to `product.id`. |
| `code` | `TEXT` | yes | Batch code; not unique in V1. |
| `batch_date` | `DATE` | yes | Creation or receipt date. |
| `status` | `TEXT` | yes | Defaults to `ACTIVE`; allowed `ACTIVE`, `CONSUMED`, `SOLD`, `CANCELED`. |
| `unit_cost` | `REAL` | no | Cost per unit. |
| `quantity` | `REAL` | yes | Defaults to `0`; likely current balance, kept in sync by service logic. |

`inventory_movement`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `batch_id` | `INTEGER` | yes | FK to `inventory_batch.id`. |
| `movement_type` | `TEXT` | yes | `PURCHASE_IN`, `PRODUCTION_IN`, `SALE_OUT`, `CONSUMPTION_OUT`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `TRANSFER_IN`, `TRANSFER_OUT`. |
| `quantity` | `REAL` | yes | Movement quantity. V1 does not enforce positive values. |
| `unit_cost` | `REAL` | no | Cost at movement time. |
| `movement_date` | `DATE` | yes | Movement date. |
| `financial_transaction_item_id` | `INTEGER` | no | FK to `financial_transaction_items.id`, when tied to purchase/sale finance. |

`inventory_adjustment`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `type` | `TEXT` | yes | `POSITIVE` or `NEGATIVE`. |
| `root_cause_id` | `INTEGER` | yes | FK to `adjustment_root_causes.id`. |
| `observation` | `TEXT` | no | Free-text notes. |
| `inventory_movement_id` | `INTEGER` | yes | FK to `inventory_movement.id`. |

`production_batch`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `inventory_batch_id` | `INTEGER` | yes | FK to `inventory_batch.id`. |
| `inventory_movement_id` | `INTEGER` | yes | FK to `inventory_movement.id`; unique in V1. |
| `quantity` | `REAL` | yes | Produced quantity. |
| `quality_grade` | `TEXT` | no | Product quality classification. |
| `cut_id` | `INTEGER` | yes | FK to `cut.id`. |
| `observation` | `TEXT` | no | Free-text notes. |

`field_operation_items`

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `INTEGER` | yes | Primary key, autoincrement. |
| `field_operation_id` | `INTEGER` | yes | FK to `field_operation.id`. |
| `product_id` | `INTEGER` | yes | FK to `product.id`. |
| `quantity` | `REAL` | yes | Quantity consumed/applied. |
| `unit_cost` | `REAL` | no | Cost at operation time. |
| `amount` | `REAL` | no | Total cost. |
| `inventory_movement_id` | `INTEGER` | yes | FK to `inventory_movement.id`. |
| `observation` | `TEXT` | no | Free-text notes. |

## SQL Enums

| Column | Allowed values |
| --- | --- |
| `product.product_type` | `RAW_MATERIAL`, `FINISHED_GOOD`, `CONSUMABLE`, `SPARE_PART`, `SERVICE` |
| `machine.machine_type` | `TRACTOR`, `BALER`, `MOWER`, `SPRAYER`, `FERTILIZER_SPREADER`, `IRRIGATION`, `PUMP`, `OTHER` |
| `counterparty.document_type` | `CPF`, `CNPJ` |
| `chart_of_account.type` | `INCOME`, `EXPENSE`, `TRANSFER`, `MANAGERIAL` |
| `cost_center.type` | `CAPEX`, `OPEX` |
| `cut.status` | `DONE`, `CANCELED` |
| `field_operation.operation_type` | `PLANTING`, `FERTILIZATION`, `DEFENSIVE_APPLICATION`, `IRRIGATION`, `SOIL_CORRECTION`, `MOWING`, `BALING`, `FIELD_REFORM`, `OTHER` |
| `field_operation.status` | `PLANNED`, `DONE`, `CANCELED` |
| `financial_transaction.status` | `PENDING`, `PAID`, `CANCELED`, `PARTIAL` |
| `financial_transaction.type` | `INCOME`, `EXPENSE` |
| `financial_transaction_fulfillment.status` | `ACTIVE`, `CANCELED`, `ADJUSTMENT` |
| `financial_transaction_attachment.storage_provider` | `LOCAL`, `ONEDRIVE`, `S3` |
| `bank_transfer.status` | `ACTIVE`, `CANCELED`, `ADJUSTMENT` |
| `inventory_batch.status` | `ACTIVE`, `CONSUMED`, `SOLD`, `CANCELED` |
| `inventory_movement.movement_type` | `PURCHASE_IN`, `PRODUCTION_IN`, `SALE_OUT`, `CONSUMPTION_OUT`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `TRANSFER_IN`, `TRANSFER_OUT` |
| `inventory_adjustment.type` | `POSITIVE`, `NEGATIVE` |

## Main Workflows Implied By The Schema

Financial transaction:

1. Create one `financial_transaction` as the header.
2. Create one or more `financial_transaction_items` to classify the amount by chart
   account, optional cost center, and optional product.
3. Attach files in `financial_transaction_attachment` when documents exist. At least
   one storage locator is required.
4. Register payments/receipts in `financial_transaction_fulfillment`.
5. Allocate each fulfillment to one or more items through
   `financial_transaction_fulfillment_item_allocation`.
6. Keep `financial_transaction.status` aligned with paid totals in service logic:
   `PENDING`, `PARTIAL`, `PAID`, or `CANCELED`.

Purchase or sale with stock impact:

1. Use `financial_transaction.type` to distinguish `EXPENSE` purchases from `INCOME`
   sales.
2. Link item rows to `product_id` when the financial line represents stock.
3. Link `inventory_movement.financial_transaction_item_id` to the relevant financial
   item.
4. Use movement types such as `PURCHASE_IN` or `SALE_OUT`.
5. Keep `inventory_batch.quantity` and `inventory_batch.status` aligned with movements
   in service logic.

Field operation with input consumption:

1. Create a `field_operation` for the field and optional cut.
2. Add machine usage in `field_operation_machine`.
3. Add consumed/applied products in `field_operation_items`.
4. Link each operation item to an `inventory_movement`, normally
   `CONSUMPTION_OUT`.

Hay or agricultural production:

1. Create or identify a `cut` for a field and produced product.
2. Create an `inventory_batch` for the finished product.
3. Create an `inventory_movement` with `PRODUCTION_IN`.
4. Create a `production_batch` linking the cut, inventory batch, and movement. V1
   enforces only one `production_batch` per `inventory_movement`.

Inventory adjustment:

1. Create an `inventory_movement` with `ADJUSTMENT_IN` or `ADJUSTMENT_OUT`.
2. Create an `inventory_adjustment` linked to the movement and a root cause.
3. Update the batch quantity/status through service logic.

Bank transfer:

1. Create a `bank_transfer` between two distinct `bank_account` rows.
2. Reflect bank balances in queries/services. V1 stores the transfer but has no
   separate ledger rows for each account.

## Seed Data

The migration inserts a full baseline with fixed ids so a recreated database is
immediately usable by the main screens. Application code should still prefer
lookups by stable business data instead of hard-coded ids.

| Table | Seed rows |
| --- | --- |
| `income_statement_group` | `5` groups |
| `base_unit` | `4` base units |
| `product_family` | `4` families |
| `document_type` | `5` document types |
| `counterparty_type` | `4` counterparty types |
| `segment` | `5` segments |
| `activity_group` | `6` activity groups |
| `adjustment_root_causes` | `4` root causes |
| `unit_of_measure` | `5` units |
| `field` | `5` fields |
| `product` | `8` products, with stock-control classification populated for inventory items |
| `machine` | `4` machines |
| `bank_account` | `3` bank accounts |
| `counterparty` | `8` counterparties |
| `chart_of_account` | `27` accounts |
| `cost_center` | `13` cost centers |
| `income_statement_relationship` | `5` relationships |
| `cut` | `6` cuts |
| `field_operation` | `5` operations |
| `field_operation_machine` | `5` machine allocations |
| `financial_transaction` | `14` transactions, including canceled income and expense examples with cash adjustments |
| `financial_transaction_items` | `14` items |
| `financial_transaction_fulfillment` | `10` fulfillments, including `CANCELED` originals and `ADJUSTMENT` reversals |
| `financial_transaction_fulfillment_item_allocation` | `8` allocations |
| `financial_transaction_attachment` | `3` attachments |
| `bank_transfer` | `5` transfers, including a canceled transfer and inverse adjustment |
| `inventory_batch` | `11` batches |
| `inventory_movement` | `20` movements |
| `inventory_adjustment` | `2` adjustments |
| `production_batch` | `6` production batches |
| `field_operation_items` | `2` operation items linked to stock consumption |

## Validation And Migration Checklist

When changing persistence behavior:

1. Add a new Flyway migration under `backend/src/main/resources/db/migration/`.
2. Update the matching Java entity annotations and enum classes.
3. Update request/response DTOs and mappers.
4. Update frontend domain models, API payloads, and query keys if the REST contract
   changes.
5. Add service-level validation for rules not enforced by SQL, especially sums,
   statuses, batch quantities, and delete/cancel behavior.
6. Add backend tests for migration-sensitive behavior and cross-table workflows.
7. Re-run at least `cd backend; .\mvnw test` after backend schema or entity changes.

## Known V1 Caveats

- `V1__initial_shema.sql` contains a typo in `shema`; preserve the filename because
  Flyway migration identity depends on it.
- Some migration comments have mojibake in accented headings. Table and column names
  are unaffected.
- `bank_account.account_type` and `bank_account.account_group` are free text in SQL
  even though services or UI may treat them like enums.
- `bank_transfer.amount` and `inventory_movement.quantity` have no positive `CHECK`.
- `financial_transaction.total_amount` is not constrained to equal the sum of
  `financial_transaction_items.amount`.
- Fulfillment allocations are not constrained to stay within the paid amount or item
  amount.
- `inventory_batch.quantity` is not automatically derived from movements.
- Cash movement audit metadata exists on `financial_transaction_fulfillment` and
  `bank_transfer`; other tables still have no generic audit columns except
  `financial_transaction_attachment.uploaded_at`.
