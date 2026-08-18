# Plano: custo do corte por operacoes de campo obrigatorias

## Goal

Refinar o lancamento de corte para que o custo unitario do lote produzido seja
calculado no momento da criacao do corte, a partir das operacoes de campo
informadas pelo usuario.

O resultado esperado e:

1. O usuario nao informa mais `unitCost` diretamente no corte.
2. O usuario e obrigado a cadastrar as operacoes de campo do corte no proprio
   fluxo de lancamento.
3. Cada operacao pode ter maquinas opcionais.
4. Cada operacao deve ter itens de custo/consumo suficientes para compor o custo
   do corte.
5. O custo total do corte e agregado a partir das operacoes.
6. A quantidade produzida e o custo unitario do lote sao calculados antes de
   criar o lote de estoque.
7. `production_batch`, `inventory_batch` e `inventory_movement` ja nascem com
   quantidade e custo derivados dos `field_operation_items`.
8. Nao ha override manual do custo unitario do lote.

## Current State

### Fluxo atual

`CutService.launch` hoje faz tudo em um servico unico:

1. Valida `LaunchCutRequest`.
2. Busca `Field` e `Product`.
3. Cria `cut`.
4. Cria `inventory_batch` com `request.unitCost()`.
5. Cria `inventory_movement` do tipo `PRODUCTION_IN` com `request.unitCost()`.
6. Cria `production_batch` vinculando corte, lote e movimento.

Problema: o custo do lote e informado diretamente pelo usuario, sem estar
amarrado a operacoes de campo.

### Schema existente

O schema ja possui tabelas para o desenho desejado:

- `cut`;
- `field_operation`, com `cut_id`;
- `field_operation_machine`;
- `field_operation_items`;
- `production_batch`;
- `inventory_batch`;
- `inventory_movement`.

Pontos importantes:

- `field_operation.cut_id` permite vincular operacoes ao corte.
- `field_operation_machine` registra maquina e horas, mas nao e fonte propria
  de custo.
- `field_operation_items` registra produto, quantidade, `unit_cost`, `amount` e
  `inventory_movement_id`.
- `production_batch` hoje nao possui coluna propria de custo; o custo aparece
  via `inventory_batch.unit_cost` e `inventory_movement.unit_cost`.

## Target Flow

Fluxo logico desejado:

```text
cut
-> field_operations
-> field_operation_machine optional
-> field_operation_items
-> production_batch with calculated unit cost
-> inventory_batch
-> inventory_movement PRODUCTION_IN
```

Fluxo transacional recomendado:

```text
LaunchCutUseCase
1. validate request
2. create cut
3. create field operations linked to cut
4. create optional field operation machines
5. create field operation items and their inventory consumption movements
6. calculate production quantity from field operation items
7. calculate total production cost from field operation items
8. calculate production unit cost
9. create inventory batch with calculated quantity and unit cost
10. create PRODUCTION_IN movement with calculated quantity and unit cost
11. create production batch linking cut, batch and movement
```

Observacao: no banco atual, `production_batch` referencia
`inventory_batch_id` e `inventory_movement_id`. Por isso, a ordem fisica de
persistencia pode criar `inventory_batch` e `inventory_movement` antes do
`production_batch`, mesmo que conceitualmente o lote de producao seja o
resultado do corte.

## Design Decisions

### Remover override manual

Nao implementar `manual_unit_cost`, `cost_source` ou override de custo.

Regra:

- O custo do lote e sempre calculado.
- `LaunchCutRequest.unitCost` deve ser removido ou ignorado em uma etapa de
  migracao.
- Se o usuario precisa alterar o custo, ele altera os itens das operacoes que
  compoem o custo.
- Essa decisao reduz risco de divergencia entre custo operacional e custo de
  estoque.

### Maquina nao e fonte separada de custo

`field_operation_machine` deve ser tratado como vinculo operacional da maquina
usada na operacao.

Regra:

- A maquina sempre pertence a uma `field_operation`.
- O custo continua vindo dos `field_operation_items` daquela operacao.
- Uma operacao com maquina e sem item nao compoe custo.
- `machine_cost` e apenas um recorte analitico: soma dos custos dos itens de
  operacoes que possuem maquina vinculada.
- `machine_cost` nao deve ser somado novamente ao total, porque ja esta
  incluido em `total_production_cost`.

### Tratar custo como snapshot no lancamento

O custo unitario calculado no lancamento deve ser gravado como snapshot em:

- `inventory_batch.unit_cost`;
- `inventory_movement.unit_cost` do `PRODUCTION_IN`.

Nao adicionar `total_cost` ou `unit_cost` em `production_batch` neste desenho,
porque isso duplicaria informacao que deve ser derivada dos
`field_operation_items` vinculados ao `cut_id`.

`production_batch.quantity` tambem deve ser derivado:

```text
production_batch.quantity = SUM(field_operation_items.quantity)
```

### Quebrar `CutService` em use cases

O fluxo de lancamento vai ficar grande demais para `CutService`.

Estrutura sugerida:

- `LaunchCutUseCase`: orquestra a criacao completa do corte.
- `CancelCutUseCase`: orquestra cancelamento do corte e estorno de estoque.
- `CutQueryService`: leitura/listagem.
- `ProductionCostCalculator`: calcula custo total e unitario.
- `FieldOperationCreationService`: cria operacoes, maquinas e itens.
- `ProductionStockService` ou uso do `InventoryStockService`: cria lote e
  movimentos de producao/consumo.

`CutService` pode ser mantido temporariamente como facade, delegando para os use
cases.

### Operacoes obrigatorias no lancamento

O request de lancamento do corte deve conter as operacoes do corte.

Regra minima:

- Deve haver pelo menos uma `fieldOperation`.
- Cada `fieldOperation` deve ter `operationType`, `operationDate` e `status`.
- Para lancamento de corte, status inicial deve ser `DONE`.
- Cada operacao deve ter pelo menos um item, porque os itens mandam no custo e
  na quantidade.
- Maquinas sao opcionais.
- Operacoes com maquina, mas sem item, nao devem ser aceitas no lancamento do
  corte.

## Cost Formula

Formula base:

```text
operation_item_cost = field_operation_items.unit_cost * field_operation_items.quantity
operation_items_cost = SUM(operation_item_cost)
machine_cost = SUM(operation_item_cost for field_operations that contain field_operation_machine)
total_production_cost = SUM(operation_item_cost)
production_batch.quantity = SUM(field_operation_items.quantity)
production_unit_cost = total_production_cost / production_batch.quantity
```

Observacoes:

- `machine_cost` e um subconjunto analitico de `total_production_cost`.
- `machine_cost` nao entra como parcela adicional no total.
- `field_operation_items.amount`, se mantido, deve ser calculado como
  `unit_cost * quantity` e pode ser usado apenas como valor materializado.
- A quantidade produzida nao vem mais do request do corte; ela vem da soma das
  quantidades dos itens das operacoes vinculadas ao corte.

Arredondamento:

- Usar `BigDecimal`.
- Definir escala padrao para custo unitario, por exemplo 4 ou 6 casas.
- Definir `RoundingMode.HALF_UP` ou outro padrao unico do dominio.

## Request Shape Sugerido

Exemplo conceitual:

```json
{
  "fieldId": 1,
  "productId": 10,
  "cutDate": "2026-08-18",
  "qualityGrade": "A",
  "observation": "Corte inicial",
  "fieldOperations": [
    {
      "operationType": "MOWING",
      "operationDate": "2026-08-18",
      "observation": "Corte com trator",
      "machines": [
        {
          "machineId": 3,
          "hoursWorked": 2.5,
          "observation": "Trator"
        }
      ],
      "items": [
        {
          "productId": 20,
          "inventoryBatchId": 99,
          "quantity": 5.0,
          "unitCost": 30.0,
          "observation": "Insumo aplicado"
        }
      ]
    }
  ]
}
```

Observacoes:

- `unitCost` sai do nivel do corte.
- `quantity` sai do nivel do corte.
- `amount` deve ser calculado pelo backend quando possivel.
- Se item consumir estoque, `inventoryBatchId` deve ser informado ou resolvido
  por regra explicita.
- O backend deve criar `field_operation_items.inventory_movement_id`.

## Domain Rules

### Criacao do corte

- Criacao deve ser atomica.
- Se qualquer operacao, item, consumo ou movimento falhar, nada deve ser salvo.
- O corte so pode ser criado com custo total valido.
- `productionBatch.quantity` calculada deve ser maior que zero.
- `totalProductionCost` deve ser maior ou igual a zero.
- `productionUnitCost` deve ser calculado antes do `PRODUCTION_IN`.

### Operacoes de campo

- Operacoes criadas dentro do lancamento do corte ja nascem com `cut_id`.
- Operacoes do corte devem nascer como `DONE`.
- Operacoes `PLANNED` nao entram no lancamento de corte.
- Operacoes `CANCELED` nao devem ser aceitas no request de lancamento.

### Itens de operacao

- `field_operation_items.quantity` e `field_operation_items.unit_cost` mandam
  no custo e na quantidade produzida do corte.
- `field_operation_items.amount` deve ser derivado de quantidade e custo, quando
  persistido.
- Se o item representa consumo de produto controlado por estoque:
  - criar `inventory_movement` do tipo `CONSUMPTION_OUT`;
  - vincular esse movimento em `field_operation_items.inventory_movement_id`;
  - validar saldo do lote consumido.
- Se o item representa custo sem movimentar estoque, o schema atual nao atende
  bem porque `inventory_movement_id` e obrigatorio.
  - Opcao A: criar tabela separada para custos nao estoque.
  - Opcao B: permitir `inventory_movement_id` nullable por migration.
  - Opcao C: manter primeira versao apenas para insumos com estoque.

### Maquinas

- `field_operation_machine` nao compoe custo diretamente.
- A maquina classifica a operacao para analise e rastreabilidade.
- O custo de operacoes com maquina vem dos `field_operation_items` da propria
  operacao.
- `machine_cost` pode ser calculado filtrando operacoes que possuem pelo menos
  uma maquina vinculada.

### Depois do corte criado

Como nao havera override, editar operacoes de um corte ja produzido fica
sensivel.

Regra recomendada para primeira versao:

- Se o lote nao tem movimentos posteriores alem do `PRODUCTION_IN`, permitir
  editar operacoes e recalcular:
  - `production_batch.quantity`;
  - `inventory_batch.unit_cost`;
  - `inventory_batch.quantity`, se a quantidade produzida for alterada;
  - `PRODUCTION_IN.unit_cost`.
  - `PRODUCTION_IN.quantity`, se a quantidade produzida for alterada.
- Se o lote ja tem `SALE_OUT`, `CONSUMPTION_OUT`, ajuste ou qualquer movimento
  posterior, bloquear edicao de custos do corte.
- Para corrigir custo apos saida, exigir processo futuro de ajuste contabil ou
  estorno/recriacao, nao recalculo silencioso.

### Cancelamento

- Cancelamento deve cancelar o corte e estornar a entrada de producao.
- Se houver movimentos posteriores no lote produzido, manter bloqueio atual.
- Tambem deve estornar ou cancelar os movimentos de consumo gerados pelos
  `field_operation_items`, se eles foram criados no lancamento.

## Implementation Plan

### Phase 1: Definir contrato do novo lancamento

- Criar novo DTO para lancamento agregado, por exemplo
  `LaunchCutWithOperationsRequest`.
- Remover `unitCost` do nivel do corte.
- Incluir lista obrigatoria de `fieldOperations`.
- Incluir maquinas opcionais.
- Incluir itens de operacao.
- Definir validacoes de request.
- Manter endpoint atual temporariamente ou substituir com migration coordenada
  com o frontend.

### Phase 2: Implementar dominio backend de field operations

- Criar entidades Java para:
  - `FieldOperation`;
  - `FieldOperationMachine`;
  - `FieldOperationItem`.
- Criar repositories.
- Mapear enums de `operation_type` e `status`.
- Implementar criacao interna usada pelo `LaunchCutUseCase`.
- Adiar CRUD publico completo se o foco inicial for lancamento de corte.

### Phase 3: Consolidar regra de custo por itens

- Definir que `field_operation_items.quantity` e
  `field_operation_items.unit_cost` sao a unica fonte de custo e quantidade.
- Calcular `field_operation_items.amount` no backend, se o campo continuar
  persistido.
- Definir que `field_operation_machine` e apenas uma dimensao operacional.
- Calcular `machine_cost` como recorte dos itens de operacoes que possuem
  maquina vinculada.
- Garantir que operacoes com maquina continuam exigindo pelo menos um item.

### Phase 4: Ajustar schema e DTOs sem duplicar custo

- Nao adicionar `total_cost` ou `unit_cost` em `production_batch`.
- Garantir que `production_batch.quantity` seja preenchido pela soma dos itens
  das operacoes do corte.
- Manter `inventory_batch.unit_cost` como custo efetivo do estoque.
- Manter `inventory_movement.unit_cost` como snapshot do movimento.
- Expor custo total e custo unitario em responses por calculo, quando
  necessario, a partir de `field_operation_items`.

### Phase 5: Criar use cases

- Criar `LaunchCutUseCase`.
- Criar `CancelCutUseCase`.
- Criar `ProductionCostCalculator`.
- Criar servico interno para persistir operacoes de campo.
- Reduzir `CutService` para facade ou leitura.

### Phase 6: Implementar lancamento atomico

- Criar `cut`.
- Criar operacoes vinculadas.
- Criar maquinas vinculadas.
- Criar consumos de itens e movimentos `CONSUMPTION_OUT`, quando aplicavel.
- Calcular quantidade produzida.
- Calcular custo total.
- Calcular custo unitario.
- Criar `inventory_batch`.
- Criar `PRODUCTION_IN`.
- Criar `production_batch`.
- Retornar response contendo ids criados e custos calculados.

### Phase 7: Atualizar frontend

- Tela de corte passa a cadastrar operacoes dentro do fluxo de criacao.
- Remover campo de custo unitario manual do corte.
- Mostrar resumo antes de salvar:
  - custo de itens;
  - custo de itens em operacoes com maquina;
  - custo total;
  - quantidade produzida;
  - custo unitario calculado.
- Bloquear salvamento enquanto nao houver dados suficientes para calcular custo.

### Phase 8: Testes

- Testar lancamento com item de operacao e sem maquina.
- Testar lancamento com maquina e item, garantindo que maquina nao adiciona
  custo fora dos itens.
- Testar rejeicao sem operacoes.
- Testar rejeicao de operacao sem item.
- Testar calculo de custo unitario.
- Testar calculo de quantidade produzida pela soma dos itens.
- Testar criacao de `cut`, `field_operation`, `field_operation_items`,
  `inventory_batch`, `PRODUCTION_IN` e `production_batch` na mesma transacao.
- Testar rollback quando uma etapa falhar.
- Testar cancelamento estornando producao e consumos.
- Testar bloqueio de edicao/cancelamento quando houver movimentos posteriores.

## Open Questions

- `field_operation_items` deve continuar sempre ligado a movimento de estoque?
- Precisamos suportar custos que nao movimentam estoque ja na primeira versao?
- Todos os itens de uma operacao usam a mesma unidade do produto produzido, ou
  precisamos validar/converter unidade antes de somar?
- Custos de preparo/plantio anteriores ao primeiro corte entram no corte atual,
  sao rateados, ou ficam fora desse fluxo?
- Edicao de operacoes apos corte criado deve ser permitida antes de qualquer
  saida do lote produzido?
- O frontend deve permitir salvar rascunho de corte sem produzir lote, ou corte
  so existe quando estiver completo?

## Risks

- Exigir todas as operacoes no lancamento aumenta complexidade de UX.
- Sem rascunho, o usuario precisa ter todos os dados antes de criar o corte.
- Somar `field_operation_items.quantity` exige que todos os itens sejam
  comparaveis na mesma unidade da producao.
- O schema atual torna `field_operation_items.inventory_movement_id`
  obrigatorio, dificultando custos sem estoque.
- Criar consumo de insumos e producao na mesma transacao exige rollback
  consistente.
- Editar custos depois de vendas pode quebrar historico se nao for bloqueado.
- Quebrar `CutService` em use cases reduz acoplamento, mas exige cuidado para
  nao duplicar regras de estoque.

## Recommended First Cut

1. Criar `LaunchCutUseCase` com novo request contendo operacoes.
2. Implementar entidades/repositories de field operations.
3. Nao adicionar custo duplicado em `production_batch`.
4. Remover `unitCost` e `quantity` manuais do fluxo novo de corte.
5. Calcular quantidade produzida por `SUM(field_operation_items.quantity)`.
6. Calcular custo por `SUM(field_operation_items.unit_cost * quantity)`.
7. Bloquear operacao sem item.
8. Criar lote e `PRODUCTION_IN` com quantidade e custo calculados.
9. Manter movimentos de venda usando snapshot do `inventory_batch.unit_cost`.
10. Bloquear edicao de custos quando o lote tiver movimentos posteriores.
