import { Box, Card } from '@mui/material';
import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  type GridValidRowModel,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

type AppDataGridProps<R extends GridValidRowModel> = Omit<
  DataGridProps<R>,
  'rows' | 'columns' | 'density' | 'disableRowSelectionOnClick' | 'localeText'
> & {
  rows: R[];
  columns: GridColDef<R>[];
  emptyMessage?: string;
  exportFileName?: string;
  height?: number;
};

export function AppDataGrid<R extends GridValidRowModel>({
  rows,
  columns,
  emptyMessage = 'Nenhum registro encontrado.',
  exportFileName = 'dados',
  height = 440,
  initialState,
  pageSizeOptions = [10, 25, 50, 100],
  showToolbar = true,
  slotProps,
  sx,
  ...props
}: AppDataGridProps<R>) {
  return (
    <Card>
      <Box sx={{ height: rows.length > 0 ? height : 260, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          density="compact"
          disableRowSelectionOnClick
          showToolbar={showToolbar}
          pageSizeOptions={pageSizeOptions}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
            ...initialState,
          }}
          localeText={{
            ...ptBR.components.MuiDataGrid.defaultProps.localeText,
            noRowsLabel: emptyMessage,
            toolbarExport: 'Exportar',
            toolbarExportCSV: 'Baixar CSV',
            toolbarQuickFilterPlaceholder: 'Buscar...',
          }}
          slotProps={{
            ...slotProps,
            toolbar: {
              csvOptions: {
                delimiter: ';',
                fileName: exportFileName,
                utf8WithBom: true,
              },
              printOptions: { disableToolbarButton: true },
              ...slotProps?.toolbar,
            },
          }}
          sx={{
            border: 0,
            color: 'text.primary',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#F5F5F5',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.82rem',
              py: 0.75,
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: '#F9FBF9',
            },
            '& .MuiDataGrid-toolbarContainer': {
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              gap: 1,
              px: 1.5,
              py: 1,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid rgba(0,0,0,0.06)',
            },
            ...sx,
          }}
          {...props}
        />
      </Box>
    </Card>
  );
}
