import { Stack, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Primary action label, e.g. "Nova Transação" */
  actionLabel: string;
  onAction: () => void;
  /** Optional content to the left of the button (filters, stats, etc.) */
  children?: ReactNode;
}

export function PageHeader({ actionLabel, onAction, children }: PageHeaderProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        {children}
      </Stack>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>
        {actionLabel}
      </Button>
    </Stack>
  );
}
