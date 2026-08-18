# Plano: otimizar tabelas do frontend

## Goal

Melhorar a manutencao e a responsividade das tabelas do frontend.

O resultado esperado e:

1. Tabelas deixam de repetir a mesma estrutura de `Card`, `Table`, `TableHead`,
   `TableBody`, estado vazio e acoes em cada pagina.
2. `CrudTable` continua existindo, mas passa a usar uma base compartilhada de
   tabela em vez de ser a unica abstracao reutilizavel.
3. Tabelas largas passam a preservar informacao em telas pequenas por meio de
   scroll horizontal local.
4. Tabelas com muitos registros passam a poder usar scroll vertical local com
   cabecalho fixo.
5. Tabelas especiais, como arvores e linhas expansivas, mantem comportamento
   especifico sem duplicar o container responsivo.
6. A validacao passa a incluir larguras pequenas de tela, nao apenas desktop.

## Current State

### Estrutura atual

- O frontend usa Material UI `Table` diretamente em varias telas.
- Existe `CrudTable` em `frontend/src/app/components/shared/CrudTable.tsx`.
- `CrudTable` mistura tres responsabilidades:
  - renderizacao visual da tabela;
  - controle de dialog de criacao/edicao;
  - padrao CRUD de acoes por linha.
- Algumas telas usam `CrudTable`, principalmente no dominio agricola:
  - `BatchesTab`;
  - `FieldOperationMachinesTab`;
  - `MachinesTab`;
  - `FieldOperationItemsTab`;
  - `FieldOperationsTab`.
- Muitas telas montam tabelas manualmente:
  - `BankingModule`;
  - `TransactionsTab`;
  - `BankTransfersTab`;
  - `InventoryMovementsTab`;
  - `ProductsTab`;
  - `FamiliesTab`;
  - `UnitsTab`;
  - `CounterpartiesTab`;
  - `SimpleListTab`;
  - `ChartOfAccountsTab`;
  - `CostCentersTab`;
  - `IncomeStatementRelationshipsTab`;
  - `CutsTab`;
  - `FieldsTab`;
  - `Dashboard`.

### Responsividade atual

- As tabelas nao usam `TableContainer` com `overflowX: auto`.
- As tabelas nao definem largura minima por tabela ou por coluna.
- Em telas pequenas, colunas largas podem ser comprimidas ou cortadas.
- O layout principal usa areas com `overflow: hidden` para controlar o app shell.
  Isso e aceitavel, mas exige que cada tabela tenha seu proprio container de
  scroll.
- Nao ha politica consistente para:
  - `minWidth` de tabela;
  - `minWidth` por coluna;
  - truncamento controlado;
  - coluna de acoes fixa;
  - cabecalho fixo;
  - altura maxima da tabela.

### Risco pratico

- Aplicar `overflowX` manualmente em cada `Card` resolveria parte do problema,
  mas manteria a duplicacao e provavelmente criaria diferencas visuais entre
  paginas.
- Migrar tudo diretamente para uma biblioteca de grid agora aumentaria escopo e
  risco, porque ha tabelas simples, CRUD, arvores, linhas expansivas e tabelas
  aninhadas.

## Design Decisions

### Abstracao recomendada

- Criar uma base compartilhada, por exemplo:
  - `frontend/src/app/components/shared/table/ResponsiveTable.tsx`;
  - ou `frontend/src/app/components/shared/table/TableFrame.tsx`.
- Essa base deve ser responsavel apenas por estrutura e responsividade:
  - `Card`;
  - `TableContainer`;
  - `Table`;
  - `stickyHeader`;
  - `overflowX: auto`;
  - `overflowY: auto` quando `maxHeight` for informado;
  - `minWidth` da tabela;
  - estilo comum de linhas, cabecalho e acoes.
- Separar o componente generico de exibicao do componente CRUD:
  - `DataTable<T>` ou `ResponsiveDataTable<T>` renderiza colunas e linhas;
  - `CrudTable<T>` usa `DataTable<T>` e continua cuidando de dialog, salvar,
    editar e excluir;
  - `SimpleListTab` pode ser simplificado para usar o mesmo `DataTable<T>`.

### Contrato de colunas

- Evoluir `CrudColumn<T>` para um tipo compartilhado, por exemplo
  `TableColumn<T>`.
- Campos sugeridos:
  - `id`: chave estavel da coluna, sem depender de `label`;
  - `label`: texto do cabecalho;
  - `render`: conteudo da celula;
  - `align`: alinhamento;
  - `width`: largura preferencial;
  - `minWidth`: largura minima para scroll horizontal previsivel;
  - `maxWidth`: limite para textos longos;
  - `nowrap`: evita quebra quando a informacao precisa ficar em uma linha;
  - `cellSx` e `headerSx`: escapes controlados para casos especificos.
- A chave da coluna nao deve continuar sendo `label`, porque labels podem mudar
  e se repetir.

### Politica de responsividade

- Nao esconder colunas no primeiro corte. O requisito principal e nao perder
  informacao, entao a estrategia inicial deve ser scroll horizontal.
- Toda tabela dentro de pagina deve ter container com:
  - `width: 100%`;
  - `maxWidth: 100%`;
  - `overflowX: auto`;
  - `overflowY: auto` somente quando houver `maxHeight`;
  - `WebkitOverflowScrolling: touch`.
- Toda tabela com muitas colunas deve definir `minWidth`.
- Colunas numericas, datas e acoes devem ter `nowrap`.
- Textos longos devem usar uma das duas estrategias:
  - permitir quebra quando a coluna e descritiva e a linha pode crescer;
  - usar `maxWidth`, `overflow: hidden`, `textOverflow: ellipsis` e `title`
    quando a linha precisa permanecer compacta.
- A coluna de acoes deve poder ser fixa a direita em tabelas largas.
  Isso evita que editar/excluir fique inacessivel quando o usuario rola para a
  esquerda.
- A primeira coluna pode ser fixa a esquerda em tabelas muito largas, mas isso
  deve ser opcional. Aplicar em todas as tabelas pode criar sobreposicao visual.
- Para scroll vertical, usar `stickyHeader` e `maxHeight` configuravel por tela.
  Nao aplicar altura fixa global, porque tabelas pequenas ficariam piores.

### Quando usar cada componente

- Usar `CrudTable` para cadastros simples com criar, editar e excluir.
- Usar `DataTable` para listas sem dialog CRUD ou com acoes customizadas.
- Usar `ResponsiveTableFrame` diretamente quando a tela precisa de estrutura
  especial:
  - arvores (`ChartOfAccountsTab`, `CostCentersTab`);
  - linhas expansivas (`TransactionsTab`);
  - tabelas aninhadas dentro de detalhes;
  - dashboard.
- Manter definicoes de colunas perto da pagina no primeiro corte. Depois,
  mover colunas reutilizaveis para arquivos do dominio quando houver repeticao
  real.

### Bibliotecas externas

- Nao adicionar MUI X Data Grid neste momento.
- Motivo: o problema atual e estrutural e responsivo, nao falta de recursos de
  grid. Data Grid traria outra API, outro estilo e migracao maior para casos de
  arvore, linhas expansivas e tabelas aninhadas.
- Reavaliar Data Grid apenas se entrarem requisitos como:
  - ordenacao por coluna em muitas telas;
  - filtros complexos por coluna;
  - paginacao virtualizada;
  - resize/reorder de colunas;
  - exportacao de dados.

## Implementation Steps

### 1. Criar base de tabela responsiva

- Criar pasta `frontend/src/app/components/shared/table`.
- Criar `TableColumn<T>`.
- Criar `ResponsiveTableFrame` com props:
  - `children`;
  - `minWidth`;
  - `maxHeight`;
  - `stickyHeader`;
  - `dense`;
  - `ariaLabel`;
  - `cardSx`;
  - `containerSx`;
  - `tableSx`.
- Criar `DataTable<T>` com props:
  - `items`;
  - `columns`;
  - `getRowId`;
  - `emptyMessage`;
  - `loadingMessage`;
  - `isLoading`;
  - `renderActions`;
  - `actionsHeader`;
  - `minWidth`;
  - `maxHeight`;
  - `stickyHeader`;
  - `rowSx`.
- Mover `EmptyTableRow` para continuar sendo usado pelo `DataTable`, sem
  quebrar imports existentes no primeiro corte.

### 2. Atualizar `CrudTable`

- Trocar a renderizacao interna de `CrudTable` para usar `DataTable`.
- Manter a API publica de `CrudTable` o mais compativel possivel.
- Adicionar suporte opcional a:
  - `getRowId`;
  - `tableMinWidth`;
  - `tableMaxHeight`;
  - `stickyHeader`;
  - `actionsSticky`;
  - `columns` com `id`, mantendo compatibilidade temporaria com `label`.
- Garantir que os componentes que ja usam `CrudTable` ganhem scroll horizontal
  sem alteracao funcional.

### 3. Atualizar `SimpleListTab`

- Migrar `SimpleListTab` para `DataTable`.
- Remover duplicacao de `TableHead`, `TableBody`, estado vazio e `RowActions`
  manual.
- Validar que telas baseadas nele continuam com os mesmos dialogs e acoes.

### 4. Migrar tabelas manuais simples

- Migrar primeiro tabelas com menor complexidade:
  - `FamiliesTab`;
  - `FieldsTab`;
  - `BankTransfersTab`;
  - `IncomeStatementRelationshipsTab`;
  - `ProductsTab`;
  - `BankingModule`;
  - `CounterpartiesTab`;
  - `CutsTab`;
  - `InventoryMovementsTab`.
- Para cada uma:
  - definir `columns` tipadas;
  - definir `minWidth` coerente com quantidade de colunas;
  - marcar colunas numericas e datas como `nowrap`;
  - usar `renderActions` para acoes por linha;
  - manter mensagens de loading/vazio existentes.

### 5. Migrar tabelas especiais

- Migrar `ChartOfAccountsTab` e `CostCentersTab` para usar
  `ResponsiveTableFrame`, preservando `TreeNode`.
- Migrar `TransactionsTab` em duas partes:
  - tabela principal com scroll horizontal, acoes acessiveis e linha expansiva;
  - tabelas aninhadas de itens, pagamentos e anexos usando o mesmo frame ou
    uma variante compacta.
- Migrar a tabela do `Dashboard` para o frame responsivo sem mudar o layout dos
  cards.

### 6. Ajustar layout e tema se necessario

- Verificar se o container principal precisa de `minWidth: 0` nos filhos flex
  para permitir que o scroll fique dentro da tabela.
- Manter `overflow: hidden` no app shell se ele continuar necessario para evitar
  scroll duplicado da pagina inteira.
- Concentrar estilos comuns de celula no tema ou no componente base, nao nas
  paginas.
- Evitar override global que force todas as tabelas a terem a mesma altura.

### 7. Limpeza final

- Remover imports diretos de `Table`, `TableHead`, `TableBody` e `TableRow` de
  paginas que ja usam `DataTable`.
- Padronizar labels de acoes como `Acoes`.
- Padronizar mensagens de vazio e carregamento.
- Documentar o padrao de uso no proprio diretorio shared ou em um comentario
  curto no componente.

## Suggested Defaults

- Tabelas pequenas: `minWidth: 640`.
- Tabelas medias: `minWidth: 900`.
- Tabelas largas: `minWidth: 1100` a `1400`.
- Tabelas muito largas ou financeiras: `minWidth: 1400` ou mais, de acordo com
  a soma dos `minWidth` das colunas.
- `maxHeight` recomendado para listas operacionais:
  - `calc(100vh - 220px)` quando ha apenas cabecalho de pagina;
  - `calc(100vh - 300px)` quando ha filtros, cards ou estatisticas acima.
- `stickyHeader: true` quando `maxHeight` for usado.
- `actionsSticky: true` para tabelas com mais de seis colunas.

## Dependencies

- Nenhuma dependencia nova obrigatoria.
- Usar componentes ja existentes do Material UI:
  - `Card`;
  - `TableContainer`;
  - `Table`;
  - `TableHead`;
  - `TableBody`;
  - `TableCell`;
  - `TableRow`.
- O plano nao exige alteracao no backend, banco de dados ou migrations.
- A migration `V2__normalize_local_date_storage.sql` nao e parte desta mudanca.

## Validation

### Build

- [x] Rodar `cd frontend; npm run build`.

### Validacao manual

- Validar as principais telas nas larguras:
  - 1440px;
  - 1024px;
  - 768px;
  - 390px.
- Em cada largura, verificar:
  - nenhuma coluna some sem decisao explicita;
  - scroll horizontal aparece dentro da tabela quando necessario;
  - a pagina nao cria scroll horizontal global desnecessario;
  - a coluna de acoes continua acessivel;
  - cabecalho fica legivel;
  - textos longos nao quebram o layout;
  - dialogs continuam abrindo e salvando;
  - estados vazio e carregando continuam com `colSpan` correto.

### Telas prioritarias para QA

- `TransactionsTab`, porque possui tabela larga, linhas expansivas e tabelas
  aninhadas.
- `InventoryMovementsTab`, porque possui muitas colunas e valores monetarios.
- `BankingModule`, porque possui muitas colunas em uma lista operacional.
- `CounterpartiesTab`, porque possui textos longos e muitas colunas.
- `ProductsTab`, porque e cadastro central e ja possui colunas de status e
  estoque.

## Risks

- Sticky columns podem sobrepor conteudo se `zIndex`, background e sombras nao
  forem tratados no componente base.
- Scroll vertical local pode gerar scroll duplo se aplicado em todas as telas.
  Por isso deve ser opt-in por `maxHeight`.
- Migrar `TransactionsTab` de uma vez e arriscado. Ela deve ser tratada depois
  das tabelas simples.
- `CrudTable` tem API generica atual baseada em `Partial<T>`. A refatoracao nao
  deve alterar esse contrato no mesmo corte para nao misturar responsividade com
  mudanca de formulario.
- Usar `label` como chave de coluna pode gerar bugs em futuras traducoes ou
  labels duplicadas. A migracao para `id` deve ser feita com compatibilidade
  temporaria.

## Progress

- [x] Estado atual das tabelas foi inspecionado.
- [x] Plano criado.
- [x] Criar base compartilhada de tabela responsiva.
- [x] Atualizar `CrudTable`.
- [x] Atualizar `SimpleListTab`.
- [x] Migrar tabelas manuais simples.
- [x] Migrar tabelas especiais.
- [x] Rodar build do frontend.
- [ ] Validar manualmente em larguras pequenas.

## Discoveries

- O projeto ja possui `CrudTable`, mas ele atende apenas parte do problema
  porque acopla tabela e fluxo CRUD.
- Nao foi encontrado uso de `TableContainer`, `overflowX` ou `stickyHeader` nas
  tabelas atuais.
- O layout principal controla overflow do app shell. Portanto, o scroll
  horizontal precisa ser local na tabela para nao perder conteudo.
- Ha apenas algumas telas usando `CrudTable`; a maioria das tabelas ainda esta
  definida diretamente em cada pagina.
- A implementacao criou `ResponsiveTableFrame` e `DataTable`.
- `ResponsiveTableFrame` possui modo padrao com `Card` e modo `withCard={false}`
  para tabelas aninhadas ou dentro de cards existentes.
- `CrudTable` e `SimpleListTab` passaram a usar `DataTable`.
- As telas que ainda precisam montar linhas manualmente passaram a usar
  `ResponsiveTableFrame`, incluindo `TransactionsTab`, `InventoryMovementsTab`,
  `Dashboard`, arvores de contabilidade e cadastros com muitas colunas.
- `Layout` recebeu `minWidth: 0` nos containers flex principais para permitir
  que o overflow horizontal fique preso ao container da tabela.
- `npm run build` passou apos a migracao.
- Ainda falta QA visual manual nas larguras pequenas listadas na secao de
  validacao.
