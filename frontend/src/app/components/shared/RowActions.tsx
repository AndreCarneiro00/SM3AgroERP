import { Stack, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  deleteConfirmMessage?: string;
  extraActions?: React.ReactNode;
  disabled?: boolean;
}

export function RowActions({
  onEdit,
  onDelete,
  deleteConfirmMessage = 'Confirmar exclusao?',
  extraActions,
  disabled = false,
}: RowActionsProps) {
  const handleDelete = () => {
    if (confirm(deleteConfirmMessage)) onDelete();
  };

  return (
    <Stack direction="row" spacing={0.25} justifyContent="center">
      {extraActions}
      <Tooltip title="Editar">
        <IconButton size="small" onClick={onEdit} disabled={disabled}>
          <EditIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Excluir">
        <IconButton
          size="small"
          color="error"
          onClick={handleDelete}
          disabled={disabled}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
