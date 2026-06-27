-- ============================================================================
-- 1. BASES
-- ============================================================================

CREATE TABLE income_statement_group (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        name TEXT NOT NULL,
                                        display_order INTEGER
);

CREATE TABLE base_unit (
                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                           name TEXT NOT NULL
);

CREATE TABLE product_family (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                name TEXT NOT NULL
);

CREATE TABLE document_type (
                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                               name TEXT NOT NULL
);

CREATE TABLE counterparty_type (
                                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                                   name TEXT NOT NULL,
                                   description TEXT,
                                   active BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE segment (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         name TEXT NOT NULL
);

CREATE TABLE activity_group (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                name TEXT NOT NULL
);

CREATE TABLE adjustment_root_causes (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        name TEXT NOT NULL
);

-- ============================================================================
-- 2. UNIDADES
-- ============================================================================

CREATE TABLE unit_of_measure (
                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                 name TEXT NOT NULL,
                                 base_unit_id INTEGER NOT NULL,
                                 conversion_factor REAL NOT NULL DEFAULT 1,

                                 FOREIGN KEY (base_unit_id) REFERENCES base_unit(id)
);

-- ============================================================================
-- 3. CADASTROS PRINCIPAIS
-- ============================================================================

CREATE TABLE field (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       name TEXT NOT NULL,
                       area_hectares REAL
);

CREATE TABLE product (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         name TEXT NOT NULL,
                         unit_id INTEGER NOT NULL,
                         product_family_id INTEGER,
                         product_type TEXT NOT NULL CHECK (
                             product_type IN (
                                              'RAW_MATERIAL',
                                              'FINISHED_GOOD',
                                              'CONSUMABLE',
                                              'SPARE_PART',
                                              'SERVICE'
                                 )
                             ),
                         active BOOLEAN NOT NULL DEFAULT 1,

                         FOREIGN KEY (unit_id) REFERENCES unit_of_measure(id),
                         FOREIGN KEY (product_family_id) REFERENCES product_family(id)
);

CREATE TABLE machine (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         name TEXT NOT NULL,
                         machine_type TEXT NOT NULL CHECK (
                             machine_type IN (
                                              'TRACTOR',
                                              'BALER',
                                              'MOWER',
                                              'SPRAYER',
                                              'FERTILIZER_SPREADER',
                                              'IRRIGATION',
                                              'PUMP',
                                              'OTHER'
                                 )
                             ),
                         manufacturer TEXT,
                         model TEXT,
                         year INTEGER,
                         active BOOLEAN NOT NULL DEFAULT 1,
                         observation TEXT
);

CREATE TABLE bank_account (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              account_type TEXT,
                              account_group TEXT,
                              name TEXT NOT NULL,
                              active BOOLEAN NOT NULL DEFAULT 1,
                              initial_balance REAL NOT NULL DEFAULT 0,
                              initial_balance_date DATE,
                              financial_institution TEXT,
                              agency TEXT,
                              account_number TEXT
);

CREATE TABLE counterparty (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              counterparty_type_id INTEGER,
                              legal_name TEXT NOT NULL,
                              trade_name TEXT,
                              city TEXT,
                              state TEXT,
                              phone_number TEXT,
                              email TEXT,
                              document TEXT,
                              document_type TEXT CHECK (document_type IN ('CPF', 'CNPJ')),
                              segment_id INTEGER,
                              active BOOLEAN NOT NULL DEFAULT 1,

                              FOREIGN KEY (counterparty_type_id) REFERENCES counterparty_type(id),
                              FOREIGN KEY (segment_id) REFERENCES segment(id)
);

-- ============================================================================
-- 4. CONTÁBIL / GERENCIAL
-- ============================================================================

CREATE TABLE chart_of_account (
                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                  name TEXT NOT NULL,
                                  parent_id INTEGER,
                                  type TEXT NOT NULL CHECK (
                                      type IN ('INCOME', 'EXPENSE', 'TRANSFER', 'MANAGERIAL')
                                      ),
                                  accepts_transaction BOOLEAN NOT NULL DEFAULT 1,
                                  active BOOLEAN NOT NULL DEFAULT 1,
                                  code TEXT,

                                  FOREIGN KEY (parent_id) REFERENCES chart_of_account(id)
);

CREATE TABLE cost_center (
                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                             name TEXT NOT NULL,
                             description TEXT,
                             type TEXT CHECK (type IN ('CAPEX', 'OPEX')),
                             accepts_transaction BOOLEAN NOT NULL DEFAULT 1,
                             active BOOLEAN NOT NULL DEFAULT 1,
                             parent_id INTEGER,
                             code TEXT,
                             activity_group_id INTEGER,

                             FOREIGN KEY (parent_id) REFERENCES cost_center(id),
                             FOREIGN KEY (activity_group_id) REFERENCES activity_group(id)
);

CREATE TABLE income_statement_relationship (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               chart_of_account_id INTEGER NOT NULL,
                                               income_statement_group_id INTEGER NOT NULL,

                                               FOREIGN KEY (chart_of_account_id) REFERENCES chart_of_account(id),
                                               FOREIGN KEY (income_statement_group_id) REFERENCES income_statement_group(id)
);

-- ============================================================================
-- 5. PRODUÇÃO AGRÍCOLA
-- ============================================================================

CREATE TABLE cut (
                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                     field_id INTEGER NOT NULL,
                     product_family_id INTEGER NOT NULL,
                     cut_date DATE NOT NULL,
                     cut_number INTEGER NOT NULL,
                     observation TEXT,
                     days_since_last_cut INTEGER,

                     FOREIGN KEY (field_id) REFERENCES field(id),
                     FOREIGN KEY (product_family_id) REFERENCES product_family(id)
);

CREATE TABLE field_operation (
                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                 field_id INTEGER NOT NULL,
                                 cut_id INTEGER,
                                 operation_type TEXT NOT NULL CHECK (
                                     operation_type IN (
                                                        'PLANTING',
                                                        'FERTILIZATION',
                                                        'DEFENSIVE_APPLICATION',
                                                        'IRRIGATION',
                                                        'SOIL_CORRECTION',
                                                        'MOWING',
                                                        'BALING',
                                                        'FIELD_REFORM',
                                                        'OTHER'
                                         )
                                     ),
                                 operation_date DATE NOT NULL,
                                 status TEXT NOT NULL DEFAULT 'DONE' CHECK (
                                     status IN ('PLANNED', 'DONE', 'CANCELED')
                                     ),
                                 observation TEXT,

                                 FOREIGN KEY (field_id) REFERENCES field(id),
                                 FOREIGN KEY (cut_id) REFERENCES cut(id)
);

CREATE TABLE field_operation_machine (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         field_operation_id INTEGER NOT NULL,
                                         machine_id INTEGER NOT NULL,
                                         hours_worked REAL,
                                         observation TEXT,

                                         FOREIGN KEY (field_operation_id) REFERENCES field_operation(id),
                                         FOREIGN KEY (machine_id) REFERENCES machine(id)
);

-- ============================================================================
-- 6. FINANCEIRO
-- ============================================================================

CREATE TABLE financial_transaction (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       description TEXT NOT NULL,
                                       counterparty_id INTEGER,
                                       issue_date DATE NOT NULL,
                                       due_date DATE,
                                       document_number TEXT,
                                       status TEXT NOT NULL CHECK (
                                           status IN ('PENDING', 'PAID', 'CANCELED', 'PARTIAL')
                                           ),
                                       type TEXT NOT NULL CHECK (
                                           type IN ('INCOME', 'EXPENSE')
                                           ),
                                       observation TEXT,
                                       has_nf BOOLEAN NOT NULL DEFAULT 0,
                                       total_amount REAL NOT NULL DEFAULT 0,

                                       FOREIGN KEY (counterparty_id) REFERENCES counterparty(id)
);

CREATE TABLE financial_transaction_attachment (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  financial_transaction_id INTEGER NOT NULL,
                                                  file_name TEXT NOT NULL,
                                                  declared_content_type TEXT,
                                                  size_bytes INTEGER,
                                                  document_type_id INTEGER NOT NULL,
                                                  storage_provider TEXT NOT NULL CHECK (
                                                      storage_provider IN ('LOCAL', 'ONEDRIVE')
                                                      ),
                                                  storage_path TEXT,
                                                  external_file_id TEXT,
                                                  external_parent_id TEXT,
                                                  web_url TEXT,
                                                  checksum_sha256 TEXT,
                                                  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                  active BOOLEAN NOT NULL DEFAULT 1,
                                                  observation TEXT,

                                                  FOREIGN KEY (financial_transaction_id) REFERENCES financial_transaction(id),
                                                  FOREIGN KEY (document_type_id) REFERENCES document_type(id),
                                                  CHECK (
                                                      storage_path IS NOT NULL
                                                      OR external_file_id IS NOT NULL
                                                      OR web_url IS NOT NULL
                                                      )
);

CREATE TABLE financial_transaction_items (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             financial_transaction_id INTEGER NOT NULL,
                                             chart_of_account_id INTEGER NOT NULL,
                                             cost_center_id INTEGER,
                                             quantity REAL,
                                             unit_price REAL,
                                             amount REAL NOT NULL,
                                             product_id INTEGER,

                                             FOREIGN KEY (financial_transaction_id) REFERENCES financial_transaction(id),
                                             FOREIGN KEY (chart_of_account_id) REFERENCES chart_of_account(id),
                                             FOREIGN KEY (cost_center_id) REFERENCES cost_center(id),
                                             FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE financial_transaction_fulfillment (
                                                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   financial_transaction_id INTEGER NOT NULL,
                                                   bank_account_id INTEGER NOT NULL,
                                                   payment_date DATE NOT NULL,
                                                   amount_paid REAL NOT NULL,
                                                   observation TEXT,

                                                   FOREIGN KEY (financial_transaction_id) REFERENCES financial_transaction(id),
                                                   FOREIGN KEY (bank_account_id) REFERENCES bank_account(id)
);

CREATE TABLE bank_transfer (
                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                               source_bank_account_id INTEGER NOT NULL,
                               destination_bank_account_id INTEGER NOT NULL,
                               amount REAL NOT NULL,
                               transfer_date DATE NOT NULL,
                               observation TEXT,

                               FOREIGN KEY (source_bank_account_id) REFERENCES bank_account(id),
                               FOREIGN KEY (destination_bank_account_id) REFERENCES bank_account(id),

                               CHECK (source_bank_account_id <> destination_bank_account_id)
);

-- ============================================================================
-- 7. ESTOQUE
-- ============================================================================

CREATE TABLE inventory_batch (
                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                 product_id INTEGER NOT NULL,
                                 code TEXT NOT NULL,
                                 batch_date DATE NOT NULL,
                                 status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (
                                     status IN ('ACTIVE', 'CONSUMED', 'SOLD', 'CANCELED')
                                     ),
                                 unit_cost REAL,
                                 quantity REAL NOT NULL DEFAULT 0,

                                 FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE inventory_movement (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    batch_id INTEGER NOT NULL,
                                    movement_type TEXT NOT NULL CHECK (
                                        movement_type IN (
                                                          'PURCHASE_IN',
                                                          'PRODUCTION_IN',
                                                          'SALE_OUT',
                                                          'CONSUMPTION_OUT',
                                                          'ADJUSTMENT_IN',
                                                          'ADJUSTMENT_OUT',
                                                          'TRANSFER_IN',
                                                          'TRANSFER_OUT'
                                            )
                                        ),
                                    quantity REAL NOT NULL,
                                    unit_cost REAL,
                                    movement_date DATE NOT NULL,
                                    financial_transaction_item_id INTEGER,

                                    FOREIGN KEY (batch_id) REFERENCES inventory_batch(id),
                                    FOREIGN KEY (financial_transaction_item_id) REFERENCES financial_transaction_items(id)
);

CREATE TABLE inventory_adjustment (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      type TEXT NOT NULL CHECK (
                                          type IN ('POSITIVE', 'NEGATIVE')
                                          ),
                                      root_cause_id INTEGER NOT NULL,
                                      observation TEXT,
                                      inventory_movement_id INTEGER NOT NULL,

                                      FOREIGN KEY (root_cause_id) REFERENCES adjustment_root_causes(id),
                                      FOREIGN KEY (inventory_movement_id) REFERENCES inventory_movement(id)
);

CREATE TABLE production_batch (
                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                  inventory_batch_id INTEGER NOT NULL,
                                  quality_grade TEXT,
                                  cut_id INTEGER NOT NULL,
                                  observation TEXT,

                                  FOREIGN KEY (inventory_batch_id) REFERENCES inventory_batch(id),
                                  FOREIGN KEY (cut_id) REFERENCES cut(id)
);

CREATE TABLE field_operation_items (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       field_operation_id INTEGER NOT NULL,
                                       product_id INTEGER NOT NULL,
                                       quantity REAL NOT NULL,
                                       unit_cost REAL,
                                       amount REAL,
                                       inventory_movement_id INTEGER NOT NULL,
                                       observation TEXT,

                                       FOREIGN KEY (field_operation_id) REFERENCES field_operation(id),
                                       FOREIGN KEY (product_id) REFERENCES product(id),
                                       FOREIGN KEY (inventory_movement_id) REFERENCES inventory_movement(id)
);
