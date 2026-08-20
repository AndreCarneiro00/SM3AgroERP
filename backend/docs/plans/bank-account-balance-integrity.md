# Plano mestre: integridade de saldo bancario

## Goal

Fechar as brechas que permitem uma conta bancaria ficar negativa ou perder a
base historica do saldo depois que ja existem movimentos vinculados.

Este arquivo e o indice do trabalho. A implementacao deve seguir os planos
menores abaixo, em ordem de prioridade.

## Sequencia recomendada

1. [Guardrails de conta bancaria](bank-account-balance-integrity-01-account-guardrails.md)
2. [Metadados auditaveis de movimentos de caixa](bank-account-balance-integrity-02-cash-movement-audit-fields.md)
3. [Motor centralizado de projecao de saldo](bank-account-balance-integrity-03-balance-projection-engine.md)
4. [Baixas financeiras sem rewrite historico](bank-account-balance-integrity-04-fulfillment-cash-history.md)
5. [Transferencias sem rewrite historico](bank-account-balance-integrity-05-transfer-cash-history.md)
6. [Cancelamento de transacao financeira paga](bank-account-balance-integrity-06-transaction-cancel-cash-adjustments.md)
7. [UX frontend para integridade de saldo](bank-account-balance-integrity-07-frontend-ux.md)

## Decisoes confirmadas

- Saldo negativo e proibido sempre.
- Transacao financeira so afeta caixa quando existe baixa/pagamento.
- Cadastro de transacao pode afetar estoque, mas nao caixa.
- Transferencia registrada afeta caixa na `transferDate`.
- Transacao futura nao paga nao entra no saldo bancario.
- Edicao/delecao com efeito caixa nao deve reescrever historico.
- Ajuste/estorno deve ser rastreavel por `status = ADJUSTMENT` e `cancel_id`.
- Cancelamento de transferencia deve criar transferencia inversa.
- Nao usar tabela generica de ajuste bancario neste plano.
- `initialBalance = null` equivale a zero.
- Novas contas devem persistir saldo inicial nulo como zero.
- `initialBalance` e `initialBalanceDate` nao podem ser editados apos criacao.
- Conta com movimentos pode ser inativada.
- Conta com movimentos nao pode ser deletada.
- `BankTransferService.update` deve permitir apenas campos sem impacto de caixa,
  como `observation`.
- DTOs devem expor `status` e `cancelId` nos movimentos que passarem a ter
  auditoria.
- Mensagens podem continuar em ingles no backend.

## Prioridade e criterio de corte

Os planos 01 a 03 corrigem a integridade basica e criam a fundacao tecnica.
Eles devem ser feitos antes de qualquer mudanca de UI.

Os planos 04 e 05 fecham os pontos que reescrevem caixa diretamente. Eles devem
preferir endpoints explicitos de cancelamento/ajuste em vez de transformar
`DELETE` em estorno implicito.

O plano 06 integra o cancelamento da transacao financeira com as baixas ja
pagas. Ele depende do fluxo de ajuste de baixas.

O plano 07 e camada de UX. O backend continua sendo a fonte de verdade.

## Definition of Done global

- Nenhum service fora de `BankBalanceService` recalcula saldo manualmente.
- Toda saida de caixa valida a linha do tempo projetada da conta.
- Nenhuma operacao aceita saldo negativo em qualquer dia projetado.
- Movimento que ja afetou caixa nao e alterado nem removido fisicamente.
- Ajustes ficam rastreaveis pelo movimento original.
- Testes backend cobrem os cenarios criticos de cada plano.
