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
                             activity_group_id INTEGER NOT NULL,

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
                     status TEXT NOT NULL DEFAULT 'DONE' CHECK (
                         status IN ('DONE', 'CANCELED')
                         ),
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
                                                      storage_provider IN ('LOCAL', 'ONEDRIVE', 'S3')
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
                                                   FOREIGN KEY (bank_account_id) REFERENCES bank_account(id),
                                                   CHECK (amount_paid > 0)
);

CREATE TABLE financial_transaction_fulfillment_item_allocation (
                                                                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                   fulfillment_id INTEGER NOT NULL,
                                                                   financial_transaction_item_id INTEGER NOT NULL,
                                                                   amount REAL NOT NULL,

                                                                   FOREIGN KEY (fulfillment_id) REFERENCES financial_transaction_fulfillment(id),
                                                                   FOREIGN KEY (financial_transaction_item_id) REFERENCES financial_transaction_items(id),
                                                                   CHECK (amount > 0)
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
                                  inventory_movement_id INTEGER NOT NULL UNIQUE,
                                  quantity REAL NOT NULL,
                                  quality_grade TEXT,
                                  cut_id INTEGER NOT NULL,
                                  observation TEXT,

                                  FOREIGN KEY (inventory_batch_id) REFERENCES inventory_batch(id),
                                  FOREIGN KEY (inventory_movement_id) REFERENCES inventory_movement(id),
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


-- ============================================================================
-- 8. INITIAL SEED DATA FOR FINANCIAL LAUNCH
-- ============================================================================

INSERT INTO document_type (id, name) VALUES
                                         (1, 'NFe'),
                                         (2, 'Boleto Bancario'),
                                         (3, 'Contrato'),
                                         (4, 'Comprovante PIX'),
                                         (5, 'Recibo');

INSERT INTO counterparty_type (id, name, description, active) VALUES
                                                                  (1, 'Cliente', 'Contraparte de receita', 1),
                                                                  (2, 'Fornecedor', 'Contraparte de compra de insumos e materiais', 1),
                                                                  (3, 'Prestador de Servico', 'Contraparte de servicos tomados', 1);

INSERT INTO segment (id, name) VALUES
                                   (1, 'Insumos Agricolas'),
                                   (2, 'Comercializacao'),
                                   (3, 'Logistica e Servicos');

INSERT INTO base_unit (id, name) VALUES
                                     (1, 'Quilograma'),
                                     (2, 'Litro'),
                                     (3, 'Unidade'),
                                     (4, 'Fardo');

INSERT INTO product_family (id, name) VALUES
                                          (1, 'Fertilizantes'),
                                          (2, 'Defensivos'),
                                          (3, 'Feno'),
                                          (4, 'Servicos');

INSERT INTO unit_of_measure (id, name, base_unit_id, conversion_factor) VALUES
                                                                            (1, 'kg', 1, 1),
                                                                            (2, 'l', 2, 1),
                                                                            (3, 'un', 3, 1),
                                                                            (4, 'fardo', 4, 1);

INSERT INTO product (id, name, unit_id, product_family_id, product_type, active) VALUES
                                                                                     (1, 'Fertilizante NPK 20-05-20', 1, 1, 'RAW_MATERIAL', 1),
                                                                                     (2, 'Herbicida Glifosato', 2, 2, 'CONSUMABLE', 1),
                                                                                     (3, 'Feno Tifton Premium', 4, 3, 'FINISHED_GOOD', 1),
                                                                                     (4, 'Frete Terceirizado', 3, 4, 'SERVICE', 1);

INSERT INTO bank_account (
    id,
    account_type,
    account_group,
    name,
    active,
    initial_balance,
    initial_balance_date,
    financial_institution,
    agency,
    account_number
) VALUES
      (1, 'CHECKING', 'OPERATING', 'Banco do Brasil - Conta Operacional', 1, 150000.00, 1783220400000, 'Banco do Brasil', '0001', '12345-6'),
      (2, 'CHECKING', 'RECEIVABLES', 'Sicredi - Conta Recebimentos', 1, 80000.00, 1783220400000, 'Sicredi', '0102', '98765-4'),
      (3, 'CASH', 'PETTY_CASH', 'Caixa Interno', 1, 5000.00, 1783220400000, 'Caixa Interno', NULL, NULL);

INSERT INTO counterparty (
    id,
    counterparty_type_id,
    legal_name,
    trade_name,
    city,
    state,
    phone_number,
    email,
    document,
    document_type,
    segment_id,
    active
) VALUES
      (1, 1, 'Cooperativa Agro Serra Ltda', 'Cooperativa Agro Serra', 'Unai', 'MG', '(38) 3333-1000', 'financeiro@agroserra.com.br', '12.345.678/0001-10', 'CNPJ', 2, 1),
      (2, 2, 'Agro Insumos Norte Ltda', 'Agro Insumos Norte', 'Rio Verde', 'GO', '(64) 3333-2000', 'vendas@insumosnorte.com.br', '23.456.789/0001-20', 'CNPJ', 1, 1),
      (3, 3, 'Transportes Vale Verde Ltda', 'Transportes Vale Verde', 'Patos de Minas', 'MG', '(34) 3333-3000', 'operacao@valeverde.com.br', '34.567.890/0001-30', 'CNPJ', 3, 1);

INSERT INTO chart_of_account (
    id,
    name,
    parent_id,
    type,
    accepts_transaction,
    active,
    code
) VALUES
      (1, 'Receitas', NULL, 'INCOME', 0, 1, '3.00'),
      (2, 'Venda de Feno', 1, 'INCOME', 1, 1, '3.01.001'),
      (3, 'Prestacao de Servicos', 1, 'INCOME', 1, 1, '3.01.002'),
      (4, 'Despesas Operacionais', NULL, 'EXPENSE', 0, 1, '4.00'),
      (5, 'Compra de Insumos', 4, 'EXPENSE', 1, 1, '4.01.001'),
      (6, 'Frete e Logistica', 4, 'EXPENSE', 1, 1, '4.01.002'),
      (7, 'Servicos de Terceiros', 4, 'EXPENSE', 1, 1, '4.01.003'),
      (8, 'Despesas Administrativas', 4, 'EXPENSE', 1, 1, '4.02.001');

INSERT INTO activity_group values
    (1, 'teste');

INSERT INTO adjustment_root_causes (id, name) VALUES
                                                  (1, 'Cancelamento de Corte');

INSERT INTO cost_center (
    id,
    name,
    description,
    type,
    accepts_transaction,
    active,
    parent_id,
    code,
    activity_group_id
) VALUES
      (1, 'Administrativo', 'Centro de custo administrativo geral', 'OPEX', 1, 1, NULL, 'CC-ADM', 1),
      (2, 'Fazenda Sede', 'Operacao principal da fazenda', 'OPEX', 1, 1, NULL, 'CC-FSZ', 1),
      (3, 'Comercial', 'Receitas e despesas comerciais', 'OPEX', 1, 1, NULL, 'CC-COM', 1),
      (4, 'Investimentos em Maquinas', 'Aquisicoes e melhorias de maquinas', 'CAPEX', 1, 1, NULL, 'CC-MAQ', 1);
