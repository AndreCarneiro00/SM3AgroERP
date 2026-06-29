import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { CounterpartyType } from '../../../domains/master-data/model/entities';
import {
  useMasterDataCatalogData,
  useMasterDataMutations,
} from '../../../domains/master-data/ui/hooks';
import { CounterpartiesTab } from './CounterpartiesTab';
import { SimpleListTab } from './SimpleListTab';

function CounterpartyTypesTab() {
  const { counterpartyTypes, isLoading } = useMasterDataCatalogData();
  const {
    createCounterpartyType,
    deleteCounterpartyType,
    updateCounterpartyType,
  } = useMasterDataMutations();

  return (
    <SimpleListTab
      items={counterpartyTypes}
      entityLabel="Tipo de Contraparte"
      extraColumns={[
        {
          key: 'description' as keyof CounterpartyType,
          label: 'Descricao',
        },
        {
          key: 'active' as keyof CounterpartyType,
          label: 'Status',
          render: (item) => (item.active ? 'Ativo' : 'Inativo'),
        },
      ]}
      createInitial={() => ({ active: true, description: '' })}
      ExtraFields={({ form, setForm }) => (
        <>
          <TextField
            label="Descricao"
            value={String((form as Partial<CounterpartyType>).description ?? '')}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value || undefined,
              }))
            }
            fullWidth
          />
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={(form as Partial<CounterpartyType>).active === false ? 'inativo' : 'ativo'}
              label="Status"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  active: event.target.value === 'ativo',
                }))
              }
            >
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </Select>
          </FormControl>
        </>
      )}
      onSave={async (editing, form) => {
        const input = {
          name: String(form.name ?? '').trim(),
          description:
            String((form as Partial<CounterpartyType>).description ?? '').trim() ||
            undefined,
          active: (form as Partial<CounterpartyType>).active !== false,
        };

        if (editing) {
          await updateCounterpartyType.mutateAsync({ id: editing.id, input });
        } else {
          await createCounterpartyType.mutateAsync(input);
        }
      }}
      onDelete={async (item) => {
        await deleteCounterpartyType.mutateAsync(item.id);
      }}
      saving={createCounterpartyType.isPending || updateCounterpartyType.isPending}
      isLoading={isLoading}
    />
  );
}

interface Props {
  tab:
    | 'counterparties'
    | 'counterparty-types'
    | 'segments'
    | 'activity-groups'
    | 'document-types'
    | 'adjustment-root-causes';
}

export function MasterDataModule({ tab }: Props) {
  const {
    segments,
    activityGroups,
    documentTypes,
    adjustmentRootCauses,
    isLoading,
  } = useMasterDataCatalogData();
  const {
    createSegment,
    updateSegment,
    deleteSegment,
    createActivityGroup,
    updateActivityGroup,
    deleteActivityGroup,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
    createAdjustmentRootCause,
    updateAdjustmentRootCause,
    deleteAdjustmentRootCause,
  } = useMasterDataMutations();

  if (tab === 'counterparties') return <CounterpartiesTab />;
  if (tab === 'counterparty-types') return <CounterpartyTypesTab />;

  if (tab === 'segments') {
    return (
      <SimpleListTab
        items={segments}
        entityLabel="Segmento"
        onSave={async (editing, form) => {
          const input = { name: String(form.name ?? '').trim() };
          if (editing) {
            await updateSegment.mutateAsync({ id: editing.id, input });
          } else {
            await createSegment.mutateAsync(input);
          }
        }}
        onDelete={async (item) => {
          await deleteSegment.mutateAsync(item.id);
        }}
        saving={createSegment.isPending || updateSegment.isPending}
        isLoading={isLoading}
      />
    );
  }

  if (tab === 'activity-groups') {
    return (
      <SimpleListTab
        items={activityGroups}
        entityLabel="Grupo de Atividade"
        onSave={async (editing, form) => {
          const input = { name: String(form.name ?? '').trim() };
          if (editing) {
            await updateActivityGroup.mutateAsync({ id: editing.id, input });
          } else {
            await createActivityGroup.mutateAsync(input);
          }
        }}
        onDelete={async (item) => {
          await deleteActivityGroup.mutateAsync(item.id);
        }}
        saving={createActivityGroup.isPending || updateActivityGroup.isPending}
        isLoading={isLoading}
      />
    );
  }

  if (tab === 'adjustment-root-causes') {
    return (
      <SimpleListTab
        items={adjustmentRootCauses}
        entityLabel="Causa Raiz de Ajuste"
        onSave={async (editing, form) => {
          const input = { name: String(form.name ?? '').trim() };
          if (editing) {
            await updateAdjustmentRootCause.mutateAsync({
              id: editing.id,
              input,
            });
          } else {
            await createAdjustmentRootCause.mutateAsync(input);
          }
        }}
        onDelete={async (item) => {
          await deleteAdjustmentRootCause.mutateAsync(item.id);
        }}
        saving={
          createAdjustmentRootCause.isPending ||
          updateAdjustmentRootCause.isPending
        }
        isLoading={isLoading}
      />
    );
  }

  return (
    <SimpleListTab
      items={documentTypes}
      entityLabel="Tipo de Documento"
      onSave={async (editing, form) => {
        const input = { name: String(form.name ?? '').trim() };
        if (editing) {
          await updateDocumentType.mutateAsync({ id: editing.id, input });
        } else {
          await createDocumentType.mutateAsync(input);
        }
      }}
      onDelete={async (item) => {
        await deleteDocumentType.mutateAsync(item.id);
      }}
      saving={createDocumentType.isPending || updateDocumentType.isPending}
      isLoading={isLoading}
    />
  );
}
