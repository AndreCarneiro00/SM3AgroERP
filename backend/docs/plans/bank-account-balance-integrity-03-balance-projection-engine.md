# Plano 03: motor centralizado de projecao de saldo

## Prioridade

P1. Este plano torna `BankBalanceService` a unica fonte de verdade para validar
se uma operacao deixa saldo negativo em qualquer ponto da linha do tempo.

## Dependencias

- Plano 01 recomendado.
- Plano 02 recomendado antes de finalizar regras com `status`.

## Goal

- Centralizar validacao cronologica em `BankBalanceService`.
- Validar por projecao, nao por saldo atual.
- Aceitar multiplos movimentos candidatos.
- Excluir multiplos movimentos persistidos durante update/cancelamento.
- Proibir saldo negativo sempre.
- Preparar APIs internas para baixas, transferencias e estornos.

## Regra de saldo

Conta bancaria nao pode ficar negativa em nenhum dia projetado.

A validacao deve:

1. partir do saldo inicial na data inicial;
2. carregar movimentos persistidos;
3. excluir os movimentos substituidos/cancelados pela operacao corrente;
4. adicionar movimentos candidatos;
5. ordenar/agrupar por data;
6. bloquear se o saldo ficar menor que zero em qualquer dia.

Para este corte, saldo liquido diario e suficiente. Nao e necessario ordenar
eventos dentro do mesmo dia.

## Escopo

Inclui:

- refatorar API interna de `BankBalanceService`;
- manter `LedgerMovement` encapsulado;
- atualizar validacoes existentes de baixa, transferencia e mudanca de tipo;
- adicionar validacoes para cenarios de estorno usados nos planos seguintes;
- incluir movimentos `ACTIVE`, `CANCELED` e `ADJUSTMENT` como eventos de ledger.

Nao inclui:

- endpoints de cancelamento;
- criacao de ajustes;
- calculo de saldo no frontend.

## API sugerida

Preferir metodos publicos por caso de uso:

```java
void validateFulfillmentCreationOrUpdate(...);
void validateFulfillmentAdjustment(...);
void validateTransferCreationOrUpdate(...);
void validateTransferAdjustment(...);
void validateTransactionTypeChange(...);
```

Manter `LedgerMovement` privado para evitar services externos montando sinal
errado.

Internamente, `findFirstNegativeProjection` deve aceitar:

```java
Set<Long> excludedTransferIds
Set<Long> excludedFulfillmentIds
List<LedgerMovement> candidateMovements
```

## Status e sinal economico

Baixas:

- baixa de transacao `INCOME` gera entrada;
- baixa de transacao `EXPENSE` gera saida;
- baixa `ADJUSTMENT` inverte o efeito da baixa apontada por `cancel_id`;
- se a baixa `ADJUSTMENT` nao tiver original carregavel, falhar com erro de
  consistencia.

Transferencias:

- conta origem gera saida;
- conta destino gera entrada;
- transferencia `ADJUSTMENT` deve ser uma transferencia inversa real;
- por isso o calculo pode continuar olhando origem/destino/valor/data da linha.

Status:

- nao excluir `CANCELED` do calculo de saldo;
- nao excluir `ADJUSTMENT` do calculo de saldo;
- `CANCELED` e metadado de auditoria da linha original, nao remocao do ledger.

## Regras existentes que devem continuar

- Operacao nao pode ocorrer antes de `initialBalanceDate`.
- Criar transferencia valida a conta origem.
- Criar baixa de `EXPENSE` valida a conta usada na baixa.
- Criar baixa de `INCOME` nao precisa validar saldo, pois cria entrada.
- Mudar transacao com baixas para `EXPENSE` continua bloqueado se negativar
  qualquer conta.

## Novas validacoes

- Criar saida em conta que ja esta negativa deve falhar.
- Estorno de baixa `INCOME` deve ser validado, pois remove entrada e gera saida
  economica.
- Cancelamento de transferencia deve validar a conta que recebeu a entrada
  original, pois a transferencia inversa debita essa conta.
- Remover, atrasar ou reduzir entrada que sustentava saidas futuras deve falhar.

## Testes

Adicionar cobertura em `BankBalanceServiceIT` e services que consomem o saldo:

- criar baixa de `EXPENSE` em conta ja negativa falha;
- criar transferencia em conta ja negativa falha;
- baixa `ADJUSTMENT` de `INCOME` que sustentava despesa posterior falha;
- transferencia inversa que sustentava despesa posterior falha;
- multiplos movimentos excluidos e candidatos sao projetados juntos;
- saldo de conta considera linha original e ajuste como eventos separados;
- saldo antes de `initialBalanceDate` continua zero.

## Acceptance criteria

- Nenhum service externo calcula saldo manualmente.
- Todas as validacoes de caixa passam por `BankBalanceService`.
- Projecao bloqueia o primeiro dia negativo, nao apenas saldo atual.
- A estrutura suporta os planos de baixa e transferencia sem nova refatoracao.
