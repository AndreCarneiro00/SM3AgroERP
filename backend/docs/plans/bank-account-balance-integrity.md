# Plano: integridade de saldo bancario

## Goal

Fechar as brechas que permitem uma conta bancaria ficar negativa ou perder a
base historica do saldo depois que ja existem movimentos vinculados.

O resultado esperado e:

1. Conta bancaria nao pode ter saldo inicial ou data de saldo inicial alterados
   depois de criada.
2. Conta com qualquer baixa/pagamento financeiro ou transferencia vinculada nao
   pode ser deletada.
3. Saldo bancario negativo e proibido sempre.
4. O fluxo de baixas (`fulfillment`) valida o saldo projetado da conta antes de
   qualquer pagamento que gere saida de caixa.
5. O fluxo de transferencias valida o saldo projetado das contas envolvidas
   antes de qualquer saida de caixa.
6. Edicoes/delecoes de movimentos que ja afetaram caixa nao reescrevem
   historico; devem ser feitas por ajuste/estorno auditavel.
7. A regra de saldo fica centralizada no `BankBalanceService`, sem duplicar
   calculo em `BankAccountService`, `FinancialTransactionFulfillmentService` ou
   `BankTransferService`.

## Current State

### `BankBalanceService`

O servico ja possui boa parte da base necessaria:

- calcula saldo atual e saldo em uma data;
- carrega baixas financeiras e transferencias;
- aplica sinal de entrada/saida conforme tipo da transacao;
- projeta movimentos futuros em ordem cronologica;
- identifica o primeiro dia em que a conta ficaria negativa.

Pontos ja cobertos:

- `validateFulfillment` bloqueia criacao/edicao de baixa de `EXPENSE` quando a
  saida projetada deixa a conta negativa;
- `validateTransfer` bloqueia criacao/edicao de transferencia quando a nova
  saida projetada deixa a conta origem negativa;
- `validateTransactionTypeChange` bloqueia mudar uma transacao com baixas para
  `EXPENSE` se as baixas virarem saidas e deixarem a conta negativa.

### Lacunas

- `BankAccountService.update` permite alterar `initialBalance` e
  `initialBalanceDate` depois da criacao da conta.
- `BankAccountService.delete` deleta a conta se ela existir, sem checar se tem
  baixa ou transferencia vinculada.
- `FinancialTransactionFulfillmentService.delete` remove baixas sem validar se
  a remocao de uma entrada de `INCOME` deixaria a conta negativa em algum dia
  posterior.
- `FinancialTransactionFulfillmentService.update` nao valida o impacto de mover,
  reduzir ou atrasar uma baixa de `INCOME`. Isso pode remover uma entrada que
  sustentava despesas/transferencias posteriores.
- `BankTransferService.update` valida apenas a nova conta origem. Ao editar uma
  transferencia, a conta destino antiga pode perder uma entrada que sustentava
  movimentos posteriores.
- `BankTransferService.delete` remove a transferencia sem validar se a conta
  destino ficaria negativa ao perder aquela entrada.
- `FulfillmentDialog` no frontend valida apenas o saldo da transacao
  (`remainingAmount`), nao o saldo bancario. O bloqueio real deve continuar no
  backend, mas a UI pode antecipar a mensagem.
- `BankTransferService.update` altera diretamente os campos da transferencia
  existente. Para movimentos de caixa, isso deve virar ajuste/estorno em vez de
  update historico.
- `BankTransferService.delete` remove diretamente a transferencia existente.
  Para movimentos de caixa, isso deve virar ajuste/estorno em vez de delete
  historico.

## Design Decisions

### Fonte de verdade

O `BankBalanceService` deve continuar sendo a fonte de verdade para calculo e
validacao de saldo bancario.

Nao duplicar regra de saldo:

- nao calcular saldo em dialogs;
- nao espalhar `sum` manual em services de transferencia ou baixa;
- nao confiar no `currentBalance` recebido pelo frontend para validar operacao.

O frontend pode exibir avisos e limitar interacoes, mas a decisao final deve ser
do backend.

### Saldo negativo proibido sempre

Conta bancaria nao pode ficar negativa em nenhum ponto da linha do tempo
projetada.

Regra:

- se a conta ja esta negativa por historico existente, novas saidas devem ser
  bloqueadas ate que uma entrada/ajuste regularize o saldo;
- nao aceitar "nao piorar o saldo" como criterio suficiente;
- qualquer operacao que gere saida de caixa precisa provar que a conta fica com
  saldo maior ou igual a zero em todos os dias projetados.

### Efeito caixa versus efeito operacional

Transacao financeira nao tem efeito caixa no cadastro do cabecalho ou dos
itens. Ela so afeta caixa quando existe baixa/pagamento
(`FinancialTransactionFulfillment`).

Regra:

- transacao futura pendente nao entra no saldo bancario;
- transacao futura paga entra no saldo bancario pela data da baixa;
- transacao de produto estocavel pode afetar estoque no cadastro da transacao,
  mas isso nao significa efeito caixa;
- transferencia bancaria registrada e movimento de caixa imediatamente pela
  `transferDate`, porque o schema atual nao possui status de agendamento;
- se um fluxo de transferencia parcial/agendada existir no futuro, apenas a
  parte confirmada/paga deve entrar no saldo.

### Historico de caixa nao deve ser reescrito

Depois que um movimento afetou caixa, edicao/delecao direta nao deve alterar ou
remover o registro original.

Regra:

- correcao de baixa paga deve criar ajuste/estorno que anula o efeito anterior e
  depois aplicar o novo efeito desejado;
- correcao de transferencia deve criar movimento compensatorio e, se necessario,
  uma nova transferencia correta;
- delecao operacional de um movimento com efeito caixa deve virar estorno, nao
  `delete` fisico;
- o estorno deve criar uma nova linha de ajuste com `status = ADJUSTMENT` e
  `cancel_id` apontando para a linha original cancelada;
- o registro original deve permanecer para auditoria.

Para cumprir essa regra de forma limpa, o ajuste deve ficar no proprio dominio
do movimento cancelado:

```text
financial_transaction_fulfillment
- status: ACTIVE | CANCELED | ADJUSTMENT
- cancel_id nullable references financial_transaction_fulfillment(id)

bank_transfer
- status: ACTIVE | CANCELED | ADJUSTMENT
- cancel_id nullable references bank_transfer(id)
```

Regra:

- este `status` e do movimento de caixa, nao de `financial_transaction`;
- `financial_transaction.status` ja existe (`PENDING`, `PAID`, `CANCELED`,
  `PARTIAL`) e continua representando o estado do lancamento financeiro como um
  todo;
- `financial_transaction_fulfillment.status` representa o estado daquela baixa
  especifica;
- `bank_transfer.status` representa o estado daquela transferencia especifica;
- a linha original permanece registrada;
- a linha de ajuste tem `status = ADJUSTMENT`;
- `cancel_id` da linha de ajuste aponta para a linha original que ela anula;
- a linha original pode receber `status = CANCELED` se o dominio precisar
  facilitar filtros, mas seu valor original nao deve ser removido nem
  sobrescrito;
- cancelar uma transferencia deve criar uma nova `bank_transfer` contraria:
  origem = destino original, destino = origem original, mesmo valor, data de
  cancelamento/ajuste, `status = ADJUSTMENT`, `cancel_id` apontando para a
  transferencia original;
- `BankBalanceService` deve considerar a linha original e a linha de ajuste como
  movimentos separados que se anulam no saldo;
- filtros de listagem podem esconder ajustes por padrao, mas o historico deve
  permitir rastrear ambos.
- nao criar tabela generica de ajuste bancario neste plano.

### Saldo inicial imutavel apos criacao

Saldo inicial e data de saldo inicial sao campos de criacao. Depois que a conta
foi criada, qualquer alteracao nesses campos deve ser bloqueada.

Essa regra vale mesmo que a conta ainda nao possua movimentos. Se o saldo
inicial foi cadastrado errado, a correcao deve ser feita por fluxo auditavel
proprio, sem editar o saldo inicial original.

Campos bloqueados:

- `initialBalance`;
- `initialBalanceDate`.

Outros campos continuam editaveis:

- nome;
- ativo/inativo;
- tipo;
- grupo;
- instituicao;
- agencia;
- numero da conta.

Motivo: mudar o saldo inicial ou a data de corte reescreve a base da linha do
tempo da conta. Mesmo antes de haver movimentos, manter o campo imutavel evita
duas formas concorrentes de correcao historica.

### Saldo inicial nulo

`initialBalance = null` e `initialBalance = 0.00` devem ser equivalentes para
calculo e validacao.

Regra:

- novas contas devem persistir saldo inicial como `0.00` quando a request vier
  com `initialBalance = null`;
- `BankBalanceService` deve continuar tratando `null` como zero para dados
  legados;
- em uma migration futura, considerar normalizar dados legados para `0.00` e
  tornar a coluna `NOT NULL` se o banco suportar a alteracao com seguranca;
- comparacoes de edicao devem tratar `null` e zero como o mesmo valor financeiro.

### Delecao de conta vinculada

Conta com qualquer baixa ou transferencia vinculada nao deve ser deletada.

Regra:

- se existir baixa financeira com `bankAccount.id = id`, bloquear;
- se existir transferencia com `sourceBankAccount.id = id`, bloquear;
- se existir transferencia com `destinationBankAccount.id = id`, bloquear.

Mensagem sugerida:

```text
Bank account cannot be deleted because it has financial movements.
```

### Validacao por projecao, nao por saldo atual

A validacao correta nao e comparar `currentBalance >= amount`.

Ela deve reprocessar a linha do tempo da conta:

1. parte do saldo inicial na data inicial;
2. carrega movimentos persistidos;
3. exclui o movimento que esta sendo editado/deletado;
4. adiciona os movimentos candidatos da operacao;
5. ordena por data;
6. bloqueia se o saldo ficar negativo em qualquer dia.

Isso evita falsos positivos e falsos negativos em cenarios com datas passadas,
datas futuras, edicoes retroativas e transferencias entre contas.

## Backend Plan

### 1. Repositorios

Adicionar consultas de existencia/contagem para vinculos de conta:

`FinancialTransactionFulfillmentRepository`:

```java
boolean existsByBankAccountId(Long bankAccountId);
long countByBankAccountId(Long bankAccountId);
```

`BankTransferRepository`:

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

Se o Spring Data nao derivar bem algum nome, usar `@Query` explicita.

### 2. `BankAccountService`

Injetar:

- `FinancialTransactionFulfillmentRepository`;
- `BankTransferRepository`.

No `update`:

- buscar a conta atual;
- comparar os campos `initialBalance` e `initialBalanceDate` recebidos com os
  campos atuais;
- se qualquer um mudou, rejeitar a edicao;
- continuar permitindo editar os demais campos.

Comparacao recomendada:

- `initialBalance`: comparar usando `BigDecimal.compareTo` quando ambos nao
  forem nulos, para evitar diferenca falsa de escala (`100.0` vs `100.00`);
- `initialBalance`: tratar `null` e zero como equivalentes;
- `initialBalanceDate`: comparar com `Objects.equals`.

Mensagem sugerida:

```text
Initial bank balance cannot be changed because the account has financial movements.
```

No `delete`:

- buscar a conta ou validar existencia;
- se tiver qualquer baixa ou transferencia vinculada, rejeitar;
- deletar apenas contas sem movimento.

Mensagem sugerida:

```text
Bank account cannot be deleted because it has financial movements.
```

No `create`:

- persistir `initialBalance` como `BigDecimal.ZERO` quando vier nulo;
- manter `initialBalanceDate` opcional conforme regra atual, mas o calculo deve
  continuar usando `LocalDate.MIN` quando a data inicial for nula.

### 3. Refatorar `BankBalanceService` para projecoes reutilizaveis

Extrair a validacao privada atual para uma API interna mais generica.

Modelo sugerido:

```java
public void validateProjectedBalance(
        BankAccount bankAccount,
        List<LedgerMovement> candidateMovements,
        Set<Long> excludedTransferIds,
        Set<Long> excludedFulfillmentIds,
        String errorMessagePrefix
)
```

Ou manter `LedgerMovement` privado e criar metodos publicos de alto nivel:

- `validateFulfillmentCreationOrUpdate(...)`;
- `validateFulfillmentDeletion(...)`;
- `validateTransferCreationOrUpdate(...)`;
- `validateTransferDeletion(...)`.

Preferencia: manter metodos publicos por caso de uso e deixar `LedgerMovement`
privado. Isso preserva encapsulamento e evita services externos montarem
movimentos com sinal errado.

Internamente, alterar `findFirstNegativeProjection` para aceitar:

```java
Set<Long> excludedTransferIds
Set<Long> excludedFulfillmentIds
```

em vez de um unico `excludedTransferId`.

Ao carregar movimentos persistidos, incluir:

- baixas financeiras, incluindo baixas com `status = ADJUSTMENT`;
- transferencias, incluindo transferencias inversas com `status = ADJUSTMENT`.

O servico deve continuar agregando por dia. Para historico no mesmo dia, saldo
liquido diario e suficiente neste corte.

### 4. Baixas financeiras (`fulfillment`)

Regras por operacao:

#### Criar baixa

- `EXPENSE`: validar a nova saida na conta escolhida.
- `INCOME`: nao precisa validar saldo negativo, porque cria entrada.
- se a conta escolhida ja estiver negativa no historico projetado, uma baixa de
  `EXPENSE` deve falhar mesmo que nao exista outro movimento no mesmo dia.

Estado atual cobre parte do `EXPENSE`, mas precisa garantir a regra absoluta de
saldo nao negativo.

#### Editar baixa paga

Baixa paga nao deve ser reescrita quando a alteracao muda efeito de caixa.

Regra:

- nao alterar `bankAccount`, `paymentDate` ou `amountPaid` diretamente em uma
  baixa ja persistida;
- se for necessario corrigir, criar ajuste/estorno que anula o efeito anterior;
- depois, criar uma nova baixa correta quando aplicavel;
- validar toda saida gerada pelo ajuste ou pela nova baixa.

Impacto por tipo:

- baixa de `EXPENSE` original e uma saida; seu estorno e uma entrada;
- baixa de `INCOME` original e uma entrada; seu estorno e uma saida e deve ser
  validado para nao deixar a conta negativa.

#### Deletar baixa paga

Delecao direta de baixa paga deve ser bloqueada ou convertida em estorno
auditavel.

Regra:

- nao remover a baixa original do banco;
- criar ajuste contrario ao efeito de caixa original;
- se o estorno gerar saida, validar saldo projetado;
- preservar alocacoes historicas ou marcar a baixa original como estornada em
  evolucao futura de schema.

### 5. Transferencias bancarias

Regras por operacao:

#### Criar transferencia

- validar conta origem com a nova saida;
- conta destino recebe entrada, entao nao fica negativa por causa da criacao;
- continuar validando data de abertura das duas contas.

Estado atual cobre o caso basico.

#### Editar transferencia

Transferencia registrada e movimento de caixa. Nao deve ter campos estruturais
reescritos.

Campos estruturais:

- conta origem;
- conta destino;
- valor;
- data.

Regra:

- bloquear update direto desses campos;
- permitir no maximo editar observacao, se isso nao afetar caixa;
- para corrigir origem/destino/valor/data, criar transferencia compensatoria
  que anula a original e depois criar a transferencia correta;
- validar a saida da transferencia compensatoria quando ela debita a conta que
  recebeu a entrada original;
- validar a saida da nova transferencia correta na nova conta origem.

Observacao sobre "tipo" da transferencia:

- no schema V1 `bank_transfer` nao possui coluna `type`;
- se a UI ou evolucao futura adicionar algum tipo/classificacao de
  transferencia, ele nao pode alterar a natureza dos movimentos de origem e
  destino de uma transferencia ja registrada;
- qualquer mudanca que quebre os itens/movimentos deve seguir
  estorno/compensacao + novo lancamento.

#### Deletar transferencia

Delecao direta de transferencia registrada deve ser bloqueada ou convertida em
compensacao auditavel.

Regra:

- nao remover a transferencia original do banco;
- criar transferencia inversa que anule o efeito original;
- a transferencia inversa deve inverter origem/destino da original;
- a transferencia inversa deve ter `status = ADJUSTMENT`;
- a transferencia inversa deve ter `cancel_id` apontando para a transferencia
  original;
- a compensacao debita a conta que recebeu a transferencia original, entao deve
  validar saldo projetado dessa conta;
- se a validacao falhar, a delecao/correcao deve ser rejeitada.

### 6. Transaction type change

Manter `validateTransactionTypeChange` para impedir que uma transacao com
baixas seja reinterpretada de forma que quebre saldo.

Ela continua necessaria para o caso:

- transacao era `INCOME`;
- ja tinha baixas como entradas;
- usuario muda para `EXPENSE`;
- as mesmas baixas viram saidas e podem negativar a conta.

Ao refatorar a API interna de projecao, atualizar esse metodo para usar a mesma
infraestrutura generica.

Regra adicional:

- se a transacao nao tem baixas, mudar tipo nao tem efeito caixa;
- se a transacao tem baixas, mudar tipo reinterpreta caixa historico e deve ser
  bloqueado ou tratado por estorno/novo lancamento;
- se a transacao tem movimento de estoque, mudanca de tipo ja deve continuar
  bloqueada porque inverte entrada/saida de estoque.

### 7. Cancelamento, edicao e delecao de transacoes

Transacao financeira tem dois efeitos separados:

- efeito operacional/estoque no cadastro dos itens quando produto controla
  estoque;
- efeito caixa apenas nas baixas/pagamentos.

Regra:

- transacao pendente sem baixas nao afeta caixa;
- transacao futura nao paga nao entra no saldo bancario;
- transacao paga entra no saldo bancario apenas pelas baixas;
- editar/deletar/cancelar transacao com baixa nao deve apagar ou reescrever o
  caixa historico;
- se a alteracao exige mudar caixa, criar ajuste/estorno auditavel com
  `status = ADJUSTMENT` e `cancel_id` referenciando a linha cancelada;
- se a alteracao exige mudar estoque ja movimentado, bloquear edicao direta e
  usar fluxo especifico de ajuste de estoque.

Cancelamento de transacao financeira paga:

- nao deve deletar baixas;
- nao deve zerar valores das baixas originais;
- deve criar uma baixa de ajuste para cada baixa que precisa ser anulada;
- cada ajuste deve inverter o sinal economico da baixa original;
- cada ajuste deve referenciar a baixa original via `cancel_id`;
- se o ajuste gerar saida de caixa, validar saldo projetado antes de salvar;
- a transacao pode mudar para `CANCELED`, mas o caixa fica explicado pela baixa
  original + ajuste.

### 8. Frontend

Backend e obrigatorio. Frontend e camada de UX.

Sugestoes:

- Em `FulfillmentDialog`, ao selecionar conta, exibir saldo atual da conta.
- Para despesa (`EXPENSE`), mostrar aviso se a conta ja estiver negativa ou se
  `currentBalance < amount`, mas nao tratar isso como unica validacao, porque a
  regra real e cronologica.
- Ao receber erro da API, manter `extractApiErrorMessage` exibindo a mensagem
  especifica do backend.
- Em cadastro de contas, desabilitar campos de saldo inicial/data inicial quando
  a UI souber que ha baixas ou transferencias vinculadas.
- Se a UI nao tiver contagem confiavel, deixar os campos editaveis e depender do
  backend; o erro deve ser claro.
- Bloquear/ocultar botao de deletar conta quando a tela ja souber que existem
  pagamentos ou transferencias atrelados. Ainda assim, backend deve validar.
- Permitir inativar conta com movimentos; conta inativa deve sair dos selects de
  novos lancamentos, pagamentos e transferencias.
- Em edicao de transferencia, nao permitir alterar campos estruturais
  (origem/destino/valor/data) se a transferencia ja foi registrada. Se houver
  fluxo de correcao, ele deve chamar endpoints de estorno/ajuste + novo
  lancamento.

## Tests

### Backend

Adicionar cobertura para:

- nao editar `initialBalance` de conta com baixa;
- nao editar `initialBalanceDate` de conta com transferencia;
- nao editar `initialBalance` de conta sem movimentos;
- nao editar `initialBalanceDate` de conta sem movimentos;
- permitir editar nome/agencia de conta com movimentos;
- permitir inativar conta com movimentos;
- nao deletar conta com baixa;
- nao deletar conta com transferencia como origem;
- nao deletar conta com transferencia como destino;
- permitir deletar conta sem movimentos;
- criar conta sem `initialBalance` deve persistir/calcular zero;
- criar baixa de `EXPENSE` em conta ja negativa deve falhar;
- editar baixa paga alterando conta/data/valor deve falhar ou criar estorno,
  conforme endpoint implementado;
- cancelar transacao paga cria ajuste com `status = ADJUSTMENT` e `cancel_id`
  apontando para a baixa original;
- ajuste de cancelamento inverte o efeito caixa da baixa original;
- baixa original permanece rastreavel apos cancelamento;
- estornar baixa de `INCOME` que sustentava despesa posterior deve falhar se
  deixar saldo negativo;
- editar campos estruturais de transferencia registrada deve falhar ou criar
  compensacao, conforme endpoint implementado;
- compensar/deletar transferencia que sustentava despesa posterior na conta
  destino deve falhar se deixar saldo negativo;
- cancelar transferencia cria transferencia inversa com `status = ADJUSTMENT` e
  `cancel_id` apontando para a transferencia original;
- transferencia original permanece rastreavel apos cancelamento;
- criar transferencia de origem sem saldo continua falhando;
- criar baixa de `EXPENSE` sem saldo continua falhando.

Preferir testes de integracao nos services/controllers existentes:

- `BankAccountControllerIT` ou `BankAccountServiceIT`;
- `FinancialTransactionFulfillmentServiceIT`;
- `BankTransferControllerIT`;
- `BankBalanceServiceIT` para cenarios puros de projecao.

### Frontend

Se a UI for ajustada:

- build TypeScript;
- validar manualmente que saldo atual aparece no dialog;
- validar que erro da API aparece ao tentar operacao que negativaria a conta;
- validar que campos de saldo inicial ficam bloqueados quando a tela sabe que ha
  movimentos.

## Implementation Order

1. Adicionar queries de existencia/contagem nos repositorios.
2. Normalizar `initialBalance` nulo como zero em novas contas.
3. Implementar bloqueio absoluto de edicao de saldo inicial/data inicial e
   bloqueio de delecao vinculada no `BankAccountService`.
4. Refatorar `BankBalanceService` para considerar linhas com
   `status = ADJUSTMENT` nas tabelas de baixa e transferencia, validando
   projecoes com saldo negativo proibido sempre.
5. Criar schema/servico de ajuste rastreavel:
   - adicionar `status` e `cancel_id` em `financial_transaction_fulfillment`;
   - adicionar `status` e `cancel_id` em `bank_transfer`;
   - preferir linha de ajuste com `status = ADJUSTMENT` e `cancel_id`
     apontando para a linha cancelada.
6. Atualizar `FinancialTransactionFulfillmentService.update/delete` para nao
   reescrever caixa historico; bloquear ou delegar para ajuste/estorno.
7. Atualizar `BankTransferService.update/delete` para nao reescrever campos
   estruturais; bloquear ou delegar para compensacao + nova transferencia.
8. Ajustar mensagens de erro.
9. Adicionar testes backend.
10. Opcionalmente ajustar UI para antecipar avisos e bloquear campos/botoes
   quando houver dados suficientes.

## Decisions Confirmed

1. Saldo negativo e proibido sempre.
2. Transacao so afeta caixa quando paga; cadastro de transacao pode afetar
   estoque, mas nao caixa.
3. Transferencia registrada afeta caixa na `transferDate`.
4. Transacao futura nao paga nao entra no saldo bancario.
5. Edicao/delecao com efeito caixa nao deve reescrever historico; deve usar
   ajuste/estorno.
6. Ajuste/estorno deve ser rastreavel por `status = ADJUSTMENT` e `cancel_id`
   apontando para a linha cancelada.
7. Cancelamento de transferencia deve criar transferencia inversa com
   `status = ADJUSTMENT` e `cancel_id` apontando para a original.
8. Nao usar tabela generica de ajuste bancario neste plano.
9. Saldo inicial nulo equivale a zero e novas contas devem persistir zero por
   padrao.
10. Qualquer edicao de saldo inicial/data inicial deve ser bloqueada apos a
   criacao da conta.
11. Conta com movimentos pode ser inativada.
12. Mensagens podem continuar em ingles no backend.
