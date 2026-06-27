# SM3 Agro ERP - Requisitos Funcionais, Regras de Negocio, Casos de Uso e Decisoes Arquiteturais

## 1. Objetivo do documento

Este documento consolida uma primeira versao dos requisitos funcionais, regras de negocio, casos de uso e decisoes arquiteturais do sistema com base no schema inicial definido em `src/main/resources/db/migration/V1__initial_shema.sql`.

O objetivo e servir como referencia para a implementacao das partes mais criticas do dominio, principalmente nos modulos de:

- cadastros mestres;
- operacao agricola;
- financeiro;
- estoque;
- rastreabilidade entre operacao, estoque e financeiro.

## 2. Escopo e premissas

Este documento foi gerado inicialmente a partir da estrutura relacional do banco. Portanto:

- os requisitos abaixo representam inferencias tecnicas consistentes com o schema;
- regras marcadas como "a validar" dependem de confirmacao com o negocio;
- nomes de tabelas, campos, enumeracoes e relacionamentos foram tratados como a principal fonte de verdade nesta etapa.

## 3. Visao geral do dominio

O sistema esta organizado em quatro macrodominios conectados:

1. Cadastros base e parametrizacoes  
   Suportam unidades, familias de produto, tipos de documento, segmentos, tipos de contraparte, grupos de atividade, grupos de DRE e causas de ajuste.

2. Operacao agricola  
   Controla talhoes, cortes, operacoes de campo, maquinas utilizadas e insumos aplicados.

3. Financeiro e gerencial  
   Controla contas bancarias, lancamentos financeiros, itens rateados, pagamentos/recebimentos, transferencias e classificacao contabil/gerencial.

4. Estoque e producao  
   Controla lotes, movimentacoes de estoque, ajustes, lotes de producao e vinculo com operacoes de campo e financeiro.

## 4. Entidades principais e responsabilidade funcional

### 4.1 Bases e parametrizacoes

- `income_statement_group`: agrupadores de demonstrativo de resultado.
- `base_unit`: unidade base conceitual, como peso, volume ou unidade fisica.
- `unit_of_measure`: unidade operacional vinculada a uma unidade base, com fator de conversao.
- `product_family`: agrupamento de produtos e tambem referencia para cortes.
- `document_type`: tipo documental de transacoes.
- `counterparty_type`: classificacao de pessoa/empresa relacionada ao negocio.
- `segment`: segmentacao comercial ou operacional de contraparte.
- `activity_group`: agrupamento de centros de custo.
- `adjustment_root_causes`: catalogo de causas para ajustes de estoque.

### 4.2 Cadastros principais

- `field`: talhao/area agricola com area em hectares.
- `product`: item controlado pelo sistema, inclusive materia-prima, produto acabado, consumivel, peca de reposicao e servico.
- `machine`: maquina/equipamento agricola.
- `bank_account`: conta financeira com saldo inicial.
- `counterparty`: cliente, fornecedor, parceiro ou outra entidade relacionada.

### 4.3 Contabil / gerencial

- `chart_of_account`: plano de contas hierarquico.
- `cost_center`: centro de custo hierarquico, com classificacao CAPEX/OPEX.
- `income_statement_relationship`: mapeamento entre conta contabil/gerencial e grupo de DRE.

### 4.4 Producao agricola

- `cut`: evento de corte vinculado a talhao e familia de produto.
- `field_operation`: operacao realizada ou planejada no campo.
- `field_operation_machine`: maquinas utilizadas em uma operacao.
- `field_operation_items`: insumos/produtos consumidos em uma operacao, com reflexo em estoque.

### 4.5 Financeiro

- `financial_transaction`: titulo financeiro a pagar ou receber.
- `financial_transaction_items`: composicao/classificacao do titulo.
- `financial_transaction_fulfillment`: liquidacoes parciais ou totais do titulo via conta bancaria.
- `bank_transfer`: transferencia entre contas bancarias.

### 4.6 Estoque

- `inventory_batch`: lote de estoque.
- `inventory_movement`: movimentacao de entrada ou saida sobre um lote.
- `inventory_adjustment`: justificativa formal para ajustes de estoque.
- `production_batch`: lote produzido, rastreado a partir de um corte e de um lote de estoque.

## 5. Requisitos funcionais

### RF-01. Manter cadastros base

O sistema deve permitir cadastrar, consultar e manter:

- grupos de DRE;
- unidades base e unidades de medida;
- familias de produto;
- tipos de documento;
- tipos de contraparte;
- segmentos;
- grupos de atividade;
- causas de ajuste de estoque.

### RF-02. Manter talhoes

O sistema deve permitir cadastrar talhoes com:

- nome;
- area em hectares;
- status logico de utilizacao, caso esse controle seja implementado em camada de aplicacao.

Observacao: o schema nao possui campo `active` em `field`. Caso o negocio exija inativacao, isso devera ser tratado em evolucao futura.

### RF-03. Manter produtos

O sistema deve permitir cadastrar produtos com:

- nome;
- unidade de medida;
- familia de produto;
- tipo de produto;
- status ativo/inativo.

### RF-04. Manter maquinas

O sistema deve permitir cadastrar maquinas com:

- tipo;
- fabricante;
- modelo;
- ano;
- observacoes;
- status ativo/inativo.

### RF-05. Manter contas bancarias

O sistema deve permitir cadastrar contas bancarias com:

- nome;
- tipo e grupo da conta;
- instituicao financeira;
- agencia;
- numero da conta;
- saldo inicial e data-base;
- status ativo/inativo.

### RF-06. Manter contrapartes

O sistema deve permitir cadastrar contrapartes com:

- tipo de contraparte;
- razao social e nome fantasia;
- cidade, estado e contatos;
- documento CPF/CNPJ;
- segmento;
- status ativo/inativo.

### RF-07. Manter plano de contas

O sistema deve permitir cadastrar contas gerenciais/contabeis com:

- hierarquia por conta pai;
- tipo da conta;
- codigo;
- indicacao se aceita lancamento;
- status ativo/inativo.

### RF-08. Manter centros de custo

O sistema deve permitir cadastrar centros de custo com:

- hierarquia;
- classificacao CAPEX/OPEX;
- codigo;
- grupo de atividade;
- indicacao se aceita lancamento;
- status ativo/inativo.

### RF-09. Relacionar contas a grupos de DRE

O sistema deve permitir vincular contas a grupos de demonstrativo de resultado para consolidacao gerencial.

### RF-10. Registrar cortes

O sistema deve permitir registrar cortes por talhao e familia de produto, informando:

- data do corte;
- numero do corte;
- observacoes;
- dias desde o ultimo corte.

### RF-11. Registrar operacoes de campo

O sistema deve permitir registrar operacoes de campo:

- planejadas, realizadas ou canceladas;
- vinculadas a um talhao;
- opcionalmente vinculadas a um corte;
- classificadas por tipo de operacao;
- com data e observacoes.

### RF-12. Vincular maquinas a operacoes de campo

O sistema deve permitir informar uma ou mais maquinas por operacao de campo, com horas trabalhadas e observacoes.

### RF-13. Registrar titulos financeiros

O sistema deve permitir cadastrar titulos financeiros a pagar ou receber com:

- descricao;
- contraparte;
- datas de emissao e vencimento;
- numero de documento;
- status;
- tipo receita/despesa;
- tipo documental;
- indicacao de NF;
- anexos ou referencias documentais;
- valor total.

### RF-14. Classificar titulos financeiros por item

O sistema deve permitir decompor um titulo financeiro em itens, cada um com:

- conta contabil/gerencial;
- centro de custo;
- produto relacionado, quando aplicavel;
- quantidade;
- preco unitario;
- valor.

### RF-15. Registrar liquidacoes financeiras

O sistema deve permitir registrar uma ou mais liquidacoes para um titulo financeiro por meio de conta bancaria, com:

- data de pagamento/recebimento;
- valor pago/recebido;
- observacoes.

### RF-16. Registrar transferencias bancarias

O sistema deve permitir registrar transferencias entre contas bancarias, com:

- conta origem;
- conta destino;
- valor;
- data;
- observacao.

### RF-17. Manter lotes de estoque

O sistema deve permitir registrar lotes de estoque com:

- produto;
- codigo do lote;
- data do lote;
- status;
- custo unitario;
- quantidade atual.

### RF-18. Registrar movimentacoes de estoque

O sistema deve permitir registrar movimentacoes de estoque por lote, contemplando:

- entradas por compra;
- entradas por producao;
- saidas por venda;
- saidas por consumo;
- ajustes positivos e negativos;
- transferencias de entrada e saida.

### RF-19. Registrar ajustes de estoque com causa

O sistema deve exigir o registro de causa raiz e observacao para ajustes de estoque.

### RF-20. Registrar lotes de producao

O sistema deve permitir vincular a producao agricola a um lote de estoque, com:

- lote de estoque gerado;
- classificacao de qualidade;
- corte de origem;
- observacoes.

### RF-21. Registrar consumo de insumos em operacoes de campo

O sistema deve permitir associar produtos consumidos em operacoes de campo, com:

- quantidade;
- custo unitario;
- valor total;
- movimentacao de estoque correspondente;
- observacoes.

### RF-22. Garantir rastreabilidade cruzada

O sistema deve permitir rastrear, no minimo:

- qual titulo financeiro originou determinada movimentacao de estoque de compra;
- qual operacao de campo consumiu determinado item de estoque;
- qual corte originou determinado lote de producao;
- quais contas e centros de custo receberam determinado rateio financeiro.

## 6. Regras de negocio

### RB-01. Enumeracoes controladas por dominio

Campos com `CHECK` devem aceitar apenas os valores previstos no schema. Isso vale, entre outros, para:

- tipo de produto;
- tipo de maquina;
- tipo e status de operacao de campo;
- status e tipo de transacao financeira;
- tipo de centro de custo;
- status de lote;
- tipo de movimentacao de estoque;
- tipo de ajuste;
- tipo de documento CPF/CNPJ.

### RB-02. Produto deve possuir unidade de medida valida

Todo produto deve estar associado a uma `unit_of_measure` existente.

### RB-03. Unidade de medida deve pertencer a uma unidade base

Toda unidade operacional deve referenciar uma unidade base e um fator de conversao maior que zero.  
A validacao de fator maior que zero nao esta no schema e deve ser implementada na aplicacao.

### RB-04. Conta e centro de custo hierarquicos

Plano de contas e centros de custo admitem hierarquia por `parent_id`. A aplicacao deve impedir:

- autoreferencia;
- ciclos hierarquicos;
- lancamentos em nos que nao aceitam transacao.

### RB-05. Inativacao nao deve quebrar historico

Entidades com campo `active` devem poder ser inativadas sem remocao fisica, preservando historico transacional.

### RB-06. Titulo financeiro deve possuir coerencia entre total e itens

O valor total do titulo deve ser compativel com a soma dos itens.  
Regra recomendada: `total_amount = soma(amount dos itens)`.

Observacao: o schema nao garante isso automaticamente; deve ser controlado na aplicacao e/ou por rotina de consistencia.

### RB-07. Liquidacao parcial deve impactar status do titulo

Uma transacao financeira:

- permanece `PENDING` quando nao houver liquidacoes;
- deve ficar `PARTIAL` quando liquidada parcialmente;
- deve ficar `PAID` quando o total liquidado atingir o valor total;
- pode ficar `CANCELED` apenas por acao explicita de cancelamento.

### RB-08. Nao permitir liquidacao acima do valor devido

A soma de `amount_paid` das liquidacoes nao deve exceder `total_amount`, salvo regra futura de juros/multa/acrescimos, que hoje nao aparece no schema.

### RB-09. Transferencia bancaria deve ocorrer entre contas distintas

A origem e o destino da transferencia devem ser diferentes. Essa regra ja existe no schema via `CHECK`.

### RB-10. Movimentacao de estoque deve respeitar o tipo

Entradas devem incrementar saldo do lote e saidas devem reduzir saldo do lote.  
Regra recomendada:

- `*_IN` e `ADJUSTMENT_IN` aumentam saldo;
- `*_OUT`, `SALE_OUT`, `CONSUMPTION_OUT` e `ADJUSTMENT_OUT` reduzem saldo.

### RB-11. Nao permitir saldo negativo indevido

Nao deve ser permitida saida que deixe o lote com quantidade negativa, exceto se o negocio deliberadamente aceitar estoque negativo.  
Como o schema nao explicita essa permissao, a recomendacao inicial e bloquear saldo negativo.

### RB-12. Ajuste de estoque exige causa raiz

Toda movimentacao de ajuste deve possuir registro em `inventory_adjustment` com `root_cause_id`.

### RB-13. Consumo de operacao de campo deve gerar rastreabilidade de estoque

Todo item consumido em `field_operation_items` deve estar vinculado a uma `inventory_movement` valida.

### RB-14. Lote de producao deve derivar de um corte

Todo `production_batch` deve possuir `cut_id`, garantindo origem agricola rastreavel.

### RB-15. Operacao de campo pode ser planejada sem execucao completa

Operacoes com status `PLANNED` podem existir sem maquinas e sem itens consumidos.  
Ao mudar para `DONE`, a aplicacao deve validar os dados minimos exigidos pelo tipo de operacao.

### RB-16. Tipo de produto influencia comportamento operacional

Regras recomendadas:

- `SERVICE` nao deve gerar lote de estoque;
- produtos consumidos em campo tendem a ser `RAW_MATERIAL`, `CONSUMABLE` ou `SPARE_PART`;
- `FINISHED_GOOD` tende a ser elegivel para lote de producao e venda.

Essa classificacao precisa de validacao funcional, mas e uma inferencia forte do modelo.

### RB-17. Documento de contraparte deve ser coerente com tipo documental

Se `document_type = CPF`, o documento deve seguir regra de CPF.  
Se `document_type = CNPJ`, o documento deve seguir regra de CNPJ.

### RB-18. DRE depende de relacionamento parametrizado

Lancamentos so poderao ser refletidos corretamente na DRE se houver relacionamento entre conta e grupo de DRE.

### RB-19. Custo de operacao pode ser derivado de multiplas fontes

O custo de uma operacao de campo pode considerar:

- consumo de insumos;
- horas de maquina;
- eventualmente mao de obra e terceiros em fases futuras.

O schema atual cobre insumos e uso de maquina, mas ainda nao modela custo de pessoal.

### RB-20. Historico deve priorizar soft rules na aplicacao

Como o schema privilegia modelagem relacional e nao traz triggers de consistencia, a camada de dominio/aplicacao deve centralizar as validacoes transacionais.

## 7. Casos de uso principais

### UC-01. Cadastrar produto

**Objetivo:** disponibilizar um item para uso financeiro, operacional e de estoque.

**Fluxo principal:**

1. Usuario informa nome, unidade de medida, tipo de produto e familia.
2. Sistema valida a unidade e o tipo informado.
3. Sistema grava o produto como ativo.

**Resultado esperado:** produto apto a ser referenciado em compras, consumo, producao e estoque.

### UC-02. Registrar titulo de despesa com rateio

**Objetivo:** registrar um compromisso financeiro classificado por conta e centro de custo.

**Fluxo principal:**

1. Usuario cadastra a transacao financeira do tipo `EXPENSE`.
2. Usuario informa contraparte, datas, documento e valor total.
3. Usuario adiciona um ou mais itens com conta contabil, centro de custo e valor.
4. Sistema valida coerencia entre total e soma dos itens.
5. Sistema grava a transacao com status inicial `PENDING`.

**Resultado esperado:** titulo registrado e classificado gerencialmente.

### UC-03. Liquidar parcialmente um titulo

**Objetivo:** registrar pagamento ou recebimento parcial.

**Fluxo principal:**

1. Usuario seleciona o titulo pendente.
2. Usuario informa conta bancaria, data e valor da liquidacao.
3. Sistema soma liquidacoes anteriores.
4. Sistema atualiza o status para `PARTIAL` ou `PAID`.

**Resultado esperado:** historico financeiro preservado e status atualizado corretamente.

### UC-04. Registrar compra com impacto em estoque

**Objetivo:** dar entrada em estoque a partir de uma compra.

**Fluxo principal:**

1. Usuario registra o titulo financeiro de compra.
2. Usuario classifica o item financeiro com produto, quantidade, preco unitario e valor.
3. Sistema gera ou associa lote de estoque.
4. Sistema registra `inventory_movement` do tipo `PURCHASE_IN`.
5. Sistema atualiza quantidade do lote.

**Resultado esperado:** vinculo entre financeiro e estoque preservado.

### UC-05. Registrar corte agricola

**Objetivo:** formalizar um evento produtivo em determinado talhao.

**Fluxo principal:**

1. Usuario informa talhao, familia de produto, data e numero do corte.
2. Sistema grava o corte.
3. Sistema permite relacionar operacoes e lotes de producao a esse corte.

**Resultado esperado:** corte disponivel como origem produtiva e analitica.

### UC-06. Registrar operacao de campo com maquinas

**Objetivo:** controlar uma atividade executada no campo.

**Fluxo principal:**

1. Usuario cria operacao para um talhao, com tipo e data.
2. Usuario vincula corte, se aplicavel.
3. Usuario informa maquinas utilizadas e horas trabalhadas.
4. Sistema grava a operacao e seus recursos associados.

**Resultado esperado:** operacao rastreavel por talhao, corte e equipamento.

### UC-07. Registrar consumo de insumo em operacao

**Objetivo:** baixar estoque consumido no campo.

**Fluxo principal:**

1. Usuario seleciona a operacao de campo.
2. Usuario informa produto, quantidade e lote consumido.
3. Sistema gera `inventory_movement` do tipo `CONSUMPTION_OUT`.
4. Sistema grava `field_operation_items` apontando para a movimentacao.
5. Sistema atualiza o saldo do lote.

**Resultado esperado:** consumo operacional com reflexo de estoque e rastreabilidade completa.

### UC-08. Registrar lote de producao

**Objetivo:** transformar um corte em estoque produzido.

**Fluxo principal:**

1. Usuario seleciona o corte de origem.
2. Usuario informa ou confirma o lote de estoque gerado.
3. Usuario informa classificacao de qualidade.
4. Sistema cria `production_batch`.
5. Sistema registra entrada de estoque como `PRODUCTION_IN`.

**Resultado esperado:** produto final produzido com origem agricola conhecida.

### UC-09. Ajustar estoque

**Objetivo:** corrigir divergencias de saldo com justificativa formal.

**Fluxo principal:**

1. Usuario seleciona lote e tipo de ajuste.
2. Usuario informa quantidade, data e causa raiz.
3. Sistema gera movimentacao `ADJUSTMENT_IN` ou `ADJUSTMENT_OUT`.
4. Sistema cria registro em `inventory_adjustment`.
5. Sistema atualiza o saldo do lote.

**Resultado esperado:** correcao rastreavel e auditavel.

### UC-10. Transferir valores entre contas bancarias

**Objetivo:** registrar movimentacao interna de caixa/bancos.

**Fluxo principal:**

1. Usuario informa conta origem, conta destino, valor e data.
2. Sistema valida que as contas sao diferentes.
3. Sistema grava a transferencia.

**Resultado esperado:** movimentacao interna registrada para conciliacao e controle.

## 8. Decisoes arquiteturais inferidas e recomendadas

### DA-01. Modelagem centrada em agregados de dominio

O schema sugere agregados principais:

- Produto / Unidade / Familia;
- Contraparte;
- Plano de contas;
- Centro de custo;
- Transacao financeira;
- Conta bancaria;
- Talhao / Corte / Operacao de campo;
- Lote de estoque / Movimentacao;
- Lote de producao.

Recomendacao: manter regras de consistencia dentro de services de dominio ou aplicacao por agregado.

### DA-02. Uso de soft delete funcional por flag `active`

Para entidades com `active`, a arquitetura deve preferir:

- inativacao em vez de exclusao;
- filtros padrao por ativos;
- possibilidade de consulta historica completa.

### DA-03. Enumeracoes devem existir no codigo

Os campos com `CHECK` devem ser refletidos em enums na aplicacao para evitar strings soltas e reduzir inconsistencias.

### DA-04. Integridade transacional entre financeiro e estoque

Operacoes como compra, consumo e producao devem ser transacionais.  
Recomendacao:

- persistir documento principal e seus itens em uma unica unidade transacional;
- persistir movimentacoes derivadas no mesmo commit;
- falhar tudo em caso de inconsistencia.

### DA-05. Rastreabilidade como requisito de arquitetura

A arquitetura deve preservar referencias cruzadas entre:

- item financeiro e movimentacao de estoque;
- operacao de campo e consumo de estoque;
- corte e lote de producao;
- conta contabil, centro de custo e DRE.

Esses vinculos nao devem ser tratados como secundarios; eles sao parte do nucleo do produto.

### DA-06. Calculos derivados nao devem depender apenas do campo persistido

Campos como:

- `total_amount`;
- status do titulo;
- quantidade atual do lote;
- custo total de operacao;

devem ser recalculaveis a partir do historico sempre que necessario, para auditoria e consistencia.

### DA-07. Separacao entre movimento e saldo

O modelo usa historico de movimentos (`inventory_movement`) e tambem saldo corrente no lote (`inventory_batch.quantity`).  
Isso implica:

- necessidade de estrategia clara de atualizacao de saldo;
- rotina de reconciliacao para detectar divergencias;
- cuidado com concorrencia em baixas simultaneas.

### DA-08. Validacoes complexas devem ficar na camada de dominio

O banco garante apenas parte das regras. Regras como:

- impedir saldo negativo;
- impedir pagamento acima do devido;
- validar hierarquia sem ciclos;
- validar coerencia entre total e itens;

devem ser centralizadas na camada de dominio/aplicacao.

### DA-09. Preparar eventos de dominio ou trilhas de auditoria

Para modulos criticos, especialmente financeiro e estoque, recomenda-se evoluir para trilha de auditoria ou eventos de dominio para registrar:

- criacao;
- alteracao de status;
- cancelamentos;
- ajustes;
- recalculos sensiveis.

### DA-10. Evolucao futura provavel

Com base no schema, os proximos pontos de crescimento do sistema tendem a exigir:

- conciliacao bancaria;
- controle de usuarios/perfis;
- contas a pagar e receber com juros/multa/desconto;
- estoque por localizacao fisica;
- vendas;
- apontamento de mao de obra;
- fechamento gerencial por competencia e caixa.

## 9. Pontos criticos para a proxima fase

Os seguintes itens merecem detalhamento antes de implementar regras mais sensiveis:

1. Definicao oficial do comportamento de saldo negativo em estoque.
2. Regra de geracao de lote em compras, producao e transferencias.
3. Regra de custeio do estoque: custo medio, lote especifico ou outro criterio.
4. Criterio para mudar status de transacao financeira.
5. Nivel de obrigatoriedade de centro de custo e conta por tipo de lancamento.
6. Regras por tipo de operacao agricola, inclusive exigencias minimas para concluir uma operacao.
7. Politica de cancelamento e estorno para financeiro e estoque.

## 10. Recomendacao de uso deste documento

Para continuar o desenvolvimento das regras criticas, a recomendacao e usar este documento como base para abrir especificacoes mais detalhadas por modulo:

- financeiro;
- estoque;
- operacao agricola;
- custeio gerencial;
- rastreabilidade e auditoria.

Cada modulo deve evoluir este material em tres niveis:

1. fluxo funcional;
2. regras validatorias;
3. cenarios de excecao e estorno.

