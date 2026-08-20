# Plano 02: metadados auditaveis de movimentos de caixa

## Prioridade

P1. Este plano cria a base de auditoria para estornos futuros sem ainda mudar o
comportamento de cancelamento.

## Goal

Adicionar `status` e `cancel_id` aos movimentos que afetam caixa:

- `financial_transaction_fulfillment`;
- `bank_transfer`.

Esses campos devem ser expostos nos DTOs para permitir que frontend e APIs
distinguam movimentos ativos, cancelados e ajustes.

## Modelo

Valores de status:

```text
ACTIVE
CANCELED
ADJUSTMENT
```

Semantica:

- `ACTIVE`: movimento normal.
- `CANCELED`: linha original que foi cancelada por ajuste posterior.
- `ADJUSTMENT`: movimento compensatorio que aponta para a linha original.

Regra importante:

- `CANCELED` nao significa ignorar a linha original no saldo bancario.
- Cada linha persistida representa um evento do ledger.
- A linha original e a linha `ADJUSTMENT` devem ser consideradas no saldo e se
  anular pelo sinal economico.

## Escopo

Inclui:

- migration Flyway.
- enums Java.
- campos nas entidades.
- defaults de builder/criacao.
- DTOs de resposta.
- mapper/controller response.
- queries/listagens continuando funcionais.

Nao inclui:

- endpoints de cancelamento.
- criacao automatica de ajustes.
- filtros frontend para esconder ajustes.

## Migration

Adicionar migration nova, por exemplo:

```text
V4__add_cash_movement_audit_fields.sql
```

Alteracoes em `financial_transaction_fulfillment`:

```sql
ALTER TABLE financial_transaction_fulfillment
    ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE financial_transaction_fulfillment
    ADD COLUMN cancel_id INTEGER;
```

Alteracoes em `bank_transfer`:

```sql
ALTER TABLE bank_transfer
    ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE bank_transfer
    ADD COLUMN cancel_id INTEGER;
```

Adicionar constraints quando suportado pelo banco alvo:

- `status IN ('ACTIVE', 'CANCELED', 'ADJUSTMENT')`;
- `cancel_id` referencia a propria tabela;
- `cancel_id` nulo para movimentos `ACTIVE`;
- `cancel_id` preenchido para movimentos `ADJUSTMENT`.

Se o banco/teste nao suportar bem `ALTER TABLE` com `CHECK` e FK self-reference,
validar a regra no service nesta etapa e deixar constraint forte para migration
futura.

## Entidades e DTOs

Em `FinancialTransactionFulfillment`:

- adicionar `status`;
- adicionar referencia ou `cancelId` para a baixa original;
- default `ACTIVE`.

Em `BankTransfer`:

- adicionar `status`;
- adicionar referencia ou `cancelId` para a transferencia original;
- default `ACTIVE`.

DTOs de baixa devem incluir:

```java
CashMovementStatus status,
Long cancelId
```

DTOs de transferencia devem incluir:

```java
CashMovementStatus status,
Long cancelId
```

O nome exato do enum pode ser ajustado ao pacote do dominio, mas deve ser
compartilhado apenas se isso reduzir duplicacao sem acoplar dominios demais.

## Regras de compatibilidade

- Dados existentes devem aparecer como `ACTIVE`.
- Requests de criacao nao devem aceitar `status` nem `cancelId`; o backend
  controla esses campos.
- Listagens existentes continuam retornando todos os registros por enquanto.
- O frontend pode filtrar depois, mas o backend nao deve esconder ajustes nesta
  etapa.

## Testes

Adicionar cobertura para:

- migration cria campos com default `ACTIVE`;
- criar baixa retorna `status = ACTIVE` e `cancelId = null`;
- criar transferencia retorna `status = ACTIVE` e `cancelId = null`;
- DTO de detalhe/listagem inclui os novos campos.

## Acceptance criteria

- Schema suporta rastrear movimento original e ajuste.
- APIs retornam `status` e `cancelId`.
- Nenhum fluxo ainda cria ajuste automaticamente.
- Nenhum movimento existente perde efeito de caixa por causa do novo `status`.
