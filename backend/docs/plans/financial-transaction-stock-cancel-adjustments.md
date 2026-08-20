# Plano: ajustes de estoque no cancelamento financeiro

## Goal

Permitir cancelar uma transacao financeira que gerou movimentos de estoque sem
deletar nem reescrever o historico.

Quando uma transacao financeira for cancelada:

1. baixas/pagamentos continuam sendo revertidos por ajuste de caixa quando
   necessario;
2. itens financeiros que geraram estoque devem criar ajustes de estoque
   compensatorios;
3. nenhum lote com controle de estoque pode ficar com saldo negativo em qualquer
   ponto da linha do tempo;
4. pagamentos cancelados isoladamente nao devem mexer em estoque, porque baixa
   financeira afeta somente caixa;
5. o cancelamento inteiro deve ser atomico: se caixa ou estoque falhar, nada
   deve ser salvo parcialmente.

## Current State

- `CreateFinancialTransactionUseCase` ja cria movimentos de estoque pelo
  `InventoryStockService` depois de criar os itens financeiros.
- `InventoryStockService.createFinancialMovement` gera:
  - `PURCHASE_IN` para `EXPENSE` com produto estocavel;
  - `SALE_OUT` para `INCOME` com produto estocavel.
- `SALE_OUT` valida saldo atual do lote e decrementa
  `inventory_batch.quantity`.
- `FinancialTransactionService.cancel` hoje bloqueia transacoes que possuem
  `inventory_movement` vinculado por item financeiro.
- `InventoryAdjustment` ja existe e pode registrar ajuste positivo/negativo
  ligado a um `inventory_movement`.
- Nao existe rastreabilidade explicita entre um movimento de estoque original e
  seu movimento compensatorio.
- `InventoryMovementRepository.findByFinancialTransactionItemId` retorna
  `Optional`, mas o plano de reconciliacao pode passar a ter mais de um
  movimento por item financeiro.

## Decisions Confirmed

1. `inventory_movement` deve ter auditoria por `status` e `cancel_id`, espelhando
   os movimentos de caixa.
2. O movimento de ajuste deve repetir o `financial_transaction_item_id` do
   movimento original.
3. A regra de estoque negativo e validada por lote.
4. O cancelamento usa uma unica `adjustmentDate` para caixa e estoque, porque
   ambos fazem parte do mesmo evento de cancelamento.
5. Cancelamento de compra estocavel falha se o lote ja teve qualquer saida. O
   MVP cancela apenas lotes que nao sairam nada depois da compra.
6. Cancelamento de venda pode reabrir lote `SOLD` para `ACTIVE`; lote
   `CANCELED` bloqueia o cancelamento.
7. Validacoes de caixa e estoque devem rodar antes de qualquer mutacao, mesmo
   com `@Transactional` garantindo rollback.
8. Fulfillment afeta somente caixa. Somente a transacao inteira impacta estoque.
9. Todo cancelamento de transacao exige request com `adjustmentDate`.
10. Esta feature nao precisa de seed.

## Design Decisions

### Separacao entre caixa e estoque

Baixa/pagamento (`financial_transaction_fulfillment`) afeta apenas caixa.

Regra:

- cancelar ou deletar uma baixa nao altera estoque;
- cancelar uma transacao financeira pode alterar caixa e estoque;
- estoque e causado pelos itens da transacao, nao pelas baixas;
- caixa e causado pelas baixas, nao pelos itens.

### Historico de estoque nao deve ser reescrito

O movimento original de estoque deve permanecer.

Regra:

- nao deletar `inventory_movement` original;
- nao editar quantidade/data/lote do movimento original;
- criar novo movimento compensatorio;
- criar `inventory_adjustment` ligado ao movimento compensatorio;
- marcar a transacao como `CANCELED` somente depois que todos os ajustes forem
  salvos com sucesso.

### Sinal do ajuste

Usar o movimento original como fonte de verdade, nao apenas o tipo da transacao.

| Movimento original | Ajuste de cancelamento | Efeito |
| --- | --- | --- |
| `PURCHASE_IN` | `ADJUSTMENT_OUT` | remove estoque da compra cancelada |
| `SALE_OUT` | `ADJUSTMENT_IN` | devolve estoque da venda cancelada |
| `PRODUCTION_IN` | fora deste fluxo | cancelamento de corte continua no dominio de producao |
| `CONSUMPTION_OUT` | fora deste fluxo | consumo operacional continua no dominio de operacao/campo |

### Saldo de estoque negativo proibido sempre

Nao basta validar `inventory_batch.quantity` atual.

A validacao deve ser cronologica por lote:

1. carregar movimentos persistidos do lote;
2. excluir movimentos que estejam sendo substituidos, se aplicavel;
3. adicionar movimentos candidatos da operacao;
4. ordenar por `movement_date`, depois `id` quando existir;
5. aplicar sinais de entrada/saida;
6. bloquear se o saldo do lote ficar menor que zero em qualquer data.

Sinais:

- entradas: `PURCHASE_IN`, `PRODUCTION_IN`, `ADJUSTMENT_IN`, `TRANSFER_IN`;
- saidas: `SALE_OUT`, `CONSUMPTION_OUT`, `ADJUSTMENT_OUT`, `TRANSFER_OUT`.

### Data do ajuste

O cancelamento deve receber uma unica data explicita de ajuste. A mesma
`adjustmentDate` deve ser usada para ajustes de caixa e de estoque.

Regra:

- adicionar `adjustmentDate` no request de cancelamento de transacao;
- exigir `adjustmentDate` em todo cancelamento de transacao;
- `adjustmentDate` nao pode ser anterior ao `movement_date` do movimento de
  estoque original;
- `adjustmentDate` nao pode ser anterior ao `stockControlStartDate` do produto;
- nao usar `LocalDate.now()` implicitamente.

## Data Model

Adicionar metadados auditaveis em `inventory_movement`, espelhando caixa:

```sql
ALTER TABLE inventory_movement
    ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE inventory_movement
    ADD COLUMN cancel_id INTEGER;
```

Valores:

```text
ACTIVE
CANCELED
ADJUSTMENT
```

Semantica:

- `ACTIVE`: movimento operacional normal;
- `CANCELED`: movimento original cancelado por ajuste posterior;
- `ADJUSTMENT`: movimento compensatorio que aponta para o original;
- `cancel_id`: aponta para `inventory_movement.id` do movimento original.

Regras:

- movimento original fica `CANCELED`;
- movimento compensatorio fica `ADJUSTMENT`;
- movimento compensatorio aponta para o original via `cancel_id`;
- `inventory_adjustment` registra tipo, causa raiz e observacao do ajuste;
- o saldo considera original e ajuste como eventos separados.

### `financial_transaction_item_id`

- repetir `financial_transaction_item_id` no ajuste para facilitar auditoria por
  item financeiro;
- trocar APIs que assumem apenas um movimento por item:
  - substituir `Optional<InventoryMovement> findByFinancialTransactionItemId`
    por lista ordenada;
  - no mapper, decidir se o response mostra o movimento original, o movimento
    ativo, ou uma lista resumida de movimentos de estoque.

O plano anterior ja evitou indice unico em
`inventory_movement.financial_transaction_item_id` justamente para permitir
compensacoes futuras.

## Backend Plan

### 1. Migration

Criar uma nova migration, por exemplo:

```text
V5__add_inventory_movement_audit_fields.sql
```

Conteudo inicial:

- adicionar `status` em `inventory_movement`;
- adicionar `cancel_id` em `inventory_movement`;
- manter dados existentes como `ACTIVE`;
- se SQLite dificultar `CHECK`/FK em `ALTER TABLE`, validar por service neste
  corte e deixar constraint forte para migration futura.

Atualizar:

- `InventoryMovement`;
- enum compartilhado ou novo enum de status de movimento de estoque;
- DTOs/responses de movimentacao de estoque, se a UI precisar exibir auditoria.

### 2. Repositorios

Adicionar em `InventoryMovementRepository`:

```java
List<InventoryMovement> findByFinancialTransactionItemIdOrderByMovementDateAscIdAsc(Long itemId);

List<InventoryMovement> findByBatchIdOrderByMovementDateAscIdAsc(Long batchId);

List<InventoryMovement> findByFinancialTransactionIdOrderByMovementDateAscIdAsc(Long transactionId);
```

Se Spring Data nao derivar a query por transacao, usar `@Query` com subselect em
`FinancialTransactionItem`.

Substituir ou reduzir uso de:

```java
Optional<InventoryMovement> findByFinancialTransactionItemId(Long itemId);
```

porque o item pode passar a ter movimento original + ajuste.

### 3. `InventoryStockService`

Adicionar um metodo publico de cancelamento financeiro, por exemplo:

```java
List<StockMovementResult> cancelFinancialTransactionStock(
        Long financialTransactionId,
        LocalDate adjustmentDate,
        String observation
)
```

Ou um metodo por movimento original:

```java
StockMovementResult createFinancialCancellationAdjustment(
        InventoryMovement originalMovement,
        LocalDate adjustmentDate,
        String observation
)
```

Responsabilidades:

- buscar movimentos de estoque originados pelos itens da transacao;
- ignorar itens sem movimento de estoque;
- rejeitar movimento original que ja nao esteja `ACTIVE`;
- decidir tipo de ajuste pelo `movementType` original;
- validar `adjustmentDate`;
- validar projecao de saldo por lote para qualquer ajuste de saida;
- criar `InventoryMovement` compensatorio;
- criar `InventoryAdjustment` com causa raiz de cancelamento financeiro;
- atualizar `inventory_batch.quantity`;
- atualizar `inventory_batch.status`;
- marcar movimento original como `CANCELED`.

Root cause sugerida:

```text
Cancelamento de lancamento financeiro
```

### 4. Projecao de saldo de estoque

Extrair a validacao cronologica para metodo privado ou servico dedicado, por
exemplo `InventoryStockProjectionService`.

API interna sugerida:

```java
void validateBatchWillNotGoNegative(
        InventoryBatch batch,
        List<CandidateStockMovement> candidates,
        Set<Long> excludedMovementIds
)
```

No primeiro corte, manter a API encapsulada no `InventoryStockService` se isso
reduzir superficie publica.

Casos que devem falhar:

- cancelar compra quando o lote ja teve qualquer saida posterior;
- criar `ADJUSTMENT_OUT` retroativo que deixaria saldo negativo em uma data
  futura;
- tentar ajustar lote `CANCELED` ou sem classificacao coerente.

### 5. Status do lote

Atualizar `InventoryBatch` de forma consistente:

- `ADJUSTMENT_OUT` que zera lote de uma compra cancelada deve marcar o lote como
  `CANCELED`;
- cancelamento de compra nao faz `ADJUSTMENT_OUT` parcial neste corte; se o lote
  ja teve saida, falha;
- `ADJUSTMENT_IN` de cancelamento de venda deve somar quantidade ao lote;
- se o lote estava `SOLD` e volta a ter saldo por `ADJUSTMENT_IN`, marcar como
  `ACTIVE`;
- se o lote esta `CANCELED`, rejeitar devolucao por cancelamento de venda.

### 6. Cancelamento de transacao financeira

Criar ou preencher `CancelFinancialTransactionUseCase`.

Fluxo:

1. buscar transacao;
2. validar que ainda nao esta `CANCELED`;
3. exigir request com `adjustmentDate`;
4. carregar baixas ativas e movimentos de estoque;
5. validar todos os ajustes de estoque;
6. validar todos os ajustes de caixa;
7. salvar ajustes de estoque;
8. salvar ajustes de caixa;
9. marcar transacao como `CANCELED`;
10. retornar detalhe atualizado.

Tudo deve ficar dentro de uma unica transacao Spring.

Observacao: validar antes de mutar reduz risco de salvar estoque e depois falhar
em caixa, mas a transacao de banco tambem deve garantir rollback atomico.

### 7. Endpoint

Evoluir:

```text
POST /financial-transactions/{id}/cancel
```

Para aceitar body obrigatorio:

```java
record CancelFinancialTransactionRequest(
        LocalDate adjustmentDate,
        String observation
) {
}
```

Regra:

- todo cancelamento de transacao exige body com `adjustmentDate`;
- request nulo ou `adjustmentDate` nulo deve retornar erro claro;
- `observation` deve alimentar ajustes de caixa e estoque quando aplicavel.

### 8. Pagamentos

Nao alterar regra de estoque em endpoints de baixa:

- `POST /financial-transactions/{id}/fulfillments`: afeta caixa;
- `PATCH /financial-transactions/{id}/fulfillments/{fulfillmentId}`: afeta
  somente caixa/observacao conforme regra ja definida;
- `DELETE` ou cancelamento de fulfillment: afeta somente caixa;
- nenhum desses endpoints deve criar `inventory_movement`.

### 9. Edicao/delecao de itens financeiros

Enquanto nao existir reconciliacao completa para item individual:

- manter bloqueio de update/delete de item com movimento de estoque;
- se futuramente permitir, aplicar a mesma regra:
  - item alterado cria ajuste do movimento antigo;
  - cria novo movimento correto;
  - valida saldo cronologico;
  - tudo atomico.

## Points Of Attention

- Cancelamento de compra e o caso mais perigoso: se o lote ja teve qualquer
  saida posterior, o cancelamento deve falhar.
- Validacao por saldo atual nao basta; ajuste retroativo pode quebrar saldo
  historico mesmo quando o saldo atual parece suficiente.
- `findByFinancialTransactionItemId` como `Optional` vira risco se o ajuste
  repetir o mesmo item id. Trocar para lista antes de criar compensacoes.
- Evitar `LocalDate.now()` no backend. Data de ajuste precisa ser explicita para
  auditoria e previsibilidade.
- Nao misturar cancelamento de pagamento com estoque. Pagamento nao sabe lote,
  produto ou quantidade operacional.
- Se caixa ja criou ajuste e estoque falha, ou o contrario, o cancelamento deve
  dar rollback completo.
- Movimento original `CANCELED` ainda deve contar no ledger de estoque; quem
  anula e o movimento `ADJUSTMENT`.
- `inventory_batch.quantity` e denormalizado. Sempre atualizar junto com o
  movimento e cobrir com teste de rollback.
- Lote `SOLD` pode ser reaberto por cancelamento de venda; lote `CANCELED`
  deve bloquear o cancelamento.
- Cancelar transacao com anexos nao deve apagar arquivos. O estado financeiro
  muda, mas documentos continuam auditaveis.
- Esta feature nao precisa de seed; cenarios de sucesso e bloqueio ficam em
  testes.
- Se futuramente houver transferencia de estoque (`TRANSFER_IN/OUT`), a mesma
  projecao deve validar ambos os lotes envolvidos.

## Tests

### Backend

Adicionar cobertura para:

- cancelar transacao sem estoque exige `adjustmentDate` e continua funcionando;
- cancelar transacao com pagamento cria ajuste de caixa e, se houver item
  estocavel, ajuste de estoque na mesma operacao;
- cancelar compra estocavel sem saidas posteriores cria `ADJUSTMENT_OUT`, marca
  original como `CANCELED`, zera/cancela lote e marca transacao como
  `CANCELED`;
- cancelar compra estocavel com lote parcialmente vendido falha e nao salva
  ajuste de caixa nem ajuste de estoque;
- cancelar venda estocavel cria `ADJUSTMENT_IN`, devolve quantidade ao lote e
  reativa lote `SOLD` quando aplicavel;
- cancelar venda estocavel com pagamento falha por saldo bancario negativo e
  nao altera estoque;
- cancelar transacao mista com itens estocaveis e nao estocaveis ajusta apenas
  os itens com movimento;
- cancelar duas vezes falha sem criar ajuste duplicado;
- cancelamento de fulfillment isolado nao cria movimento de estoque;
- response/listagem de movimentos continua funcionando com movimento original +
  ajuste para o mesmo item financeiro;
- projection service bloqueia `ADJUSTMENT_OUT` retroativo que deixaria saldo
  negativo em data posterior;
- rollback completo quando uma transacao possui dois itens estocaveis e o
  segundo ajuste falha.

### Frontend

Se expuser o fluxo na UI:

- `npm run build`;
- dialog de cancelamento sempre pede data de ajuste;
- erro de estoque insuficiente aparece com mensagem especifica da API;
- detalhe da transacao continua mostrando itens e origem de estoque apos
  cancelamento;
- tela de movimentos consegue exibir movimento original cancelado e ajuste.

## Implementation Order

1. Adicionar status/cancel_id em `inventory_movement`.
2. Atualizar entidade, enum e DTOs basicos de movimentacao.
3. Trocar queries de movimento por item para suportar lista.
4. Implementar projecao cronologica por lote no `InventoryStockService`.
5. Implementar ajuste compensatorio por movimento financeiro original.
6. Criar/preencher `CancelFinancialTransactionUseCase` coordenando caixa e
   estoque.
7. Evoluir endpoint de cancelamento para exigir `adjustmentDate`.
8. Remover bloqueio atual que rejeita qualquer transacao com estoque e trocar
   pela reconciliacao com ajustes.
9. Adicionar testes de service/use case/controller.
10. Atualizar docs de schema sem adicionar seed para esta feature.

## Acceptance Criteria

- Cancelar transacao financeira com estoque gera movimentos compensatorios, nao
  delete fisico.
- Nenhum ajuste oriundo do financeiro deixa lote com estoque negativo em nenhuma
  data projetada.
- Todo cancelamento de transacao exige `adjustmentDate`.
- Cancelar pagamento isolado continua impactando somente caixa.
- Cancelamento de transacao com caixa e estoque e atomico.
- Historico mostra movimento original e ajuste compensatorio.
- APIs deixam de assumir que um item financeiro possui no maximo um movimento
  de estoque.
