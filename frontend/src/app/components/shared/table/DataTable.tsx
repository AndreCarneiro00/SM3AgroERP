import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { EmptyTableRow } from '../EmptyTableRow';
import { ResponsiveTableFrame } from './ResponsiveTableFrame';

export interface TableColumn<T> {
  id?: string;
  label: ReactNode;
  render: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  nowrap?: boolean;
  cellSx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
}

interface DataTableProps<T> {
  items: T[];
  columns: TableColumn<T>[];
  getRowId: (item: T) => number | string;
  emptyMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
  renderActions?: (item: T) => ReactNode;
  actionsHeader?: ReactNode;
  minWidth?: number | string;
  maxHeight?: number | string;
  stickyHeader?: boolean;
  actionsSticky?: boolean;
  ariaLabel?: string;
  rowSx?: SxProps<Theme>;
}

function sxArray(sx?: SxProps<Theme>) {
  if (!sx) return [];

  return Array.isArray(sx) ? sx : [sx];
}

function getColumnKey<T>(column: TableColumn<T>, index: number) {
  if (column.id) return column.id;

  return typeof column.label === 'string' ? column.label : String(index);
}

function getCellSizeSx<T>(column: TableColumn<T>): SxProps<Theme> {
  return {
    width: column.width,
    minWidth: column.minWidth,
    maxWidth: column.maxWidth,
    whiteSpace: column.nowrap ? 'nowrap' : undefined,
    overflow: column.maxWidth ? 'hidden' : undefined,
    textOverflow: column.maxWidth ? 'ellipsis' : undefined,
  };
}

function getActionsSx(sticky?: boolean): SxProps<Theme> {
  if (!sticky) {
    return { whiteSpace: 'nowrap' };
  }

  return {
    position: 'sticky',
    right: 0,
    zIndex: 2,
    bgcolor: 'background.paper',
    whiteSpace: 'nowrap',
    boxShadow: '-6px 0 10px rgba(15, 23, 42, 0.06)',
  };
}

function getActionsHeaderSx(sticky?: boolean): SxProps<Theme> {
  if (!sticky) {
    return { whiteSpace: 'nowrap' };
  }

  return {
    position: 'sticky',
    right: 0,
    zIndex: 3,
    backgroundColor: '#F5F5F5',
    whiteSpace: 'nowrap',
    boxShadow: '-6px 0 10px rgba(15, 23, 42, 0.06)',
  };
}

export function DataTable<T>({
  items,
  columns,
  getRowId,
  emptyMessage = 'Nenhum registro encontrado.',
  loadingMessage = 'Carregando registros...',
  isLoading = false,
  renderActions,
  actionsHeader = 'Acoes',
  minWidth = 640,
  maxHeight,
  stickyHeader,
  actionsSticky = false,
  ariaLabel,
  rowSx,
}: DataTableProps<T>) {
  const colSpan = columns.length + (renderActions ? 1 : 0);
  const showLoading = isLoading && items.length === 0;
  const showEmpty = !isLoading && items.length === 0;

  return (
    <ResponsiveTableFrame
      minWidth={minWidth}
      maxHeight={maxHeight}
      stickyHeader={stickyHeader}
      ariaLabel={ariaLabel}
    >
      <TableHead>
        <TableRow>
          {columns.map((column, index) => (
            <TableCell
              key={getColumnKey(column, index)}
              align={column.align}
              sx={[getCellSizeSx(column), ...sxArray(column.headerSx)]}
            >
              {column.label}
            </TableCell>
          ))}
          {renderActions && (
            <TableCell align="center" sx={getActionsHeaderSx(actionsSticky)}>
              {actionsHeader}
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => (
          <TableRow key={getRowId(item)} sx={rowSx}>
            {columns.map((column, index) => (
              <TableCell
                key={getColumnKey(column, index)}
                align={column.align}
                sx={[getCellSizeSx(column), ...sxArray(column.cellSx)]}
              >
                {column.render(item)}
              </TableCell>
            ))}
            {renderActions && (
              <TableCell align="center" sx={getActionsSx(actionsSticky)}>
                {renderActions(item)}
              </TableCell>
            )}
          </TableRow>
        ))}
        {showLoading && <EmptyTableRow colSpan={colSpan} message={loadingMessage} />}
        {showEmpty && <EmptyTableRow colSpan={colSpan} message={emptyMessage} />}
      </TableBody>
    </ResponsiveTableFrame>
  );
}
