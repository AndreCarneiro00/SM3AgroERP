# Plano 06: cancelamento de transacao financeira paga

## Prioridade

P3. Este plano integra o cancelamento da transacao financeira com as baixas que
ja afetaram caixa.

## Dependencias

- Plano 04.

## Goal

Cancelar uma transacao financeira sem apagar nem reescrever baixas pagas.

Quando uma transacao tem baixas ativas, o cancelamento deve:

- criar ajuste para cada baixa ativa;
- validar qualquer ajuste que gere saida de caixa;
- manter baixas originais rastreaveis;
- marcar a transacao como `CANCELED` somente se todos os ajustes forem salvos.

## Escopo

Inclui:

- `FinancialTransactionService.cancel`;
- possivel request de cancelamento com data/observacao;
- reutilizacao do fluxo de cancelamento de baixa;
- testes de service/controller.

Nao inclui:

- cancelamento de transferencia bancaria.
- ajuste de estoque. Transacao com movimento de estoque continua bloqueada.

## Endpoint

Endpoint atual:

```text
POST /financial-transactions/{id}/cancel
```

Para transacoes com baixas, adicionar request com data explicita:

```java
record CancelFinancialTransactionRequest(
        LocalDate adjustmentDate,
        String observation
) {
}
```

Regra recomendada:

- se a transacao nao tem baixas, permitir cancelamento sem `adjustmentDate`;
- se a transacao tem baixas ativas, exigir `adjustmentDate`;
- nao usar `LocalDate.now()` implicitamente para estorno de caixa.

## Fluxo

Ao cancelar transacao:

1. Buscar transacao.
2. Bloquear se houver movimentos de estoque vinculados.
3. Buscar baixas `ACTIVE`.
4. Para cada baixa ativa, projetar o ajuste necessario.
5. Se qualquer ajuste gerar saldo negativo, falhar tudo.
6. Criar ajustes `ADJUSTMENT` para todas as baixas ativas.
7. Marcar baixas originais como `CANCELED`.
8. Marcar transacao como `CANCELED`.

Tudo deve ocorrer na mesma transacao de banco.

## Regras de saldo

- Cancelar baixa de `EXPENSE` gera entrada, entao normalmente nao negativara a
  conta.
- Cancelar baixa de `INCOME` gera saida, entao deve validar saldo projetado.
- Se uma receita paga sustentava despesas ou transferencias posteriores, o
  cancelamento pode falhar.

## Status operacional

Depois do cancelamento:

- `financial_transaction.status = CANCELED`;
- baixas originais ficam `CANCELED`;
- ajustes ficam `ADJUSTMENT`;
- DTO de detalhe deve permitir rastrear original e ajuste.

## Testes

Adicionar cobertura para:

- cancelar transacao pendente sem baixas continua funcionando;
- cancelar transacao com estoque continua falhando;
- cancelar transacao paga cria ajuste para cada baixa ativa;
- cada ajuste tem `status = ADJUSTMENT` e `cancelId`;
- cada baixa original fica `CANCELED`;
- transacao fica `CANCELED`;
- se algum ajuste de receita negativar conta, nada e salvo;
- baixa original permanece rastreavel apos cancelamento.

## Acceptance criteria

- Cancelar transacao paga nao apaga baixa.
- Cancelar transacao paga nao zera valores historicos.
- Caixa fica explicado por baixa original + ajuste.
- Operacao e atomica.
