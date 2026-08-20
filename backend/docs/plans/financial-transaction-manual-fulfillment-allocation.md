# Plano: alocacao manual de pagamentos por item financeiro

## Goal

Fazer com que `financial_transaction_fulfillment_item_allocation` seja definido
por input em tela, sem rateio silencioso pelo frontend ou pelo mock.

Quando o usuario registrar ou editar uma baixa/pagamento, ele deve informar
quanto daquele pagamento foi destinado a cada item financeiro.

O plano cobre explicitamente:

1. criacao de transacao ja paga ou parcialmente paga no `TransactionDialog`;
2. acao de `+ Pagamento` na expansao da transacao;
3. icone de registrar pagamento em transacoes pendentes;
4. edicao de pagamento existente na tabela de pagamentos;
5. MSW/fixtures para o contrato local bater com o backend real.

## Current State

- A tabela `financial_transaction_fulfillment_item_allocation` ja existe em
  `V1__initial_shema.sql`.
- Cada alocacao aponta para:
  - `financial_transaction_fulfillment.id`;
  - `financial_transaction_items.id`;
  - `amount`.
- O backend ja recebe `allocations` em:
  - `FinancialTransactionFulfillmentRequest`;
  - `UpdateFinancialTransactionFulfillmentRequest`.
- `FinancialTransactionFulfillmentAllocationRequest` aceita `itemId` ou
  `itemIndex`.
- `FinancialTransactionFulfillmentService` ja valida:
  - `allocations` obrigatorias;
  - exatamente um entre `itemId` e `itemIndex`;
  - soma das alocacoes igual a `amountPaid`;
  - alocacao acumulada por item nao excede o valor do item.
- Na pratica, o usuario ainda nao informa a distribuicao em tela. O frontend
  calcula automaticamente antes de enviar.
- `TransactionDialog` usa `allocateFulfillmentsByItemIndex` para criar
  alocacoes por indice de item quando a transacao nasce paga/parcial.
- `TransactionsTab` usa `buildFulfillmentAllocationsByItemId` quando o usuario
  registra ou edita um pagamento em transacao existente.
- `FulfillmentDialog` hoje coleta apenas conta, data, valor e observacao.
- O MSW tambem gera alocacoes automaticamente quando o payload chega sem
  `allocations`.

## Decisions Confirmed

1. O frontend pode pre-preencher ou sugerir alocacoes, inclusive em cenarios com
   mais de um item, desde que os valores fiquem visiveis e editaveis antes do
   submit.
2. "Input em tela" significa que o usuario tem opcao real de alterar a
   distribuicao. O problema a remover e o rateio sem controle do usuario.
3. Na criacao da transacao, a UI nao deve depender de `itemIndex` como chave de
   estado. Cada item em draft deve ter uma chave local estavel no TypeScript, e
   o submit deve converter essa chave para o `itemIndex` final aceito pelo
   backend.
4. Edicao visual de item, valor ou ordem durante a criacao deve manter a
   experiencia coerente: alocacoes seguem o item pela chave local, valores
   digitados sao preservados quando possivel e o submit bloqueia se ficarem
   invalidos.
5. Cada pagamento parcial deve ter sua propria grade de alocacao.
6. No `+ Pagamento`, sugestao de alocacao e permitida para casos triviais e
   nao triviais, mas deve continuar editavel.
7. Se `amountPaid` mudar durante a edicao de um pagamento, manter as alocacoes
   atuais e bloquear o submit ate a soma bater com o novo valor.
8. Dados legados ou mockados sem alocacao devem exigir preenchimento da
   distribuicao antes de salvar.
9. A regra de arredondamento do frontend deve seguir o backend: centavos exatos.
10. Um item pode receber alocacoes parciais em varios pagamentos, desde que a
    soma acumulada nao ultrapasse o valor do item.
11. Itens de transacao existente sao imutaveis: eles so sao criados junto com a
    transacao. Portanto, `+ Pagamento` e edicao de pagamento sempre usam
    `itemId`.
12. Mensagens de validacao podem continuar usando `window.alert` neste corte.
    Melhorias de UX inline ficam para outra task.

## Design Decisions

### Schema

Nao criar migration para esta mudanca.

O modelo atual ja representa a regra desejada: uma baixa possui varias
alocacoes, cada alocacao referencia um item financeiro e tem valor proprio.

Atualizar apenas documentacao do schema para registrar que a origem da alocacao
e input explicito do usuario, nao rateio automatico.

### API contract

Manter o contrato atual:

```json
{
  "bankAccountId": 1,
  "paymentDate": "2025-06-14",
  "amountPaid": 1500.00,
  "allocations": [
    { "itemId": 10, "amount": 900.00 },
    { "itemId": 11, "amount": 600.00 }
  ],
  "observation": "Pagamento parcial"
}
```

Na criacao de uma transacao, os itens ainda nao tem `id`. Internamente, a UI
deve controlar alocacoes por uma chave local estavel do item em draft. Apenas
no submit o frontend converte essa chave local para `itemIndex`:

```json
{
  "bankAccountId": 1,
  "paymentDate": "2025-06-14",
  "amountPaid": 1500.00,
  "allocations": [
    { "itemIndex": 0, "amount": 900.00 },
    { "itemIndex": 1, "amount": 600.00 }
  ]
}
```

Nos endpoints de `+ Pagamento` e edicao de pagamento, os itens ja existem e
sao imutaveis. Nesses fluxos o frontend deve enviar `itemId`.

### Validacao

A UI deve validar antes do submit, mas o backend continua sendo a fonte de
verdade.

Regras da UI:

- `allocations` nao pode ser vazio quando houver pagamento;
- cada valor informado deve ser maior que zero para entrar no payload;
- soma das alocacoes deve ser igual a `amountPaid`;
- total alocado em um item, considerando outros pagamentos, nao pode exceder o
  valor do item;
- na edicao de pagamento, as alocacoes do pagamento editado devem ser
  excluidas do calculo de "ja alocado";
- a diferenca entre `amountPaid` e soma alocada deve ficar visivel.
- comparacoes monetarias devem usar centavos exatos, coerentes com a
  normalizacao de 2 casas do backend.

### UX

Mostrar a alocacao como uma grade dentro do formulario de pagamento:

| Item | Valor do item | Ja alocado | Disponivel | Alocar neste pagamento |
| --- | ---: | ---: | ---: | ---: |

Na criacao da transacao, o label do item pode usar conta contabil, centro de
custo, produto e valor, conforme dados disponiveis no draft.

No `+ Pagamento` e na edicao de pagamento, usar os itens persistidos da
transacao e resolver labels com os catalogos ja carregados na tela.

Sugestoes de alocacao sao permitidas para reduzir trabalho manual. A regra e
que toda sugestao deve aparecer como campo de input editavel antes do usuario
confirmar.

Se o usuario editar o valor do pagamento, manter as alocacoes existentes e
mostrar a diferenca ate a soma ficar valida. Nao reajustar silenciosamente
valores ja digitados.

## Backend Plan

### 1. Confirmar validacoes existentes

Revisar `FinancialTransactionFulfillmentService` para garantir que nao ha
nenhum caminho criando alocacao automatica.

Pontos esperados:

- `createAll` deve persistir somente `request.allocations()`;
- `create` deve persistir somente `request.allocations()`;
- `update` deve substituir alocacoes antigas por `request.allocations()`;
- `validateAndResolveAllocations` deve continuar bloqueando lista nula/vazia;
- `resolveAllocationItem` deve continuar aceitando exatamente uma referencia:
  `itemId` ou `itemIndex`.

### 2. Mensagens de erro

Se necessario, ajustar mensagens para ficarem claras para a UI:

- alocacao obrigatoria;
- soma alocada diferente do valor pago;
- item inexistente;
- item fora do range por `itemIndex`;
- valor alocado excede valor do item.

Nao mudar a regra de negocio para se adaptar ao frontend.

### 3. Testes backend

Adicionar ou reforcar testes para:

- criar transacao com pagamento inicial e alocacoes manuais por `itemIndex`;
- rejeitar criacao com pagamento inicial sem `allocations`;
- rejeitar criacao com soma das alocacoes diferente de `amountPaid`;
- registrar `+ Pagamento` com alocacoes manuais por `itemId`;
- editar pagamento substituindo as alocacoes antigas;
- rejeitar edicao em que a nova distribuicao excede o saldo de um item;
- permitir edicao mantendo o mesmo valor quando as alocacoes do proprio
  pagamento sao excluidas do calculo acumulado;
- rejeitar request que manda `itemId` e `itemIndex` juntos;
- rejeitar request que nao manda nenhum dos dois.

## Frontend Plan

### 1. Criar modelo de formulario para alocacoes

Evoluir `TransactionFulfillmentFormData` e o estado do `FulfillmentDialog` para
carregar uma lista de alocacoes editavel.

Na criacao da transacao, cada `TransactionItemFormData` deve receber uma chave
local estavel, por exemplo:

```ts
clientItemKey: string;
```

As alocacoes em draft devem referenciar essa chave local:

```ts
clientItemKey: string;
amount: number;
```

No submit, depois de normalizar/remover itens invalidos, converter
`clientItemKey` para o `itemIndex` final correspondente. Esse mapeamento evita
perder coerencia quando o usuario reordena ou edita itens antes de salvar.

Manter dois formatos no payload final:

- criacao de transacao: `{ itemIndex, amount }`;
- pagamento em transacao existente: `{ itemId, amount }`.

Valores zerados devem permanecer visiveis no formulario, mas devem ser
omitidos do payload.

Quando um item em draft for removido antes do submit, remover tambem as
alocacoes ligadas a sua chave local. Quando o valor do item mudar, preservar os
valores digitados e bloquear o submit se a alocacao passar do novo limite.

### 2. Remover rateio silencioso no `TransactionDialog`

Remover `allocateFulfillmentsByItemIndex`.

No submit:

- normalizar itens;
- validar pagamentos informados;
- validar as alocacoes digitadas por pagamento;
- converter alocacoes por `clientItemKey` para `itemIndex`;
- montar `normalizedFulfillments` com as alocacoes do formulario;
- nao criar ou alterar alocacoes de forma invisivel durante o submit.

Para `Ja quitado`:

- `amountPaid` continua sendo o total da transacao;
- usuario ainda precisa confirmar/distribuir esse total entre os itens;
- pode pre-preencher a alocacao sugerida, mas os valores devem aparecer como
  inputs editaveis e ser enviados como input de tela.

Para `Pago parcialmente`:

- cada pagamento parcial deve ter sua propria grade de alocacao;
- a soma das alocacoes de um pagamento deve bater com o valor daquele pagamento;
- a soma acumulada por item entre pagamentos parciais nao pode passar do valor
  do item.
- sugestoes de distribuicao podem ser geradas ao criar ou alterar pagamentos,
  desde que nao sobrescrevam valor digitado sem acao explicita do usuario.

### 3. Atualizar `FulfillmentDialog` para `+ Pagamento`

O `FulfillmentDialog` deve receber os itens da transacao e os pagamentos ja
existentes.

Adicionar props sugeridas:

```ts
transactionItems: FinancialTransactionItem[];
transactionFulfillments: FinancialTransactionFulfillment[];
```

No fluxo de `+ Pagamento`:

- pre-preencher `amount` com `remainingAmount`;
- iniciar alocacoes com sugestao editavel, inclusive quando houver mais de um
  item;
- permitir edicao manual por item;
- enviar `allocations` com `itemId`.

O botao `+ Pagamento` da expansao e o icone de registrar pagamento em linha
devem abrir o mesmo dialog com a grade de alocacao manual.

### 4. Atualizar edicao de pagamento existente

Ao editar um pagamento:

- carregar as alocacoes existentes no formulario;
- se um pagamento existente ou dado legado vier sem alocacoes, exigir
  preenchimento antes de salvar;
- mostrar quanto cada item ja recebeu em outros pagamentos;
- excluir o pagamento atual do calculo de valor ja alocado;
- permitir redistribuir o valor entre itens;
- manter as alocacoes atuais quando `amountPaid` mudar;
- bloquear o submit ate a soma das alocacoes bater com `amountPaid`;
- no submit, enviar a lista completa nova de alocacoes;
- backend deve substituir as alocacoes antigas por essa lista.

Esse fluxo usa a mesma UI do `+ Pagamento`; a diferenca e apenas o
preenchimento inicial e o `editingFulfillmentId`.

### 5. Criar helper compartilhado de validacao

Extrair uma funcao utilitaria para calcular disponibilidade por item.

Entrada sugerida:

```ts
type AllocationAvailabilityParams = {
  items: Array<FinancialTransactionItem | TransactionItemFormData>;
  fulfillments: Array<FinancialTransactionFulfillment | TransactionFulfillmentFormData>;
  editingFulfillmentId?: number;
  mode: 'draft' | 'persisted';
};
```

Saida sugerida:

```ts
type AllocationAvailability = {
  itemKey: string | number;
  itemAmount: number;
  alreadyAllocatedAmount: number;
  availableAmount: number;
};
```

Para criacao, `itemKey` representa `clientItemKey`. Para transacao existente,
representa `itemId`.

Adicionar tambem helper para sugestao editavel de alocacao. Ele pode distribuir
por saldo disponivel, mas deve ser chamado somente em eventos explicitos da UI,
como criacao de pagamento, botao de sugerir distribuicao ou mudanca de modo de
pagamento. O submit nao deve recalcular silenciosamente.

### 6. Listagem e detalhe

Manter a tabela de pagamentos mostrando "Itens pagos".

Depois da mudanca, esse campo deve refletir exatamente as alocacoes persistidas
e nao uma distribuicao calculada.

Se o pagamento vier sem alocacoes por dados legados, mostrar `-` ou uma mensagem
neutra na listagem. Ao editar esse pagamento, exigir que o usuario preencha a
grade antes de salvar.

## MSW Plan

### 1. Remover fallback automatico

Alterar `resolveFulfillmentAllocations` em
`frontend/src/core/msw/handlers/financial.ts`.

Nova regra:

- se `allocations` vier `undefined` ou vazio, retornar erro;
- nao gerar `generatedAllocations`;
- manter validacoes de soma e limite por item.

### 2. Remover geracao em detalhe

Em `buildTransactionDetail`, remover o trecho que popula `fulfillment.allocations`
quando esta ausente.

O mock deve devolver o que esta nos fixtures.

### 3. Fixtures

Garantir que todos os `financialTransactionFulfillments` de fixtures tenham
`allocations` explicitas.

Se algum fixture propositalmente representar dado legado sem alocacao, documentar
e cobrir na UI como exibicao sem alocacao, nao como calculo automatico.

## Documentation Plan

Atualizar `docs/database/schema-reference.md`:

- marcar `financial_transaction_fulfillment_item_allocation` como alocacao
  manual informada no pagamento;
- registrar que a soma das alocacoes deve bater com
  `financial_transaction_fulfillment.amount_paid`;
- registrar que o backend valida limite por item;
- remover qualquer texto que sugira rateio automatico.

## Implementation Order

1. Adicionar testes backend para travar o contrato manual.
2. Ajustar mensagens/validacoes backend apenas se os testes revelarem lacuna.
3. Criar helper de disponibilidade/validacao de alocacao no frontend.
4. Atualizar `TransactionDialog` para capturar alocacoes por `clientItemKey` e
   converter para `itemIndex` no submit.
5. Atualizar `FulfillmentDialog` para capturar alocacoes por `itemId`.
6. Passar `transactionItems` e `transactionFulfillments` de `TransactionsTab`
   para o `FulfillmentDialog`.
7. Implementar sugestao editavel de distribuicao por item.
8. Remover `buildFulfillmentAllocationsByItemId`.
9. Remover `allocateFulfillmentsByItemIndex`.
10. Remover geracao automatica no MSW.
11. Atualizar fixtures e documentacao.
12. Rodar backend e frontend.

## Tests

### Backend

Rodar:

```powershell
cd backend
.\mvnw test
```

Cobrir pelo menos:

- `CreateFinancialTransactionUseCaseIT` para criacao com pagamento inicial e
  alocacao manual por `itemIndex`;
- `FinancialTransactionControllerIT` para `POST /fulfillments` com alocacao por
  `itemId`;
- `FinancialTransactionControllerIT` para `PATCH /fulfillments/{fulfillmentId}`
  redistribuindo alocacoes;
- casos negativos de payload sem alocacao, soma divergente e excesso por item.

### Frontend

Rodar:

```powershell
cd frontend
npm run build
```

Validar manualmente:

- criar transacao `Ja quitado` com dois itens e alocar valores manualmente;
- criar transacao `Pago parcialmente` com dois pagamentos e distribuir cada um;
- reordenar ou editar itens durante a criacao e confirmar que as alocacoes
  seguem visualmente o item correto;
- usar o `+ Pagamento` da expansao da transacao;
- usar o icone de registrar pagamento em uma transacao pendente;
- editar pagamento existente e trocar a distribuicao entre itens;
- editar `amountPaid` de um pagamento e confirmar que o submit fica bloqueado
  ate a soma das alocacoes bater;
- tentar salvar quando soma alocada nao bate com valor pago;
- tentar alocar valor acima do disponivel do item.

## Acceptance Criteria

- Nenhum fluxo de pagamento gera ou altera alocacao silenciosamente no submit.
- Sugestoes de alocacao podem existir, mas sempre aparecem como inputs
  editaveis antes da confirmacao.
- Criacao de transacao paga/parcial exige alocacao digitada para cada
  pagamento criado junto com a transacao.
- `+ Pagamento` exige alocacao digitada por item antes de salvar.
- Edicao de pagamento mostra as alocacoes atuais e salva a nova distribuicao
  informada pelo usuario.
- Edicao de `amountPaid` preserva as alocacoes atuais e bloqueia submit ate a
  soma ficar coerente.
- Durante criacao, edicao/reordem de itens mantem alocacoes coerentes por chave
  local e converte corretamente para `itemIndex` no payload.
- Backend persiste exatamente as alocacoes recebidas no payload.
- Backend continua bloqueando soma divergente e excesso por item.
- MSW rejeita payload sem alocacao em vez de preencher automaticamente.
- Listagem de pagamentos mostra as alocacoes persistidas, sem recalculo
  implicito.
