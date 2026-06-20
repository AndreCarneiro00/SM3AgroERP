-- ============================================================================
-- 1. TABELAS INDEPENDENTES / BASES (Nível 0 de dependência)
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
                                   active BOOLEAN DEFAULT 1
);

CREATE TABLE segment (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         name TEXT NOT NULL
);

CREATE TABLE activity_group (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                name TEXT NOT NULL
);

CREATE TABLE bank_account (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              account_type TEXT,
                              account_group TEXT,
                              name TEXT NOT NULL,
                              active BOOLEAN DEFAULT 1,
                              initial_balance REAL,
                              initial_balance_date DATE,
                              financial_institution TEXT,
                              agency TEXT,
                              account_number TEXT
);

-- ============================================================================
-- 2. TABELAS DE SEGUNDO NÍVEL (Dependem apenas das bases)
-- ============================================================================

CREATE TABLE field (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       name TEXT NOT NULL,
                       area_hectares REAL,
                       product_family_id INTEGER,
                       FOREIGN KEY (product_family_id) REFERENCES product_family(id)
);

CREATE TABLE unit_of_measure (
                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                 name TEXT NOT NULL,
                                 base_unit_id INTEGER,
                                 conversion_factor REAL,
                                 FOREIGN KEY (base_unit_id) REFERENCES base_unit(id)
);

CREATE TABLE chart_of_account (
                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                  name TEXT NOT NULL,
                                  parent_id INTEGER,
                                  type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER', 'MANAGERIAL')),
                                  accepts_transaction BOOLEAN,
                                  active BOOLEAN DEFAULT 1,
                                  code TEXT,
                                  FOREIGN KEY (parent_id) REFERENCES chart_of_account(id)
);

CREATE TABLE cut (
                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                     field_id INTEGER,
                     cut_date DATE,
                     cut_number INTEGER,
                     observation TEXT,
                     days_since_last_cut INT,
                     FOREIGN KEY (field_id) REFERENCES field(id)
);

-- ============================================================================
-- 3. TABELAS DE TERCEIRO NÍVEL (Dependências mistas)
-- ============================================================================

CREATE TABLE cost_center (
                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                             name TEXT NOT NULL,
                             description TEXT,
                             type TEXT CHECK (type IN ('CAPEX', 'OPEX')),
                             accepts_transaction BOOLEAN,
                             active BOOLEAN DEFAULT 1,
                             parent_id INTEGER,
                             code TEXT,
                             activity_group_id INTEGER,
                             FOREIGN KEY (parent_id) REFERENCES cost_center(id),
                             FOREIGN KEY (activity_group_id) REFERENCES activity_group(id)
);

CREATE TABLE income_statement_relationship (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               chart_of_account_id INTEGER,
                                               income_statement_group_id INTEGER,
                                               FOREIGN KEY (chart_of_account_id) REFERENCES chart_of_account(id),
                                               FOREIGN KEY (income_statement_group_id) REFERENCES income_statement_group(id)
);

CREATE TABLE product (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         name TEXT NOT NULL,
                         unit_id INTEGER,
                         product_family_id INTEGER,
                         FOREIGN KEY (unit_id) REFERENCES unit_of_measure(id),
                         FOREIGN KEY (product_family_id) REFERENCES product_family(id)
);

CREATE TABLE counterparty (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              counterparty_type_id INTEGER,
                              name TEXT NOT NULL,
                              city TEXT,
                              state TEXT,
                              phone_number TEXT,
                              email TEXT,
                              document TEXT,
                              document_type TEXT CHECK (document_type IN ('CPF', 'CNPJ')),
                              segment_id INTEGER,
                              active BOOLEAN DEFAULT 1,
                              FOREIGN KEY (counterparty_type_id) REFERENCES counterparty_type(id),
                              FOREIGN KEY (segment_id) REFERENCES segment(id)
);

CREATE TABLE bank_transfer (
                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                               source_bank_account_id INTEGER,
                               destination_bank_account_id INTEGER,
                               amount REAL NOT NULL,
                               transfer_date DATE NOT NULL,
                               observation TEXT,
                               FOREIGN KEY (source_bank_account_id) REFERENCES bank_account(id),
                               FOREIGN KEY (destination_bank_account_id) REFERENCES bank_account(id)
);

-- ============================================================================
-- 4. TABELAS DE QUARTO NÍVEL (Lotes e Transações Principais)
-- ============================================================================

CREATE TABLE batch (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       product_id INTEGER,
                       code TEXT,
                       quality_grade TEXT,
                       cut_id INTEGER,
                       batch_date DATE,
                       status TEXT,
                       cost REAL,
                       FOREIGN KEY (product_id) REFERENCES product(id),
                       FOREIGN KEY (cut_id) REFERENCES cut(id)
);

CREATE TABLE financial_transaction (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       description TEXT,
                                       counterparty_id INTEGER,
                                       issue_date DATE,
                                       due_date DATE,
                                       document_number TEXT,
                                       status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'CANCELED', 'PARTIAL')),
                                       type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
                                       observation TEXT,
                                       document_type_id INTEGER,
                                       has_NF BOOLEAN DEFAULT 0,
                                       document_path TEXT,
                                       document_location TEXT,
                                       total_amount REAL,
                                       FOREIGN KEY (counterparty_id) REFERENCES counterparty(id),
                                       FOREIGN KEY (document_type_id) REFERENCES document_type(id)
);

-- ============================================================================
-- 5. TABELAS DE FECHAMENTO E HISTÓRICO (Itens, Estoque e Liquidações)
-- ============================================================================

CREATE TABLE financial_transaction_items (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             financial_transaction_id INTEGER,
                                             chart_of_account_id INTEGER,
                                             cost_center_id INTEGER,
                                             quantity INTEGER,
                                             unity_price REAL,
                                             amount REAL,
                                             product_id INTEGER,
                                             FOREIGN KEY (financial_transaction_id) REFERENCES financial_transaction(id),
                                             FOREIGN KEY (chart_of_account_id) REFERENCES chart_of_account(id),
                                             FOREIGN KEY (cost_center_id) REFERENCES cost_center(id),
                                             FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE inventory_movement (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    batch_id INTEGER,
                                    movement_type TEXT,
                                    quantity INTEGER,
                                    unit_cost REAL,
                                    movement_date DATE,
                                    financial_transaction_item_id INTEGER,
                                    FOREIGN KEY (batch_id) REFERENCES batch(id),
                                    FOREIGN KEY (financial_transaction_item_id) REFERENCES financial_transaction_items(id)
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