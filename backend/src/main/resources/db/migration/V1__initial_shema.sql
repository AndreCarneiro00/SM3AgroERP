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
                         has_stock BOOLEAN,
                         stock_control_start_date DATE,

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
-- 8. INITIAL SEED DATA
-- ============================================================================

INSERT INTO income_statement_group (id, name, display_order) VALUES
                                                                  (1, 'Receita Bruta', 1),
                                                                  (2, 'Custos Operacionais', 2),
                                                                  (3, 'Despesas Administrativas', 3),
                                                                  (4, 'Despesas Financeiras', 4),
                                                                  (5, 'Resultado Operacional', 5);

INSERT INTO base_unit (id, name) VALUES
                                     (1, 'Quilograma (kg)'),
                                     (2, 'Unidade (un)'),
                                     (3, 'Litro (L)'),
                                     (4, 'Metro (m)');

INSERT INTO product_family (id, name) VALUES
                                          (1, 'Feno'),
                                          (2, 'Silagem'),
                                          (3, 'Pastagem'),
                                          (4, 'Insumos Agricolas');

INSERT INTO document_type (id, name) VALUES
                                         (1, 'Nota Fiscal'),
                                         (2, 'Recibo'),
                                         (3, 'Contrato'),
                                         (4, 'Boleto'),
                                         (5, 'Duplicata');

INSERT INTO counterparty_type (id, name, description, active) VALUES
                                                                  (1, 'Cliente', 'Clientes compradores de feno', 1),
                                                                  (2, 'Fornecedor', 'Fornecedores de insumos e servicos', 1),
                                                                  (3, 'Banco', 'Instituicoes financeiras', 1),
                                                                  (4, 'Parceiro', 'Parceiros comerciais', 1);

INSERT INTO segment (id, name) VALUES
                                   (1, 'Agropecuaria'),
                                   (2, 'Transportadora'),
                                   (3, 'Comercio'),
                                   (4, 'Industria'),
                                   (5, 'Servicos');

INSERT INTO activity_group (id, name) VALUES
                                          (1, 'Producao de Feno'),
                                          (2, 'Colheita e Corte'),
                                          (3, 'Enfardamento'),
                                          (4, 'Logistica e Transporte'),
                                          (5, 'Administracao Geral'),
                                          (6, 'Manutencao');

INSERT INTO adjustment_root_causes (id, name) VALUES
                                                  (1, 'Acerto de inventario'),
                                                  (2, 'Perda operacional'),
                                                  (3, 'Avaria / umidade'),
                                                  (4, 'Reclassificacao interna');

INSERT INTO unit_of_measure (id, name, base_unit_id, conversion_factor) VALUES
                                                                            (1, 'Fardo', 2, 1),
                                                                            (2, 'Rolo', 2, 1),
                                                                            (3, 'Tonelada', 1, 1000),
                                                                            (4, 'Quilograma', 1, 1),
                                                                            (5, 'Litro', 3, 1);

INSERT INTO field (id, name, area_hectares) VALUES
                                                 (1, 'Campo Norte', 45.5),
                                                 (2, 'Campo Sul', 38.0),
                                                 (3, 'Campo Leste', 22.3),
                                                 (4, 'Pastagem Central', 60.0),
                                                 (5, 'Campo Experimental', 10.0);

INSERT INTO product (
    id,
    name,
    unit_id,
    product_family_id,
    product_type,
    active,
    has_stock,
    stock_control_start_date
) VALUES
      (1, 'Fardo de Tifton', 1, 1, 'FINISHED_GOOD', 1, 1, '2025-01-01 00:00:00.000'),
      (2, 'Fardo de Braquiaria', 1, 1, 'FINISHED_GOOD', 1, 1, '2025-01-01 00:00:00.000'),
      (3, 'Rolo de Feno Premium', 2, 1, 'FINISHED_GOOD', 1, 1, '2025-01-01 00:00:00.000'),
      (4, 'Silagem de Sorgo', 3, 2, 'FINISHED_GOOD', 1, 1, '2025-01-01 00:00:00.000'),
      (5, 'Sementes de Tifton', 4, 4, 'RAW_MATERIAL', 1, 1, '2025-01-01 00:00:00.000'),
      (6, 'Fertilizante NPK 20-05-20', 4, 4, 'CONSUMABLE', 1, 1, '2025-01-01 00:00:00.000'),
      (7, 'Herbicida Glifosato', 5, 4, 'CONSUMABLE', 1, 1, '2025-01-01 00:00:00.000'),
      (8, 'Frete Terceirizado', 2, NULL, 'SERVICE', 1, 0, NULL);

INSERT INTO machine (
    id,
    name,
    machine_type,
    manufacturer,
    model,
    year,
    active,
    observation
) VALUES
      (1, 'Trator JD 6110J', 'TRACTOR', 'John Deere', '6110J', 2022, 1, 'Usado no preparo e transporte interno'),
      (2, 'Enfardadeira NH Roll Belt', 'BALER', 'New Holland', 'Roll Belt 150', 2021, 1, NULL),
      (3, 'Segadeira Kuhn GMD', 'MOWER', 'Kuhn', 'GMD 280', 2020, 1, NULL),
      (4, 'Pulverizador Jacto Uniport', 'SPRAYER', 'Jacto', 'Uniport 3030', 2019, 0, 'Em revisao preventiva');

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
      (1, 'Conta Corrente', 'Principal', 'BB - Conta Corrente Principal', 1, 45000.00, '2025-01-01 00:00:00.000', 'Banco do Brasil', '1234-5', '98765-4'),
      (2, 'Conta Corrente', 'Operacional', 'Sicoob - Conta Cooperativa', 1, 22000.00, '2025-01-01 00:00:00.000', 'Sicoob', '0042', '55432-1'),
      (3, 'Poupanca', 'Reserva', 'CEF - Poupanca Reserva', 1, 18500.00, '2025-01-01 00:00:00.000', 'Caixa Economica Federal', '0987', '11223-0');

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
      (1, 1, 'Fazenda Sao Joao Agropecuaria Ltda', 'Fazenda Sao Joao', 'Uberlandia', 'MG', '(34) 9 9876-5432', 'contato@fsjoao.com.br', '12.345.678/0001-90', 'CNPJ', 1, 1),
      (2, 1, 'Haras Primavera Ltda', 'Haras Primavera', 'Goiania', 'GO', '(62) 9 8765-4321', 'haras@primavera.com', '98.765.432/0001-10', 'CNPJ', 1, 1),
      (3, 1, 'Condominio Rural Horizonte SPE', 'Condominio Rural Horizonte', 'Campo Grande', 'MS', '(67) 9 7654-3210', NULL, '45.678.901/0001-23', 'CNPJ', 1, 1),
      (4, 2, 'Agro Insumos Central Ltda', 'Agro Insumos Central', 'Uberaba', 'MG', '(34) 3456-7890', 'vendas@agroinsumos.com', '23.456.789/0001-45', 'CNPJ', 1, 1),
      (5, 2, 'Carlos Henrique Souza', 'Mecanica Agricola Souza', 'Patos de Minas', 'MG', '(34) 9 5555-4444', NULL, '123.456.789-00', 'CPF', 5, 1),
      (6, 2, 'Cooperativa Agricola do Cerrado', 'Cooperativa do Cerrado', 'Brasilia', 'DF', NULL, NULL, '67.890.123/0001-56', 'CNPJ', 1, 1),
      (7, 1, 'Rancho Bom Retiro Agro Ltda', 'Rancho Bom Retiro', 'Ribeirao Preto', 'SP', '(16) 9 9111-2233', 'rancho@bomretiro.agr.br', '34.567.890/0001-78', 'CNPJ', 1, 1),
      (8, 2, 'Distribuidora Combustiveis Serra Verde Ltda', 'Serra Verde Combustiveis', 'Uberlandia', 'MG', '(34) 3333-2222', NULL, '89.012.345/0001-67', 'CNPJ', 3, 1);

INSERT INTO chart_of_account (
    id,
    name,
    parent_id,
    type,
    accepts_transaction,
    active,
    code
) VALUES
      (1, 'RECEITAS', NULL, 'INCOME', 0, 1, '1'),
      (2, 'Receitas com Vendas de Feno', 1, 'INCOME', 0, 1, '1.1'),
      (3, 'Venda de Fardo de Tifton', 2, 'INCOME', 1, 1, '1.1.1'),
      (4, 'Venda de Fardo de Braquiaria', 2, 'INCOME', 1, 1, '1.1.2'),
      (5, 'Venda de Rolo de Feno', 2, 'INCOME', 1, 1, '1.1.3'),
      (6, 'Outras Receitas', 1, 'INCOME', 0, 1, '1.2'),
      (7, 'Receita de Pastagem', 6, 'INCOME', 1, 1, '1.2.1'),
      (8, 'Receitas Diversas', 6, 'INCOME', 1, 1, '1.2.2'),
      (9, 'DESPESAS', NULL, 'EXPENSE', 0, 1, '2'),
      (10, 'Custos de Producao', 9, 'EXPENSE', 0, 1, '2.1'),
      (11, 'Combustiveis e Lubrificantes', 10, 'EXPENSE', 1, 1, '2.1.1'),
      (12, 'Sementes e Mudas', 10, 'EXPENSE', 1, 1, '2.1.2'),
      (13, 'Adubacao e Fertilizantes', 10, 'EXPENSE', 1, 1, '2.1.3'),
      (14, 'Defensivos Agricolas', 10, 'EXPENSE', 1, 1, '2.1.4'),
      (15, 'Mao de Obra', 9, 'EXPENSE', 0, 1, '2.2'),
      (16, 'Salarios e Encargos', 15, 'EXPENSE', 1, 1, '2.2.1'),
      (17, 'Mao de Obra Terceirizada', 15, 'EXPENSE', 1, 1, '2.2.2'),
      (18, 'Maquinario e Equipamentos', 9, 'EXPENSE', 0, 1, '2.3'),
      (19, 'Manutencao de Maquinas', 18, 'EXPENSE', 1, 1, '2.3.1'),
      (20, 'Depreciacao', 18, 'EXPENSE', 1, 1, '2.3.2'),
      (21, 'Despesas Administrativas', 9, 'EXPENSE', 0, 1, '2.4'),
      (22, 'Energia Eletrica', 21, 'EXPENSE', 1, 1, '2.4.1'),
      (23, 'Telefone e Internet', 21, 'EXPENSE', 1, 1, '2.4.2'),
      (24, 'Impostos e Taxas', 21, 'EXPENSE', 1, 1, '2.4.3'),
      (25, 'Despesas Financeiras', 9, 'EXPENSE', 0, 1, '2.5'),
      (26, 'Juros e IOF', 25, 'EXPENSE', 1, 1, '2.5.1'),
      (27, 'Tarifas Bancarias', 25, 'EXPENSE', 1, 1, '2.5.2');

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
      (1, 'PRODUCAO', NULL, 'OPEX', 0, 1, NULL, 'PROD', 1),
      (2, 'Corte e Secagem', NULL, 'OPEX', 1, 1, 1, 'PROD.01', 2),
      (3, 'Enfardamento', NULL, 'OPEX', 1, 1, 1, 'PROD.02', 3),
      (4, 'Armazenagem', NULL, 'OPEX', 1, 1, 1, 'PROD.03', 1),
      (5, 'COMERCIAL', NULL, 'OPEX', 0, 1, NULL, 'COM', 4),
      (6, 'Vendas', NULL, 'OPEX', 1, 1, 5, 'COM.01', 4),
      (7, 'Marketing', NULL, 'OPEX', 1, 1, 5, 'COM.02', 4),
      (8, 'ADMINISTRATIVO', NULL, 'OPEX', 0, 1, NULL, 'ADM', 5),
      (9, 'Gestao', NULL, 'OPEX', 1, 1, 8, 'ADM.01', 5),
      (10, 'Financeiro', NULL, 'OPEX', 1, 1, 8, 'ADM.02', 5),
      (11, 'INFRAESTRUTURA', NULL, 'CAPEX', 0, 1, NULL, 'INF', 6),
      (12, 'Maquinas e Equipamentos', NULL, 'CAPEX', 1, 1, 11, 'INF.01', 6),
      (13, 'Benfeitorias', NULL, 'CAPEX', 1, 1, 11, 'INF.02', 6);

INSERT INTO income_statement_relationship (
    id,
    chart_of_account_id,
    income_statement_group_id
) VALUES
      (1, 3, 1),
      (2, 5, 1),
      (3, 13, 2),
      (4, 22, 3),
      (5, 26, 4);

INSERT INTO cut (
    id,
    field_id,
    product_family_id,
    cut_date,
    cut_number,
    status,
    observation,
    days_since_last_cut
) VALUES
      (1, 1, 1, '2025-03-15 00:00:00.000', 1, 'DONE', 'Primeiro corte da safra 2025', 90),
      (2, 2, 1, '2025-03-20 00:00:00.000', 1, 'DONE', 'Condicoes climaticas favoraveis', 85),
      (3, 1, 1, '2025-05-10 00:00:00.000', 2, 'DONE', 'Segundo corte com excelente qualidade', 56),
      (4, 3, 1, '2025-04-05 00:00:00.000', 1, 'DONE', NULL, 75),
      (5, 2, 1, '2025-06-01 00:00:00.000', 2, 'DONE', 'Alta produtividade', 73),
      (6, 1, 1, '2025-07-20 00:00:00.000', 3, 'DONE', NULL, 71);

INSERT INTO field_operation (
    id,
    field_id,
    cut_id,
    operation_type,
    operation_date,
    status,
    observation
) VALUES
      (1, 5, NULL, 'PLANTING', '2025-02-12 00:00:00.000', 'DONE', 'Reforma da area experimental com Tifton'),
      (2, 1, 1, 'MOWING', '2025-03-14 00:00:00.000', 'DONE', 'Abertura do primeiro corte da safra'),
      (3, 1, 1, 'BALING', '2025-03-20 00:00:00.000', 'DONE', 'Enfardamento do lote principal'),
      (4, 2, NULL, 'FERTILIZATION', '2025-04-18 00:00:00.000', 'DONE', 'Cobertura apos chuva'),
      (5, 4, NULL, 'IRRIGATION', '2025-06-09 00:00:00.000', 'PLANNED', 'Aguardando janela operacional');

INSERT INTO field_operation_machine (
    id,
    field_operation_id,
    machine_id,
    hours_worked,
    observation
) VALUES
      (1, 1, 1, 2.5, 'Apoio ao plantio e sulcamento'),
      (2, 2, 3, 4.5, 'Segadeira operando em faixa completa'),
      (3, 3, 2, 6.0, 'Operacao continua durante o dia todo'),
      (4, 4, 1, 3.5, 'Distribuicao com implemento acoplado'),
      (5, 5, 4, 2.0, 'Planejamento inicial de irrigacao');

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
      (1, 'Venda de Fardos de Tifton - Fazenda Sao Joao', 1, '2025-06-01 00:00:00.000', '2025-06-15 00:00:00.000', 'NF-001234', 'PAID', 'INCOME', NULL, 1, 28500.00),
      (2, 'Venda de Fardos - Haras Primavera', 2, '2025-06-03 00:00:00.000', '2025-06-20 00:00:00.000', 'NF-001235', 'PENDING', 'INCOME', NULL, 1, 14750.00),
      (3, 'Compra de Fertilizantes - Agro Insumos Central', 4, '2025-05-28 00:00:00.000', '2025-06-28 00:00:00.000', 'NF-089432', 'PENDING', 'EXPENSE', NULL, 1, 8900.00),
      (4, 'Manutencao de Enfardadeira', 5, '2025-06-05 00:00:00.000', '2025-06-12 00:00:00.000', 'REC-0542', 'PAID', 'EXPENSE', NULL, 0, 2350.00),
      (5, 'Combustivel Junho 2025', 8, '2025-06-01 00:00:00.000', '2025-06-30 00:00:00.000', 'NF-045678', 'PARTIAL', 'EXPENSE', NULL, 1, 6200.00),
      (6, 'Venda Lote Premium - Condominio Rural Horizonte', 3, '2025-05-20 00:00:00.000', '2025-06-05 00:00:00.000', 'NF-001230', 'PAID', 'INCOME', NULL, 1, 42000.00),
      (7, 'Sementes e Insumos - Cooperativa do Cerrado', 6, '2025-06-10 00:00:00.000', '2025-07-10 00:00:00.000', 'NF-112233', 'PENDING', 'EXPENSE', NULL, 1, 4500.00),
      (8, 'Venda Fardos Braquiaria - Rancho Bom Retiro', 7, '2025-06-12 00:00:00.000', '2025-06-30 00:00:00.000', 'NF-001236', 'PENDING', 'INCOME', NULL, 1, 19200.00),
      (9, 'Folha de Pagamento - Junho 2025', NULL, '2025-06-25 00:00:00.000', '2025-06-30 00:00:00.000', NULL, 'PENDING', 'EXPENSE', NULL, 0, 12800.00),
      (10, 'Venda Fardo Tifton - Fazenda Sao Joao (Pedido 2)', 1, '2025-05-15 00:00:00.000', '2025-05-30 00:00:00.000', 'NF-001220', 'PAID', 'INCOME', NULL, 1, 22000.00),
      (11, 'Energia Eletrica - Maio 2025', NULL, '2025-06-01 00:00:00.000', '2025-06-20 00:00:00.000', NULL, 'PAID', 'EXPENSE', NULL, 0, 1850.00),
      (12, 'Defensivos Agricolas', 4, '2025-06-08 00:00:00.000', '2025-07-08 00:00:00.000', 'NF-091234', 'PENDING', 'EXPENSE', NULL, 1, 3200.00);

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
      (1, 1, 3, 6, 285.00, 100.00, 28500.00, 1),
      (2, 2, 3, 6, 147.00, 100.35, 14750.00, 1),
      (3, 3, 13, 2, 10.00, 890.00, 8900.00, 6),
      (4, 4, 19, 12, 1.00, 2350.00, 2350.00, NULL),
      (5, 5, 11, 2, 1.00, 6200.00, 6200.00, NULL),
      (6, 6, 5, 6, 420.00, 100.00, 42000.00, 3),
      (7, 7, 12, 2, 360.00, 12.50, 4500.00, 5),
      (8, 8, 4, 6, 160.00, 120.00, 19200.00, 2),
      (9, 9, 16, 9, 1.00, 12800.00, 12800.00, NULL),
      (10, 10, 3, 6, 220.00, 100.00, 22000.00, 1),
      (11, 11, 22, 10, 1.00, 1850.00, 1850.00, NULL),
      (12, 12, 14, 2, 40.00, 80.00, 3200.00, 7);

INSERT INTO financial_transaction_fulfillment (
    id,
    financial_transaction_id,
    bank_account_id,
    payment_date,
    amount_paid,
    observation
) VALUES
      (1, 1, 1, '2025-06-14 00:00:00.000', 28500.00, 'Pagamento a vista PIX'),
      (2, 4, 2, '2025-06-12 00:00:00.000', 2350.00, NULL),
      (3, 5, 1, '2025-06-15 00:00:00.000', 3100.00, 'Pagamento parcial'),
      (4, 6, 1, '2025-06-05 00:00:00.000', 42000.00, 'Transferencia bancaria'),
      (5, 10, 1, '2025-05-30 00:00:00.000', 22000.00, NULL),
      (6, 11, 2, '2025-06-18 00:00:00.000', 1850.00, NULL);

INSERT INTO financial_transaction_fulfillment_item_allocation (
    id,
    fulfillment_id,
    financial_transaction_item_id,
    amount
) VALUES
      (1, 1, 1, 28500.00),
      (2, 2, 4, 2350.00),
      (3, 3, 5, 3100.00),
      (4, 4, 6, 42000.00),
      (5, 5, 10, 22000.00),
      (6, 6, 11, 1850.00);

INSERT INTO financial_transaction_attachment (
    id,
    financial_transaction_id,
    file_name,
    declared_content_type,
    size_bytes,
    document_type_id,
    storage_provider,
    storage_path,
    external_file_id,
    external_parent_id,
    web_url,
    checksum_sha256,
    uploaded_at,
    active,
    observation
) VALUES
      (1, 1, 'nf-001234.xml', 'application/xml', 18342, 1, 'LOCAL', '/docs/financeiro/nf-001234.xml', NULL, NULL, NULL, 'a1b2c3d4', '2025-06-01 10:00:00.000', 1, 'XML da nota fiscal de venda'),
      (2, 3, 'compra-fertilizantes.pdf', 'application/pdf', 245211, 1, 'LOCAL', '/docs/financeiro/compra-fertilizantes.pdf', NULL, NULL, NULL, 'e5f6g7h8', '2025-05-28 16:20:00.000', 1, NULL),
      (3, 5, 'boleto-combustivel-junho.pdf', 'application/pdf', 85211, 4, 'ONEDRIVE', NULL, 'odrv-file-7781', 'odrv-parent-12', 'https://contoso.sharepoint.com/financeiro/boleto-combustivel-junho.pdf', NULL, '2025-06-02 09:10:00.000', 1, 'Arquivo sincronizado com pasta compartilhada');

INSERT INTO bank_transfer (
    id,
    source_bank_account_id,
    destination_bank_account_id,
    amount,
    transfer_date,
    observation
) VALUES
      (1, 1, 2, 5000.00, '2025-06-05 00:00:00.000', 'Reforco de caixa operacional'),
      (2, 1, 3, 10000.00, '2025-05-20 00:00:00.000', 'Reserva financeira mensal'),
      (3, 2, 1, 8500.00, '2025-06-12 00:00:00.000', 'Consolidacao de recebimentos');

INSERT INTO inventory_batch (
    id,
    product_id,
    code,
    batch_date,
    status,
    unit_cost,
    quantity
) VALUES
      (1, 1, 'IB-2025-001', '2025-03-20 00:00:00.000', 'ACTIVE', 21.76, 560.00),
      (2, 2, 'IB-2025-002', '2025-03-25 00:00:00.000', 'ACTIVE', 22.90, 460.00),
      (3, 3, 'IB-2025-003', '2025-05-15 00:00:00.000', 'ACTIVE', 22.55, 560.00),
      (4, 3, 'IB-2025-004', '2025-04-10 00:00:00.000', 'ACTIVE', 150.00, 220.00),
      (5, 2, 'IB-2025-005', '2025-06-01 00:00:00.000', 'ACTIVE', 23.01, 730.00),
      (6, 1, 'IB-2025-006', '2025-07-20 00:00:00.000', 'ACTIVE', 24.25, 443.00),
      (7, 5, 'IB-2025-007', '2025-02-10 00:00:00.000', 'ACTIVE', 12.50, 180.00),
      (8, 6, 'IB-2025-008', '2025-04-16 00:00:00.000', 'ACTIVE', 4.20, 150.00),
      (9, 6, 'PUR-3-ITEM-3', '2025-05-28 00:00:00.000', 'ACTIVE', 890.00, 10.00),
      (10, 5, 'PUR-7-ITEM-7', '2025-06-10 00:00:00.000', 'ACTIVE', 12.50, 360.00),
      (11, 7, 'PUR-12-ITEM-12', '2025-06-08 00:00:00.000', 'ACTIVE', 80.00, 40.00);

INSERT INTO inventory_movement (
    id,
    batch_id,
    movement_type,
    quantity,
    unit_cost,
    movement_date,
    financial_transaction_item_id
) VALUES
      (1, 1, 'PRODUCTION_IN', 850.00, 21.76, '2025-03-20 00:00:00.000', NULL),
      (2, 1, 'SALE_OUT', 285.00, 21.76, '2025-06-01 00:00:00.000', 1),
      (3, 2, 'PRODUCTION_IN', 620.00, 22.90, '2025-03-25 00:00:00.000', NULL),
      (4, 3, 'PRODUCTION_IN', 980.00, 22.55, '2025-05-15 00:00:00.000', NULL),
      (5, 3, 'SALE_OUT', 420.00, 22.55, '2025-05-20 00:00:00.000', 6),
      (6, 4, 'PRODUCTION_IN', 210.00, 150.00, '2025-04-10 00:00:00.000', NULL),
      (7, 7, 'PURCHASE_IN', 200.00, 12.50, '2025-02-10 00:00:00.000', NULL),
      (8, 8, 'PURCHASE_IN', 500.00, 4.20, '2025-04-16 00:00:00.000', NULL),
      (9, 7, 'CONSUMPTION_OUT', 20.00, 12.50, '2025-02-12 00:00:00.000', NULL),
      (10, 8, 'CONSUMPTION_OUT', 350.00, 4.20, '2025-04-18 00:00:00.000', NULL),
      (11, 1, 'ADJUSTMENT_OUT', 5.00, 21.76, '2025-06-18 00:00:00.000', NULL),
      (12, 4, 'ADJUSTMENT_IN', 10.00, 150.00, '2025-06-22 00:00:00.000', NULL),
      (13, 5, 'PRODUCTION_IN', 730.00, 23.01, '2025-06-01 00:00:00.000', NULL),
      (14, 6, 'PRODUCTION_IN', 810.00, 24.25, '2025-07-20 00:00:00.000', NULL),
      (15, 2, 'SALE_OUT', 160.00, 22.90, '2025-06-12 00:00:00.000', 8),
      (16, 6, 'SALE_OUT', 220.00, 24.25, '2025-05-15 00:00:00.000', 10),
      (17, 9, 'PURCHASE_IN', 10.00, 890.00, '2025-05-28 00:00:00.000', 3),
      (18, 10, 'PURCHASE_IN', 360.00, 12.50, '2025-06-10 00:00:00.000', 7),
      (19, 6, 'SALE_OUT', 147.00, 24.25, '2025-06-03 00:00:00.000', 2),
      (20, 11, 'PURCHASE_IN', 40.00, 80.00, '2025-06-08 00:00:00.000', 12);

INSERT INTO inventory_adjustment (
    id,
    type,
    root_cause_id,
    observation,
    inventory_movement_id
) VALUES
      (1, 'NEGATIVE', 3, 'Fardos com umidade acima do padrao', 11),
      (2, 'POSITIVE', 1, 'Contagem fisica maior que saldo teorico', 12);

INSERT INTO production_batch (
    id,
    inventory_batch_id,
    inventory_movement_id,
    quantity,
    quality_grade,
    cut_id,
    observation
) VALUES
      (1, 1, 1, 850.00, 'A', 1, 'Lote originado do primeiro corte do Campo Norte'),
      (2, 2, 3, 620.00, 'B', 2, 'Umidade controlada dentro do esperado'),
      (3, 3, 4, 980.00, 'A', 3, 'Lote premium parcialmente comercializado'),
      (4, 4, 6, 210.00, 'A+', 4, 'Producao especial de rolos premium'),
      (5, 5, 13, 730.00, 'A', 5, 'Lote em processo de conferencia final'),
      (6, 6, 14, 810.00, 'B+', 6, 'Terceiro corte com produtividade consistente');

INSERT INTO field_operation_items (
    id,
    field_operation_id,
    product_id,
    quantity,
    unit_cost,
    amount,
    inventory_movement_id,
    observation
) VALUES
      (1, 1, 5, 20.00, 12.50, 250.00, 9, 'Sementes usadas na reforma do talhao'),
      (2, 4, 6, 350.00, 4.20, 1470.00, 10, 'Aplicacao de fertilizante de cobertura');
