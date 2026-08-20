# Plano 01: guardrails de conta bancaria

## Prioridade

P0. Este plano e pequeno, independente e remove duas brechas diretas:
reescrever saldo inicial e deletar conta com movimentos.

## Goal

- Bloquear qualquer alteracao de `initialBalance` apos a criacao da conta.
- Bloquear qualquer alteracao de `initialBalanceDate` apos a criacao da conta.
- Persistir `initialBalance = BigDecimal.ZERO` quando a criacao receber nulo.
- Impedir delecao de conta com baixa financeira ou transferencia vinculada.
- Continuar permitindo edicao de campos cadastrais e inativacao.

## Escopo

Inclui:

- `BankAccountService.create`.
- `BankAccountService.update`.
- `BankAccountService.delete`.
- Queries de existencia/contagem nos repositorios de baixa e transferencia.
- Testes de controller/service existentes.

Nao inclui:

- Estorno de movimentos.
- Mudanca visual no frontend.
- Migracao para tornar `bank_account.initial_balance` `NOT NULL`.

## Implementacao

Adicionar em `FinancialTransactionFulfillmentRepository`:

```java
boolean existsByBankAccountId(Long bankAccountId);
long countByBankAccountId(Long bankAccountId);
```

Adicionar em `BankTransferRepository`:

```java
boolean existsBySourceBankAccountIdOrDestinationBankAccountId(
        Long sourceBankAccountId,
        Long destinationBankAccountId
);

long countBySourceBankAccountIdOrDestinationBankAccountId(
        Long sourceBankAccountId,
        Long destinationBankAccountId
);
```

Se o Spring Data nao derivar algum nome com seguranca, usar `@Query` explicita.

No `create`:

- salvar `initialBalance` como `BigDecimal.ZERO` quando vier nulo;
- manter `initialBalanceDate` opcional;
- manter `BankBalanceService` tratando nulo como zero para dados legados.

No `update`:

- buscar a conta atual;
- comparar `initialBalance` recebido com o valor persistido;
- tratar `null` e zero como equivalentes;
- comparar valores nao nulos com `BigDecimal.compareTo`;
- comparar `initialBalanceDate` com `Objects.equals`;
- rejeitar qualquer mudanca nesses dois campos, mesmo sem movimentos.

Mensagem recomendada:

```text
Initial bank balance cannot be changed after account creation.
```

Campos que continuam editaveis:

- `name`;
- `active`;
- `accountType`;
- `accountGroup`;
- `financialInstitution`;
- `agency`;
- `accountNumber`.

No `delete`:

- buscar a conta;
- se houver baixa com `bankAccount.id = id`, rejeitar;
- se houver transferencia com `sourceBankAccount.id = id`, rejeitar;
- se houver transferencia com `destinationBankAccount.id = id`, rejeitar;
- deletar apenas conta sem movimentos.

Mensagem recomendada:

```text
Bank account cannot be deleted because it has financial movements.
```

## Testes

Adicionar ou ajustar cobertura para:

- nao editar `initialBalance` de conta com baixa;
- nao editar `initialBalanceDate` de conta com transferencia;
- nao editar `initialBalance` de conta sem movimentos;
- nao editar `initialBalanceDate` de conta sem movimentos;
- tratar `null` e `0.00` como equivalentes na comparacao de saldo inicial;
- permitir editar nome/agencia de conta com movimentos;
- permitir inativar conta com movimentos;
- nao deletar conta com baixa;
- nao deletar conta com transferencia como origem;
- nao deletar conta com transferencia como destino;
- permitir deletar conta sem movimentos;
- criar conta sem `initialBalance` deve persistir/calcular zero.

## Acceptance criteria

- `PUT /bank-account/{id}` nunca altera saldo inicial nem data inicial.
- `DELETE /bank-account/{id}` falha quando a conta tem qualquer movimento.
- Contas novas sem saldo inicial retornam `currentBalance = 0`.
- Nenhum calculo de saldo foi duplicado fora de `BankBalanceService`.
