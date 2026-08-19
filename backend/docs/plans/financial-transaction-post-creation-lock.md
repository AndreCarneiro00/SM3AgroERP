# Plano: bloquear alteracoes estruturais em transacao cadastrada

## Goal

Desabilitar alteracoes estruturais em transacao financeira ja cadastrada.

O fluxo suportado passa a ser:

1. itens financeiros sao definidos somente na criacao completa da transacao;
2. transacao existente nao recebe novo item avulso, com ou sem estoque;
3. item existente nao pode ser editado depois da criacao;
4. item existente nao pode ser deletado depois da criacao;
5. tipo da transacao e imutavel depois da criacao;
6. data de emissao (`issueDate`) e imutavel depois da criacao;
7. frontend deve deixar `type` e `issueDate` desabilitados em edicao;
8. frontend continua enviando `type` e `issueDate` no payload de update, mas com
   os valores atuais;
9. backend deve comparar os valores recebidos com a transacao persistida e
   rejeitar qualquer alteracao.

Este plano substitui a ideia anterior de permitir item avulso com estoque em
transacao existente. A decisao e manter o fluxo mais simples e evitar
reconciliacao parcial de estoque, pagamentos, datas, tipo e totais.

## Current State

### Backend

`FinancialTransactionItemService.create` hoje permite criar item avulso em
transacao existente quando o produto nao controla estoque. Produto estocavel ja
e bloqueado para evitar bypass do fluxo completo de estoque.

`FinancialTransactionItemService.update` e `delete` existem e bloqueiam apenas
casos especificos, como item com movimento de estoque, ultimo item e alocacoes
de pagamento.

`FinancialTransactionService.update` ja valida alteracao de tipo quando a
transacao possui movimento de estoque. Este plano torna o tipo sempre imutavel
apos a criacao, independentemente de estoque.

`issueDate` ainda e editavel. Isso pode gerar divergencia entre a data da
transacao e datas ja usadas por estoque, relatorios e regras financeiras.

### Frontend

`TransactionsTab` abre `TransactionItemDialog` para adicionar ou editar item em
transacao existente.

`TransactionDialog` permite editar campos da transacao existente. O campo
`type` e `issueDate` devem ficar visiveis para contexto, mas nao editaveis.

## Design Decisions

### Itens imutaveis apos criacao

Itens financeiros devem ser criados junto com a transacao, pelo fluxo completo.

Regras:

- item novo em transacao existente e proibido para qualquer produto;
- a proibicao vale tambem para item sem produto;
- a proibicao vale tambem para produto `hasStock = false`;
- a proibicao vale tambem para produto `hasStock = true`;
- item existente nao pode ser editado por endpoint avulso;
- item existente nao pode ser deletado por endpoint avulso;
- estoque continua sendo criado somente no create completo, conforme
  `connect-financial-transactions-to-inventory.md`;
- nao criar fluxo alternativo para escolher lote ou criar lote em item avulso;
- nao recalcular total por alteracao avulsa de item, porque a alteracao nao
  deve ocorrer.

Mensagem sugerida:

```text
Financial transaction items can only be defined during transaction creation.
```

### Tipo de transacao imutavel

O tipo da transacao (`INCOME` ou `EXPENSE`) define a direcao financeira e, quando
ha produto estocavel, a direcao do estoque.

Regra:

- `FinancialTransactionService.update` deve carregar a transacao existente antes
  de aplicar alteracoes;
- se `request.type()` for diferente do tipo atual, rejeitar a atualizacao;
- a validacao deve ocorrer mesmo sem movimento de estoque;
- o frontend deve manter o campo `type` disabled em modo de edicao;
- o frontend continua enviando o tipo atual no payload;
- o backend continua sendo a fonte final da regra.

Mensagem sugerida:

```text
Financial transaction type cannot be changed after creation.
```

### Data de emissao imutavel

`issueDate` tambem passa a ser parte estrutural da transacao.

Regra:

- `FinancialTransactionService.update` deve comparar `request.issueDate()` com a
  data atual;
- se houver diferenca, rejeitar a atualizacao;
- a validacao deve ocorrer mesmo sem movimento de estoque;
- o frontend deve manter `issueDate` disabled em modo de edicao;
- o frontend continua enviando a data atual no payload;
- alteracoes futuras de data exigem plano separado para reconciliar estoque,
  relatorios e efeitos financeiros.

Mensagem sugerida:

```text
Financial transaction issue date cannot be changed after creation.
```

### Status HTTP

Para transacao existente, chamadas estruturais proibidas devem retornar `400 Bad
Request`.

Aplicacao:

- `POST /financial-transactions/{id}/items`;
- `PATCH /financial-transactions/{id}/items/{itemId}`;
- `DELETE /financial-transactions/{id}/items/{itemId}`;
- `PATCH /financial-transactions/{id}` quando tentar alterar `type`;
- `PATCH /financial-transactions/{id}` quando tentar alterar `issueDate`.

Se o id da transacao ou item nao existir, o comportamento pode continuar sendo
`404 Not Found`.

## Backend Plan

### 1. Bloquear criacao avulsa de item

Alterar `FinancialTransactionItemService.create` para rejeitar sempre.

Comportamento esperado:

- validar existencia da transacao se necessario para preservar `404`;
- rejeitar com `400 Bad Request` quando a transacao existir;
- nao criar `financial_transaction_items`;
- nao chamar `InventoryStockService`;
- nao criar `inventory_movement`;
- nao chamar `transactionService.recalculate`.

### 2. Bloquear edicao avulsa de item

Alterar `FinancialTransactionItemService.update` para rejeitar sempre.

Comportamento esperado:

- validar existencia da transacao/item se necessario para preservar `404`;
- rejeitar com `400 Bad Request` quando o item existir;
- nao alterar conta contabil, centro de custo, produto, quantidade, preco ou
  valor;
- nao recalcular transacao.

### 3. Bloquear delete avulso de item

Alterar `FinancialTransactionItemService.delete` para rejeitar sempre.

Comportamento esperado:

- validar existencia da transacao/item se necessario para preservar `404`;
- rejeitar com `400 Bad Request` quando o item existir;
- nao remover item;
- nao remover alocacoes;
- nao recalcular transacao.

### 4. Preservar create completo

Nao alterar o fluxo de `CreateFinancialTransactionUseCase`.

O create completo continua responsavel por:

- criar transacao;
- criar itens;
- aplicar regras de estoque quando produto controlar estoque;
- criar pagamentos e anexos;
- recalcular a transacao ao final;
- fazer rollback de tudo quando estoque falhar.

### 5. Tornar `type` e `issueDate` imutaveis no update

Alterar `FinancialTransactionService.update`:

1. carregar a transacao existente;
2. comparar `transaction.getType()` com `request.type()`;
3. se houver diferenca, rejeitar;
4. comparar `transaction.getIssueDate()` com `request.issueDate()`;
5. se houver diferenca, rejeitar;
6. remover dependencia da existencia de movimento de estoque para essas regras;
7. aplicar somente campos que continuam editaveis, como descricao,
   contraparte, vencimento, documento, observacao e indicador de NF.

### 6. Controller e erros

`FinancialTransactionController` pode manter as rotas de item para
compatibilidade, mas elas devem ser protegidas pelo service.

Resultado esperado:

- clientes antigos recebem erro claro;
- frontend novo nao chama essas rotas para criar, editar ou deletar item;
- nao remover rotas nesta etapa para evitar quebra estrutural desnecessaria.

### 7. MSW

Atualizar handler mockado do frontend:

- `POST /financial-transactions/:id/items` retorna `400`;
- `PATCH /financial-transactions/:id/items/:itemId` retorna `400`;
- `DELETE /financial-transactions/:id/items/:itemId` retorna `400`;
- update de transacao rejeita alteracao de `type`;
- update de transacao rejeita alteracao de `issueDate`;
- fixtures nao precisam mudar se ja representam transacoes criadas completas.

## Frontend Plan

### 1. Remover acoes de item em transacao existente

Em `TransactionsTab`:

- esconder ou remover botao/acao de adicionar item;
- esconder ou remover acao de editar item;
- esconder ou remover acao de deletar item;
- nao abrir `TransactionItemDialog` para transacao existente;
- manter listagem dos itens existentes em modo de consulta;
- se algum caminho interno tentar abrir o dialog, bloquear e mostrar mensagem
  clara.

### 2. Desabilitar tipo e data em edicao

No `TransactionDialog`:

- quando estiver criando transacao, `type` e `issueDate` permanecem editaveis;
- quando estiver editando transacao existente, `type` deve ficar disabled;
- quando estiver editando transacao existente, `issueDate` deve ficar disabled;
- manter ambos os valores visiveis para contexto;
- ao montar payload de update, continuar enviando `type` e `issueDate` com os
  valores atuais.

### 3. Tratamento de erro

Mesmo com as acoes removidas, tratar erro de backend caso ocorra chamada antiga
ou estado inconsistente:

- exibir mensagem da API;
- nao atualizar cache local como se item tivesse sido alterado;
- invalidar/refazer query somente quando a mutacao realmente tiver sucesso.

## Validation

### Backend

Testes esperados:

- `FinancialTransactionItemService.create` rejeita item sem produto com `400`;
- `FinancialTransactionItemService.create` rejeita produto sem estoque com
  `400`;
- `FinancialTransactionItemService.create` rejeita produto estocavel com `400`;
- `FinancialTransactionItemService.create` nao persiste item;
- `FinancialTransactionItemService.create` nao recalcula transacao;
- `FinancialTransactionItemService.create` nao cria movimento de estoque;
- `FinancialTransactionItemService.update` rejeita item existente com `400`;
- `FinancialTransactionItemService.update` nao altera item;
- `FinancialTransactionItemService.delete` rejeita item existente com `400`;
- `FinancialTransactionItemService.delete` nao remove item;
- `FinancialTransactionService.update` permite atualizar campos editaveis quando
  `type` e `issueDate` nao mudam;
- `FinancialTransactionService.update` rejeita mudar `INCOME` para `EXPENSE`;
- `FinancialTransactionService.update` rejeita mudar `EXPENSE` para `INCOME`;
- `FinancialTransactionService.update` rejeita alterar `issueDate`;
- create completo continua criando itens e movimentos de estoque.

### Frontend

Validacoes esperadas:

- `npm run build`;
- acao de adicionar item nao aparece para transacao existente;
- acao de editar item nao aparece para transacao existente;
- acao de deletar item nao aparece para transacao existente;
- `TransactionItemDialog` nao abre para transacao existente;
- `TransactionDialog` deixa `type` habilitado na criacao;
- `TransactionDialog` deixa `type` disabled na edicao;
- `TransactionDialog` deixa `issueDate` habilitado na criacao;
- `TransactionDialog` deixa `issueDate` disabled na edicao;
- payload de update envia `type` atual;
- payload de update envia `issueDate` atual;
- erro `400` do backend para rotas de item e exibido corretamente se ocorrer.

## Dependencies

- `connect-financial-transactions-to-inventory.md` implementado.
- Create completo de transacao funcionando com itens, pagamentos, anexos e
  estoque.
- Frontend ja carregando itens existentes para visualizacao.

## Out Of Scope

- Adicionar item em transacao existente.
- Editar item em transacao existente.
- Deletar item em transacao existente.
- Criar seletor de lote no `TransactionItemDialog`.
- Criar lote/movimento de estoque por item avulso.
- Reconciliacao de update/delete de item.
- Alterar `type` apos criacao.
- Alterar `issueDate` apos criacao.
- Cancelamento de transacao com movimento de estoque.
- Ajustes compensatorios de estoque.
