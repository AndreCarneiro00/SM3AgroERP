# Plano 04: baixas financeiras sem rewrite historico

## Prioridade

P2. Este plano fecha a brecha de editar ou deletar baixa que ja afetou caixa.

## Dependencias

- Plano 02.
- Plano 03.

## Goal

- Impedir update direto de campos com efeito caixa em baixa persistida.
- Impedir delete fisico de baixa persistida.
- Criar fluxo explicito de cancelamento/estorno de baixa.
- Validar qualquer estorno que gere saida de caixa.
- Manter a baixa original rastreavel.

## Escopo

Inclui:

- `FinancialTransactionFulfillmentService.update`.
- `FinancialTransactionFulfillmentService.delete`.
- endpoint explicito para cancelar baixa.
- criacao de linha `ADJUSTMENT`.
- atualizacao do calculo de status/pago da transacao para considerar apenas
  movimentos ativos quando aplicavel.
- testes de service/controller.

Nao inclui:

- cancelamento da transacao inteira. Isso fica no plano 06.
- UI de cancelamento. Isso fica no plano 07.

## Regra de update

Baixa persistida nao pode alterar diretamente:

- `bankAccount`;
- `paymentDate`;
- `amountPaid`;
- `allocations`.

Permitir apenas campos sem impacto historico, inicialmente:

- `observation`.

Se o request tentar alterar campo com efeito historico, retornar erro.

Mensagem sugerida:

```text
Paid fulfillment cash fields cannot be changed. Use a cancellation adjustment.
```

## Regra de delete

`DELETE /financial-transactions/{id}/fulfillments/{fulfillmentId}` nao deve
remover fisicamente a baixa.

Opcoes aceitas para implementacao:

- retornar erro orientando usar endpoint de cancelamento;
- ou manter o endpoint apenas para baixas que nunca afetaram caixa, se esse
  estado existir no futuro.

Como o schema atual registra toda baixa como movimento de caixa, a opcao
recomendada agora e bloquear o `DELETE`.

Mensagem sugerida:

```text
Paid fulfillment cannot be deleted. Use a cancellation adjustment.
```

## Endpoint de cancelamento

Adicionar endpoint explicito, por exemplo:

```text
POST /financial-transactions/{id}/fulfillments/{fulfillmentId}/cancel
```

Request sugerida:

```java
record CancelFinancialTransactionFulfillmentRequest(
        LocalDate adjustmentDate,
        String observation
) {
}
```

`adjustmentDate` deve ser obrigatoria para evitar estorno implicito com
`LocalDate.now()`.

## Criacao do ajuste

Ao cancelar uma baixa:

- buscar baixa original ativa;
- validar que ela pertence a transacao informada;
- criar nova `financial_transaction_fulfillment` com `status = ADJUSTMENT`;
- preencher `cancel_id` apontando para a baixa original;
- copiar `financialTransaction`, `bankAccount` e `amountPaid`;
- usar `adjustmentDate` como `paymentDate`;
- marcar baixa original como `CANCELED`;
- manter alocacoes originais intactas.

Sinal economico:

- baixa original de `EXPENSE` era saida; ajuste vira entrada;
- baixa original de `INCOME` era entrada; ajuste vira saida;
- `BankBalanceService` deve derivar essa inversao pelo `status = ADJUSTMENT` e
  `cancel_id`.

Validacao:

- se o ajuste gerar saida de caixa, validar saldo projetado antes de salvar;
- se falhar, nao alterar a baixa original.

## Pagamento e status da transacao

Ao recalcular a transacao:

- baixas `ACTIVE` contam como valor pago;
- baixas `CANCELED` nao devem contar como valor pago operacional;
- baixas `ADJUSTMENT` nao devem aumentar o valor pago operacional;
- a soma de ledger para banco continua considerando original + ajuste.

Essa separacao evita que auditoria de caixa distorca `PAID`, `PARTIAL` e
`PENDING`.

## Testes

Adicionar cobertura para:

- editar apenas `observation` de baixa persistida;
- tentar editar `bankAccount` falha;
- tentar editar `paymentDate` falha;
- tentar editar `amountPaid` falha;
- tentar editar `allocations` falha;
- `DELETE` de baixa persistida falha;
- cancelar baixa cria ajuste com `status = ADJUSTMENT` e `cancelId`;
- baixa original fica `CANCELED`;
- baixa original permanece rastreavel;
- ajuste de despesa aumenta saldo;
- ajuste de receita reduz saldo;
- estornar receita que sustentava despesa posterior falha;
- recalculo da transacao ignora baixas `CANCELED` e `ADJUSTMENT` no valor pago.

## Acceptance criteria

- Nenhum endpoint altera caixa historico de baixa persistida.
- Toda correcao de caixa em baixa passa por ajuste auditavel.
- Estorno que possa negativar conta e bloqueado antes de salvar.
- DTOs mostram `status` e `cancelId`.
