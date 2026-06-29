import { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import type { ReactNode } from 'react';
import { RowActions } from './RowActions';

export type TreeItem = {
  id: number;
  name: string;
  parent_id?: number;
  code?: string;
  active?: boolean;
};

interface TreeNodeProps<T extends TreeItem> {
  node: T;
  allNodes: T[];
  depth: number;
  onEdit: (n: T) => void;
  onDelete: (n: T) => void;
  onAddChild: (n: T) => void;
  getParentId?: (n: T) => number | undefined;
  renderExtraCells?: (n: T) => ReactNode;
}

export function TreeNode<T extends TreeItem>({
  node,
  allNodes,
  depth,
  onEdit,
  onDelete,
  onAddChild,
  getParentId,
  renderExtraCells,
}: TreeNodeProps<T>) {
  const [open, setOpen] = useState(depth < 2);
  const resolveParentId = (item: T) =>
    getParentId
      ? getParentId(item)
      : ((item as T & { parentId?: number }).parentId ?? item.parent_id);
  const children = allNodes.filter((item) => resolveParentId(item) === node.id);
  const hasChildren = children.length > 0;

  const rowBg =
    depth === 0 ? '#F8FBF8' : depth === 1 ? '#FAFAFA' : 'inherit';

  return (
    <>
      <TableRow sx={{ bgcolor: rowBg, '&:hover': { bgcolor: '#F0F7F0' } }}>
        <TableCell sx={{ pl: 1 + depth * 2.5, py: 0.75 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={() => setOpen((current) => !current)}
                sx={{ p: 0.25 }}
              >
                {open ? (
                  <ExpandMoreIcon sx={{ fontSize: 16 }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            ) : (
              <Box sx={{ width: 24 }} />
            )}
            <Typography variant="body2" fontWeight={depth < 2 ? 600 : 400}>
              {node.code && (
                <Box
                  component="span"
                  sx={{ color: '#888', mr: 0.75, fontSize: '0.76rem' }}
                >
                  {node.code}
                </Box>
              )}
              {node.name}
            </Typography>
            {'active' in node && !node.active && (
              <Chip
                label="Inativo"
                size="small"
                variant="outlined"
                color="default"
                sx={{ height: 16, fontSize: '0.66rem' }}
              />
            )}
          </Stack>
        </TableCell>

        {renderExtraCells?.(node)}

        <TableCell align="center" sx={{ py: 0.5 }}>
          <Stack direction="row" spacing={0.25} justifyContent="center">
            <Tooltip title="Adicionar filho">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onAddChild(node)}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <RowActions
              onEdit={() => onEdit(node)}
              onDelete={() => onDelete(node)}
            />
          </Stack>
        </TableCell>
      </TableRow>

      {hasChildren &&
        open &&
        children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            allNodes={allNodes}
            depth={depth + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            getParentId={getParentId}
            renderExtraCells={renderExtraCells}
          />
        ))}
    </>
  );
}
