# Plano: conectar lancamentos financeiros ao estoque

## Goal

Iniciar a integracao entre lancamentos financeiros e estoque usando uma nova
coluna booleana `product.has_stock`.

`has_stock` indica se um produto deve gerar e consumir estoque. A proposta faz
sentido para o projeto porque `product_type` nao e suficiente para decidir
estoque sozinho:

- `SERVICE` normalmente nao deve controlar estoque.
- `RAW_MATERIAL`, `CONSUMABLE`, `SPARE_PART` e `FINISHED_GOOD` podem controlar
  estoque, mas a regra deve ser explicita no cadastro.
- lancamentos financeiros ja possuem `product_id`, `quantity` e `unit_price`
  nos itens. A integracao adiciona o custo unitario de estoque para compras,
  porque preco financeiro e custo de estoque nao devem ser o mesmo contrato.
- a tabela `inventory_movement` ja possui `financial_transaction_item_id`, que
  foi desenhada para rastrear compras e vendas a partir dos itens financeiros.

O resultado esperado e:

1. Produtos carregam a flag `has_stock` no backend e frontend.
2. Produtos com estoque carregam `stock_control_start_date`.
3. Compras de produtos com estoque geram `PURCHASE_IN`.
4. Vendas de produtos com estoque geram `SALE_OUT`.
5. Produtos sem estoque continuam apenas financeiros.
6. A tela de movimentacoes de estoque passa a mostrar movimentos originados de
   lancamentos, cortes e ajustes no mesmo lugar.

## Current State

### Backend

- O schema V1 possui `product`, `financial_transaction_items`,
  `inventory_batch` e `inventory_movement`.
- `product` nao possui `has_stock`.
- `Product` usa `productType` e `active`; DTOs de produto tambem nao possuem
  `hasStock`.
- `financial_transaction_items` tem `product_id`, `quantity`, `unit_price` e
  `amount`.
- `inventory_movement.financial_transaction_item_id` existe, mas ainda nao e
  preenchido pelo fluxo financeiro.
- `InventoryBatchController` e `InventoryMovementController` sao somente leitura.
- Nao existe `InventoryBatchService` ou `InventoryMovementService` dedicado para
  aplicar entradas/saidas e manter `inventory_batch.quantity`.
- `CutService` ja cria estoque diretamente:
  - cria `inventory_batch`;
  - cria `inventory_movement` com `PRODUCTION_IN`;
  - cria `production_batch`;
  - no cancelamento, cria `ADJUSTMENT_OUT` e zera/cancela o lote.
- `CreateFinancialTransactionUseCase` e transacional e cria:
  - cabecalho financeiro;
  - itens;
  - pagamentos;
  - anexos;
  - recalculo da transacao.

### Frontend

- O cadastro de produto nao possui campo para controle de estoque.
- O dominio frontend de `products` nao possui `hasStock` nos DTOs, entidades,
  mappers ou tabela.
- O formulario de lancamento permite selecionar produto, quantidade e preco.
- O formulario de lancamento nao diferencia produto com estoque.
- O formulario de lancamento nao permite escolher lote para venda.
- O modulo de estoque foi consolidado para exibir apenas movimentacoes e criar
  ajustes dentro da tela de movimentacoes.

## Design Decisions

### Flag de produto

- Adicionar `product.has_stock BOOLEAN` sem default de negocio na migration.
- Adicionar `product.stock_control_start_date DATE`.
- Novos produtos devem ser criados com `hasStock` informado explicitamente pelo
  usuario. O backend deve rejeitar create com `hasStock = null`.
- Quando `hasStock = true`, `stockControlStartDate` deve ser obrigatoria.
- Quando `hasStock = false`, `stockControlStartDate` deve ficar nula.
- Dados existentes devem permanecer sem classificacao automatica
  (`has_stock = null`, `stock_control_start_date = null`). Nao preencher
  retroativamente com base em `product_type`.
- `product_type` nao deve ligar/desligar estoque automaticamente. A UI pode
  orientar o usuario, mas a decisao persistida deve ser o valor escolhido em
  `hasStock`.
- Produtos existentes com `has_stock = null` devem ser classificados na proxima
  edicao do cadastro antes de serem usados em novos lancamentos com produto.

### Edicao de produtos existentes

- Nao calcular estoque retroativo ao editar um produto existente.
- Quando um produto legado sair de `has_stock = null` para `true`, somente
  lancamentos cadastrados em data igual ou posterior a
  `stock_control_start_date` devem gerar estoque.
- Quando um produto legado sair de `has_stock = null` para `false`, lancamentos
  futuros seguem apenas financeiros.
- Lancamentos financeiros historicos permanecem como estao. Criar estoque
  retroativo a partir de historico financeiro e arriscado porque faltam escolhas
  de lote, datas de saldo, custo real e reconciliacao com movimentos ja
  existentes.
- Nao adicionar `initial_balance` diretamente em `product`. Saldo inicial de
  estoque precisa de lote, data, custo e movimento auditavel; colocar quantidade
  no produto criaria uma segunda fonte de verdade alem de `inventory_batch`.
- Se houver necessidade de cadastrar saldo fisico inicial de um produto legado,
  isso deve ser feito por um fluxo explicito de implantacao/saldo inicial de
  estoque, centralizado no `InventoryStockService`.
- Saldo inicial fica fora do primeiro corte desta integracao. Quando esse fluxo
  for implementado, ele deve criar:
  - um `inventory_batch` com codigo de abertura;
  - um `inventory_movement` com tipo proprio, provavelmente `OPENING_BALANCE`,
    adicionado em uma migration especifica desse fluxo;
  - nao criar `inventory_adjustment`, porque saldo inicial nao e ajuste
    operacional nem correcao de divergencia.
- Alterar `hasStock` de `false` para `true` deve afetar apenas o futuro.
- Alterar `hasStock` de `true` para `false` deve ser bloqueado se o produto ja
  possuir lotes ou movimentacoes de estoque. Nesse caso, preferir inativar o
  produto e cadastrar outro sem estoque, ou implementar uma rotina controlada de
  encerramento de estoque.
- Alterar `unitId` deve ser bloqueado quando o produto ja possuir lotes ou
  movimentacoes de estoque, porque as quantidades historicas passariam a estar
  em outra unidade.
- Alterar `stockControlStartDate` deve ser bloqueado quando o produto ja possuir
  movimentacoes de estoque; quando ainda nao houver movimentos, a data pode ser
  corrigida antes do primeiro uso.
- Um lancamento com produto `has_stock = null` deve falhar com mensagem clara
  pedindo classificacao do produto.

### Data da movimentacao de estoque

- `issueDate` representa a data de criacao operacional da transacao financeira.
- Estoque nasce ou sai na `issueDate` do lancamento financeiro, nao na
  `dueDate` ou data de pagamento.
- Comparar `stock_control_start_date` com `issueDate`.
- `inventory_movement.movement_date` de `PURCHASE_IN` e `SALE_OUT` deve ser
  a `issueDate` da transacao.

### Geracao de estoque por lancamento

- O financeiro deve continuar sendo o ponto de entrada de compras e vendas.
- A criacao automatica de estoque deve acontecer dentro do use case
  `CreateFinancialTransactionUseCase`, depois da criacao dos itens e antes do
  retorno final.
- Criar uma camada de servico de estoque para nao espalhar regra em
  `FinancialTransactionItemService` nem em controllers.
- Regra inicial por item financeiro:
  - se o item nao tem produto, nao gera movimento;
  - se o produto tem `has_stock = false`, nao gera movimento;
  - se a transacao e `EXPENSE`, gerar entrada `PURCHASE_IN`;
  - se a transacao e `INCOME`, gerar saida `SALE_OUT`.

### Compras

- Para cada item de despesa com produto estocavel:
  - exigir `quantity > 0`;
  - exigir custo unitario de estoque informado pelo usuario neste primeiro
    corte;
  - no frontend, sugerir esse custo unitario igual ao `unitPrice` do item, mas
    persistir/enviar como campo separado;
  - usar esse custo como `inventory_batch.unit_cost` e
    `inventory_movement.unit_cost`;
  - criar um novo `inventory_batch`;
  - criar `inventory_movement` `PURCHASE_IN`;
  - setar `inventory_movement.financial_transaction_item_id`.
- Codigo de lote sugerido:
  - `PUR-<transactionId>-ITEM-<itemId>`.
- `inventory_batch.quantity` deve iniciar com a quantidade comprada.

### Vendas

- Para cada item de receita com produto estocavel:
  - exigir `quantity > 0`;
  - exigir lote de estoque selecionado no payload do item financeiro;
  - validar que o lote pertence ao produto do item;
  - validar saldo suficiente no lote selecionado;
  - criar `inventory_movement` `SALE_OUT`;
  - usar `inventory_movement.unit_cost` igual ao custo do lote, nao ao preco de
    venda do item financeiro;
  - decrementar `inventory_batch.quantity`;
  - marcar lote como `SOLD` quando o saldo chegar a zero.
- O usuario deve poder escolher qual lote vender.
- O frontend deve sugerir os lotes em ordem FIFO:
  - ordenar por `batch_date ASC`, depois `id ASC`;
  - mostrar somente lotes do produto selecionado com saldo positivo e status
    vendavel;
  - preselecionar ou destacar o primeiro lote FIFO quando possivel.
- FIFO e sugestao de UX no MVP, nao uma obrigacao cega: se o usuario escolher
  outro lote valido, o backend deve aceitar.
- Para o MVP, uma linha financeira consome um unico lote.
- Quando o usuario selecionar produto e quantidade de venda, a tela deve sugerir
  e gerar automaticamente N itens financeiros conforme FIFO ate cobrir a
  quantidade informada.
- Se a quantidade desejada exigir dois lotes, a tela deve criar dois itens do
  mesmo produto, cada um vinculado a um lote e limitado ao saldo daquele lote.
- O usuario pode alterar lote ou quantidade depois do split, desde que cada item
  continue respeitando o saldo do lote escolhido.

### API contract para itens financeiros

- Adicionar `inventoryBatchId` opcional ao DTO de item financeiro de request.
- Adicionar `inventoryUnitCost` opcional ao DTO de item financeiro de request.
  - Para compra estocavel (`EXPENSE`), `inventoryUnitCost` e obrigatorio.
  - Para venda estocavel (`INCOME`), `inventoryUnitCost` deve ser ignorado; o
    custo do movimento vem do lote escolhido.
- Nao e necessario adicionar `inventory_batch_id` em
  `financial_transaction_items`, porque o vinculo persistido fica em
  `inventory_movement.batch_id` + `inventory_movement.financial_transaction_item_id`.
- Adicionar ao response do item financeiro campos derivados:
  - `inventoryMovementId`;
  - `inventoryBatchId`;
  - opcionalmente `stockMovementType`.
- Adicionar query no `InventoryMovementRepository` para buscar movimento por
  `financialTransactionItemId`.
- Nao criar indice unico em `inventory_movement.financial_transaction_item_id`
  neste corte, para nao limitar movimentos compensatorios ou reconciliacao
  auditavel no futuro.

### Atualizacao, exclusao e cancelamento

- Primeira implementacao deve cobrir criacao de lancamento completo.
- Antes de liberar edicao de item estocavel em transacao existente, implementar
  reconciliacao:
  - atualizar item financeiro deve recalcular/reverter movimento anterior;
  - excluir item financeiro deve reverter/remover movimento associado;
  - cancelar transacao deve criar movimento compensatorio ou desfazer estoque de
    forma auditavel.
- Enquanto a reconciliacao nao estiver pronta, bloquear alteracao de itens
  estocaveis ja vinculados a movimentos.
- Enquanto a reconciliacao nao estiver pronta, bloquear cancelamento de
  transacao que possua item com movimento de estoque.
- Enquanto a reconciliacao nao estiver pronta, bloquear alteracao de `type` de
  transacao que possua item com movimento de estoque, porque isso inverteria a
  regra de entrada/saida.
- Criacao avulsa de item em transacao existente deve seguir as mesmas regras de
  estoque do create completo ou ser bloqueada para produto estocavel ate existir
  fluxo dedicado.

## Implementation Steps

### 1. Database

1. Criar `backend/src/main/resources/db/migration/V2__add_product_has_stock.sql`.
2. Adicionar coluna:
   - `ALTER TABLE product ADD COLUMN has_stock BOOLEAN;`
3. Adicionar coluna:
   - `ALTER TABLE product ADD COLUMN stock_control_start_date DATE;`
4. Nao atualizar produtos existentes nessa migration. Eles permanecem com
   `has_stock = null` ate classificacao explicita pelo usuario.
5. Nao criar indice unico para `inventory_movement.financial_transaction_item_id`
   neste corte.
6. Nao adicionar `OPENING_BALANCE` neste corte. Esse tipo fica para a migration
   futura do fluxo de saldo inicial.
7. Planejar uma migration futura para tornar `product.has_stock NOT NULL`
   somente depois que todos os produtos legados tiverem sido classificados.
8. Atualizar `backend/docs/database/schema-reference.md` depois da implementacao.

### 2. Backend: products

1. Adicionar `hasStock` e `stockControlStartDate` em `Product`.
2. Atualizar `CreateProductRequest`, `UpdateProductRequest`,
   `CreateProductResponse`, `UpdateProductResponse` e `FindAllProductResponse`.
3. Atualizar `ProductController` para retornar `hasStock` e
   `stockControlStartDate`.
4. Atualizar `ProductService`:
   - exigir `hasStock` no create;
   - exigir `stockControlStartDate` quando `hasStock=true`;
   - limpar `stockControlStartDate` quando `hasStock=false`;
   - exigir `hasStock` em update de produto legado com valor atual nulo;
   - bloquear `true -> false` quando ja houver lotes ou movimentacoes para o
     produto;
   - bloquear mudanca de `unitId` quando ja houver lotes ou movimentacoes para
     o produto;
   - bloquear mudanca de `stockControlStartDate` quando ja houver movimentacoes
     para o produto;
   - nao inferir valor a partir de `productType`;
   - preservar valor em update quando a request trouxer explicitamente o mesmo
     valor.
5. Atualizar seeds/testes que montam `Product.builder()`.
6. Atualizar `ProductControllerIT` para verificar create/list/update com
   `hasStock`.

### 3. Backend: inventory application service

1. Criar servico de aplicacao, por exemplo
   `inventory.service.InventoryStockService`.
2. Responsabilidades:
   - criar estoque de producao originado por corte;
   - cancelar estoque de producao originado por corte com ajuste compensatorio;
   - deixar saldo inicial fora do primeiro corte; quando existir fluxo proprio,
     centralizar a criacao do lote/movimento nesse servico;
   - criar lote de compra;
   - criar movimento de compra;
   - criar movimento de venda;
   - atualizar quantidade/status do lote;
   - validar quantidade positiva;
   - validar saldo disponivel;
   - resolver custo unitario.
3. Repositorios necessarios:
   - `InventoryBatchRepository`;
   - `InventoryMovementRepository`;
   - `ProductRepository` ou produto ja carregado pelo item.
4. Adicionar queries no `InventoryMovementRepository`:
   - `Optional<InventoryMovement> findByFinancialTransactionItemId(Long itemId)`;
   - `boolean existsByFinancialTransactionItemId(Long itemId)`.
5. Adicionar queries no `InventoryBatchRepository`:
   - listar lotes vendaveis por produto em ordem FIFO:
     `product_id`, status ativo, quantidade positiva, `batchDate ASC`, `id ASC`;
   - verificar existencia de lotes/movimentos por produto para validar mudanca
     de `hasStock`.
6. Refatorar `CutService` para chamar `InventoryStockService` em vez de criar
   batch/movement/adjustment diretamente com repositories.
7. `CutService` tambem deve respeitar `hasStock`:
   - produto com `hasStock = null` deve falhar pedindo classificacao;
   - produto com `hasStock = false` deve falhar porque corte gera estoque de
     producao;
   - produto com `hasStock = true` deve exigir `cutDate >= stockControlStartDate`.
8. Preferir BigDecimal para calculos de quantidade/custo, mantendo escala
   monetaria em custo unitario.

### 4. Backend: financial transaction integration

1. Estender `FinancialTransactionItemRequest` com:
   - `Long inventoryBatchId`;
   - `BigDecimal inventoryUnitCost`.
2. Estender `FinancialTransactionItemResponse` e os result records usados no
   create use case com campos derivados de estoque.
3. Fazer `FinancialTransactionItemService.createAll` retornar entidades ou um
   resultado que permita ao use case saber o `FinancialTransactionItem.id`.
4. Injetar `InventoryStockService` no `CreateFinancialTransactionUseCase`.
5. Depois de criar itens:
   - iterar itens criados + requests correspondentes;
   - ignorar item sem produto ou produto sem estoque;
   - rejeitar item com produto `hasStock = null`, pedindo classificacao do
     produto antes do lancamento;
   - ignorar geracao de estoque quando `issueDate` for anterior a
     `product.stockControlStartDate`;
   - chamar compra ou venda conforme `FinancialTransaction.type`.
6. Garantir transacao unica: se estoque falhar, financeiro, pagamentos e anexos
   devem ser revertidos.
7. Atualizar `FinancialTransactionResponseMapper` para expor movimento/lote do
   item quando existir.
8. Bloquear ou tratar edicao posterior de itens estocaveis em:
   - `FinancialTransactionItemService.update`;
   - `FinancialTransactionItemService.delete`;
   - `FinancialTransactionService.cancel`.
9. Bloquear alteracao de `type` em `FinancialTransactionService.update` quando a
   transacao ja possuir item com movimento de estoque.
10. Definir se `FinancialTransactionItemService.create` avulso aplica as mesmas
    regras de estoque ou bloqueia produto estocavel ate existir fluxo completo
    de reconciliacao.

### 5. Frontend: products

1. Adicionar `hasStock` em:
   - `domains/products/api/dtos.ts`;
   - `domains/products/model/entities.ts`;
   - `domains/products/model/mappers.ts`.
2. Adicionar `stockControlStartDate` nos mesmos DTOs, entidades e mappers.
3. Atualizar fixtures JSON/MSW de produtos.
4. Atualizar `ProductDialog`:
   - incluir toggle/checkbox "Controla estoque";
   - incluir campo "Inicio do controle de estoque";
   - exigir escolha explicita no cadastro;
   - exigir data de inicio quando "Controla estoque" estiver ligado;
   - limpar/desabilitar data de inicio quando "Controla estoque" estiver
     desligado;
   - para produto legado com `hasStock = null`, mostrar estado "Nao definido"
     e obrigar escolha antes de salvar;
   - nao ligar/desligar automaticamente ao trocar `productType`.
5. Nao adicionar `initialBalance` no formulario de produto. Saldo inicial deve
   ser um fluxo separado de estoque para criar lote/movimento de abertura.
6. Atualizar `ProductsTab`:
   - exibir coluna ou chip "Estoque";
   - exibir data de inicio do controle quando aplicavel;
   - mostrar estado "Nao definido" para produtos legados ainda nao
     classificados;
   - permitir leitura rapida de produtos que movimentam estoque.

### 6. Frontend: financial transaction form

1. Adicionar `inventoryBatchId` e `inventoryUnitCost` no modelo frontend de item
   financeiro:
   - `TransactionItemFormData`;
   - `FinancialTransactionItemInput`;
   - DTOs/mappers financeiros.
2. No `TransactionDialog`, identificar produto selecionado:
   - se `hasStock=false`, nao mostrar campos de estoque;
   - se `hasStock=null`, bloquear salvamento e orientar o usuario a classificar
     o produto no cadastro;
   - se `issueDate` for anterior a `stockControlStartDate`, tratar o item como
     financeiro sem movimento de estoque e exibir aviso discreto;
   - se transacao `EXPENSE` e `hasStock=true`, exigir quantidade e custo
     unitario de estoque, sugerindo por default o mesmo valor de `unitPrice`;
   - se transacao `INCOME` e `hasStock=true`, mostrar seletor de lote ativo do
     produto.
3. Carregar `inventoryBatches` no dialog de lancamento ou no container da tela de
   transacoes.
4. Validar no frontend:
   - produto com estoque exige quantidade positiva;
   - compra com estoque exige custo unitario de estoque;
   - venda com estoque exige lote;
   - quantidade vendida nao pode exceder saldo exibido do lote;
   - lista de lotes de venda deve ser ordenada FIFO por `batchDate ASC` e
     `id ASC`, com primeiro lote sugerido/preselecionado quando possivel.
5. Ajustar `TransactionItemDialog` usado em edicao de item:
   - exibir lote vinculado;
   - bloquear edicao de estoque ate reconciliacao backend estar pronta, ou
     implementar o mesmo contrato de update.
6. Mostrar indicacao na lista/expansao da transacao quando um item gerou
   movimento de estoque.

### 7. Frontend: inventory movements

1. Garantir que a tela de movimentacoes mostra movimentos com
   `financialTransactionItemId`.
2. Melhorar a coluna "Origem" para mostrar lancamento financeiro quando houver
   item vinculado.
3. Manter sem botao de "Nova Movimentacao"; lancamentos devem gerar compra/venda
   automaticamente.
4. Manter "Novo Ajuste" como unica acao manual da tela de movimentacoes.

### 8. MSW and local JSON fixtures

1. Adicionar `hasStock` aos produtos em `frontend/src/app/data/json/products.json`.
2. Atualizar handlers de produtos para aceitar/persistir `hasStock`.
3. Atualizar handlers financeiros para simular:
   - `PURCHASE_IN` quando criar despesa de produto com estoque;
   - `SALE_OUT` quando criar receita de produto com estoque e lote informado.
4. Atualizar fixtures de inventory quando necessario para cenarios de venda.

## Dependencies

- `Product` precisa receber `has_stock` antes da integracao financeira.
- O frontend financeiro depende do catalogo de produtos com `hasStock`.
- Vendas dependem da lista de lotes ativos por produto.
- O backend precisa de um servico de estoque antes de conectar
  `CreateFinancialTransactionUseCase`.
- Reconciliacao de update/delete/cancel precisa ser definida antes de liberar
  edicao completa de itens estocaveis.

## Validation

### Backend

1. `cd backend; .\mvnw test`
2. Testes esperados:
   - create de produto rejeita `hasStock=null`;
   - create/update com `hasStock=true` exige `stockControlStartDate`;
   - create/update com `hasStock=false` limpa `stockControlStartDate`;
   - update de produto legado exige classificacao explicita;
   - `true -> false` e bloqueado quando produto ja tem lotes/movimentos;
   - mudanca de unidade e bloqueada quando produto ja tem lotes/movimentos;
   - mudanca de `stockControlStartDate` e bloqueada quando produto ja tem
     movimentos;
   - create/list/update de produto expoe `hasStock` e
     `stockControlStartDate`;
   - lancamento anterior a `stockControlStartDate` nao gera movimento de
     estoque;
   - despesa com produto estocavel exige `inventoryUnitCost` e cria lote +
     `PURCHASE_IN`;
   - despesa com produto sem estoque nao cria movimento;
   - lancamento com produto `hasStock=null` falha com mensagem clara;
   - receita com produto estocavel exige lote;
   - receita com lote valido cria `SALE_OUT` e reduz saldo;
   - receita com saldo insuficiente falha e faz rollback completo;
   - venda permite lote nao-FIFO quando escolhido explicitamente e valido;
   - query de lotes vendaveis retorna sugestao FIFO;
   - `CutService` continua criando/cancelando estoque corretamente apos usar
     `InventoryStockService`;
   - `CutService` rejeita produto sem classificacao, produto sem estoque e
     `cutDate` anterior a `stockControlStartDate`;
   - update/delete/cancel/type-change de transacao com movimento de estoque e
     bloqueado ate existir reconciliacao;
   - falha de estoque no create use case nao persiste financeiro parcial.

### Frontend

1. `cd frontend; npm.cmd run build`
2. Verificar manualmente:
   - cadastro de produto mostra e persiste "Controla estoque";
   - cadastro de produto exige data de inicio quando controla estoque;
   - produto legado com estoque indefinido exige escolha ao editar;
   - formulario de produto nao oferece saldo inicial direto;
   - compra de produto estocavel pede custo unitario de estoque, sugere
     `unitPrice` como default, nao pede lote e aparece em movimentacoes;
   - venda de produto estocavel pede lote, sugere FIFO e valida saldo do lote
     escolhido;
   - produto sem estoque nao mostra seletores de estoque;
   - tela de movimentacoes mostra origem financeira.

## Progress

- [x] Contexto inicial lido: schema, produto, financeiro, estoque, corte e
  frontend.
- [x] Decisao validada: `has_stock` faz sentido para separar tipo de produto de
  controle de estoque.
- [x] Decisao ajustada: sem default de negocio, sem retroativo automatico, e
  classificacao explicita dos produtos legados.
- [x] Decisao ajustada: venda escolhe lote manualmente com sugestao FIFO.
- [x] Decisao ajustada: `InventoryStockService` centraliza estoque tambem para
  cortes.
- [x] Decisao ajustada: `stock_control_start_date` pertence ao produto, mas
  saldo inicial nao; saldo inicial deve gerar lote/movimento por fluxo de
  estoque.
- [x] Decisao ajustada: `issueDate` e a data operacional usada para comparar
  `stock_control_start_date` e gravar `inventory_movement.movement_date`.
- [x] Decisao ajustada: compras usam custo unitario de estoque separado de
  `unitPrice`, com default de UI igual ao preco unitario.
- [x] Decisao ajustada: nao criar indice unico em
  `inventory_movement.financial_transaction_item_id` neste corte.
- [x] Decisao ajustada: `OPENING_BALANCE` fica para o fluxo futuro de saldo
  inicial.
- [x] Decisao ajustada: bloquear mudanca de unidade/data de inicio em produto
  ja movimentado, e aplicar `hasStock` tambem ao fluxo de cortes.
- [ ] Implementar migration V2.
- [ ] Atualizar backend de produto.
- [ ] Criar servico de aplicacao de estoque.
- [ ] Conectar create de lancamento ao estoque.
- [ ] Atualizar frontend de produto.
- [ ] Atualizar frontend financeiro.
- [ ] Atualizar MSW/fixtures.
- [ ] Atualizar documentacao de schema depois da implementacao.
- [ ] Rodar validacoes.

## Discoveries

- `CutService` ja implementa criacao automatica de estoque para corte, mas faz
  isso diretamente com repositories. A integracao financeira deve introduzir
  `InventoryStockService` e migrar cortes para esse servico para manter uma
  unica regra de estoque.
- `InventoryBatchController` e `InventoryMovementController` sao leitura apenas.
  Isso combina com a decisao de nao criar movimentacao manual de compra/venda no
  frontend.
- `inventory_movement.financial_transaction_item_id` ja existe no V1 e deve ser
  usado como vinculo principal entre estoque e lancamento.
- A venda precisa de `inventoryBatchId` no request do item financeiro, mas esse
  dado pode ser persistido somente no movimento de estoque.
- Produtos existentes devem permanecer com `has_stock = null` ate classificacao
  explicita. Nao ha retroativo automatico de estoque ao editar produto.
- `stock_control_start_date` resolve o caso de lancamentos com data anterior a
  classificacao do produto. A regra de estoque so vale a partir dessa data.
- `initial_balance` direto no produto foi descartado para evitar duplicidade com
  o saldo derivado de lotes. Saldo inicial precisa ser registrado como lote e
  movimento auditavel.
- FIFO sera a ordenacao/sugestao de lotes no frontend/backend, mas o usuario
  ainda pode escolher outro lote valido.
- O update/delete/cancel de itens financeiros com estoque e o maior risco de
  consistencia; se nao for implementado no primeiro corte, deve ser bloqueado
  explicitamente para itens que ja geraram movimento.
