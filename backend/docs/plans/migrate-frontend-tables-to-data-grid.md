# Plano: migrar tabelas do frontend para data grid

## Goal

Substituir gradualmente as tabelas manuais do frontend por um componente de data
grid padronizado, mantendo o visual atual do ERP e adicionando recursos de uso
diario:

1. filtros por coluna;
2. busca rapida;
3. ordenacao;
4. paginacao;
5. controle de colunas visiveis quando fizer sentido;
6. exportacao para Excel ou formato compativel com Excel;
7. base reutilizavel para telas simples e complexas.

## Current State

- O frontend usa React 18, TypeScript, Vite e Material UI.
- Nao ha biblioteca de data grid instalada hoje.
- As tabelas atuais sao feitas com `@mui/material/Table`.
- Existe um componente compartilhado `CrudTable`, usado por abas simples.
- Foram encontrados 16 arquivos com tabelas e 20 instancias de `<Table>`.
- A tela financeira possui tabelas aninhadas dentro de linhas expansivas e deve
  ficar para uma fase posterior.

Arquivos com tabelas relevantes:

- `frontend/src/app/components/shared/CrudTable.tsx`
- `frontend/src/app/components/products/ProductsTab.tsx`
- `frontend/src/app/components/products/FamiliesTab.tsx`
- `frontend/src/app/components/products/UnitsTab.tsx`
- `frontend/src/app/components/master/SimpleListTab.tsx`
- `frontend/src/app/components/master/CounterpartiesTab.tsx`
- `frontend/src/app/components/banking/BankingModule.tsx`
- `frontend/src/app/components/financial/TransactionsTab.tsx`
- `frontend/src/app/components/financial/BankTransfersTab.tsx`
- `frontend/src/app/components/inventory/InventoryMovementsTab.tsx`
- `frontend/src/app/components/agricultural/CutsTab.tsx`
- `frontend/src/app/components/agricultural/BatchesTab.tsx`
- `frontend/src/app/components/agricultural/FieldsTab.tsx`
- `frontend/src/app/components/agricultural/MachinesTab.tsx`
- `frontend/src/app/components/agricultural/FieldOperationsTab.tsx`
- `frontend/src/app/components/agricultural/FieldOperationItemsTab.tsx`
- `frontend/src/app/components/agricultural/FieldOperationMachinesTab.tsx`
- `frontend/src/app/components/accounting/ChartOfAccountsTab.tsx`
- `frontend/src/app/components/accounting/CostCentersTab.tsx`
- `frontend/src/app/components/accounting/IncomeStatementRelationshipsTab.tsx`

## Options

### MUI X Data Grid

Pontos fortes:

- Melhor encaixe visual, porque o projeto ja usa Material UI.
- Menor custo de migracao inicial.
- Community e MIT.
- Community ja cobre ordenacao, paginacao, filtro por coluna basico, quick
  filter e CSV export.
- Pro/Premium adicionam recursos mais avancados.

Limites relevantes:

- Multi-filtro, pinning, resize avancado e alguns recursos de layout entram em
  Pro.
- Excel `.xlsx` nativo do grid entra em Premium.
- Master/detail tambem entra em Pro.

### AG Grid

Pontos fortes:

- Muito forte para ERP e tabelas densas.
- Community cobre filtros, ordenacao, paginacao, renderizacao customizada e CSV.
- Melhor quando a aplicacao precisa virar uma planilha operacional complexa.

Limites relevantes:

- Excel `.xlsx` nativo entra em Enterprise.
- Master/detail entra em Enterprise.
- Exige mais trabalho para ficar visualmente consistente com Material UI.

## Recommendation

Comecar com **MUI X Data Grid Community** e criar um wrapper interno
`AppDataGrid`.

Motivos:

- O projeto ja usa MUI, entao o visual atual e mais facil de preservar.
- A maior parte das telas precisa primeiro de filtro, ordenacao, paginacao e
  export simples.
- Um wrapper evita acoplamento direto de todas as telas a uma biblioteca.
- Se no futuro a decisao mudar para AG Grid ou MUI Premium, o impacto fica mais
  concentrado.

Decisao pendente:

- Se o requisito for **Excel `.xlsx` nativo do grid**, sera necessario escolher
  uma licenca paga: MUI Premium ou AG Grid Enterprise.
- Se aceitarmos `CSV` ou um `.xlsx` gerado por utilitario proprio, podemos
  iniciar com MUI Community sem licenca paga.

## Design Decisions

- Nao migrar tela por tela diretamente para a biblioteca escolhida.
- Criar primeiro um componente compartilhado `AppDataGrid`.
- O wrapper deve receber colunas tipadas, linhas, loading, actions, empty state,
  nome do arquivo de exportacao e configuracoes opcionais.
- O wrapper deve padronizar:
  - altura minima;
  - densidade compacta;
  - textos em portugues;
  - estilos de header;
  - toolbar;
  - pagina inicial;
  - page size;
  - exportacao;
  - comportamento de loading e empty state.
- Colunas de acao nao devem ser exportadas.
- Valores renderizados com chip/componente devem ter `valueFormatter` ou campo
  derivado exportavel.
- Datas devem ser exportadas em formato legivel para usuario final.
- Valores monetarios devem manter valor numerico quando exportados, quando
  possivel.
- Filtros e ordenacao devem ser client-side no primeiro corte.
- Server-side filtering/sorting/pagination deve ser considerado depois, se as
  listas crescerem.

## Implementation Steps

### 1. Dependency

1. Adicionar `@mui/x-data-grid`.
2. Rodar `npm run build` para validar compatibilidade com React/MUI atuais.
3. Nao instalar Pro/Premium no primeiro corte sem decisao explicita de licenca.

### 2. Shared grid wrapper

1. Criar `frontend/src/app/components/shared/AppDataGrid.tsx`.
2. Expor props minimas:
   - `rows`;
   - `columns`;
   - `loading`;
   - `getRowId`;
   - `emptyMessage`;
   - `exportFileName`;
   - `actionsColumn`;
   - `initialSortModel`;
   - `initialColumnVisibilityModel`.
3. Configurar toolbar padrao com:
   - quick filter;
   - botao de export CSV;
   - seletor de colunas, se disponivel na versao escolhida.
4. Configurar textos em portugues.
5. Criar helper de colunas para actions, status, datas e moeda.
6. Garantir que o wrapper funcione bem dentro de `Card`.

### 3. First migration slice

Migrar uma tela simples primeiro para validar API e visual.

Ordem sugerida:

1. `ProductsTab`
2. `CutsTab`
3. `InventoryMovementsTab`

Motivo:

- `ProductsTab` valida chips, labels, status e actions.
- `CutsTab` valida datas, status, valores numericos e acao de cancelamento.
- `InventoryMovementsTab` valida volume maior e origem dos movimentos.

### 4. CrudTable migration

Depois do primeiro slice, adaptar ou substituir `CrudTable`.

Opcoes:

- Criar `CrudDataGrid` mantendo a mesma ideia do `CrudTable`.
- Ou alterar `CrudTable` internamente para renderizar `AppDataGrid`.

Recomendacao:

- Criar `CrudDataGrid` primeiro para migracao segura.
- Remover `CrudTable` apenas quando nao houver mais uso.

Telas impactadas pelo `CrudTable`:

- `BatchesTab`
- `MachinesTab`
- `FieldOperationItemsTab`
- `FieldOperationMachinesTab`
- `FieldOperationsTab`

### 5. Remaining simple tables

Migrar em blocos por dominio:

1. Products/master data:
   `FamiliesTab`, `UnitsTab`, `SimpleListTab`, `CounterpartiesTab`.
2. Banking/financial simple:
   `BankingModule`, `BankTransfersTab`.
3. Accounting:
   `ChartOfAccountsTab`, `CostCentersTab`,
   `IncomeStatementRelationshipsTab`.
4. Agricultural:
   `FieldsTab` e telas restantes que nao foram cobertas pelo `CrudDataGrid`.

### 6. Complex financial transactions

Migrar `TransactionsTab` por ultimo.

Riscos:

- A tela tem linha expansivel.
- Existem tabelas aninhadas para itens, pagamentos e anexos.
- A migracao pode exigir master/detail.
- Master/detail nativo em MUI e Pro; em AG Grid e Enterprise.

Plano para essa tela:

1. Manter a tabela atual ate o wrapper estar maduro.
2. Avaliar se o painel expandido pode continuar como componente React manual.
3. Se a experiencia ficar ruim sem master/detail nativo, decidir licenca antes
   de migrar.

### 7. Export to Excel

Caminhos possiveis:

1. MVP sem licenca paga:
   usar CSV com separador `;`, BOM UTF-8 e nome de arquivo padronizado.
2. MVP com `.xlsx` proprio:
   gerar arquivo com uma biblioteca como `exceljs`, usando linhas/colunas
   filtradas do grid quando possivel.
3. Solucao nativa paga:
   usar MUI Premium ou AG Grid Enterprise.

Recomendacao inicial:

- Implementar CSV no wrapper.
- Decidir `.xlsx` apos validar o custo de licenca e necessidade real do usuario.

## Backend Considerations

- Nenhuma alteracao backend e necessaria para o primeiro corte se os filtros
  forem client-side.
- Quando houver listas grandes, criar contratos de API com:
  - page;
  - pageSize;
  - sort;
  - filters;
  - quickFilter.
- Export server-side deve ser endpoint proprio, para exportar todos os dados
  filtrados sem depender de carregar tudo no navegador.

## Validation

### Build

1. `cd frontend; npm run build`

### Manual checks

1. Filtros por coluna funcionam em texto, numero, data e status.
2. Quick filter encontra valores formatados importantes.
3. Ordenacao de datas nao quebra por formato `pt-BR`.
4. Exportacao nao inclui coluna de acoes.
5. Exportacao respeita filtros e ordenacao visiveis.
6. Chips/status continuam legiveis.
7. Actions de editar/deletar/cancelar continuam funcionando.
8. Empty state e loading continuam claros.
9. Layout funciona em tela pequena.
10. Nenhuma tela perde informacao que existia na tabela manual.

## Progress

- [x] Inventario inicial de tabelas do frontend.
- [x] Comparacao inicial entre MUI Data Grid e AG Grid.
- [x] Decisao recomendada: iniciar com MUI Data Grid Community + wrapper.
- [ ] Decidir se `.xlsx` nativo pago e requisito obrigatorio.
- [ ] Adicionar dependencia de grid.
- [ ] Criar `AppDataGrid`.
- [ ] Migrar primeira tela piloto.
- [ ] Validar build e UX.
- [ ] Migrar `CrudTable`/`CrudDataGrid`.
- [ ] Migrar telas simples por dominio.
- [ ] Avaliar estrategia para `TransactionsTab`.

## References

- MUI X licensing: https://mui.com/x/introduction/licensing/
- MUI Data Grid export: https://mui.com/x/react-data-grid/export/
- MUI Data Grid filtering: https://mui.com/x/react-data-grid/filtering/
- AG Grid Community vs Enterprise:
  https://www.ag-grid.com/javascript-data-grid/community-vs-enterprise/
- AG Grid Excel export: https://www.ag-grid.com/react-data-grid/excel-export/
