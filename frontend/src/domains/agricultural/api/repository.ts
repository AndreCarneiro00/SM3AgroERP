import { httpListRequest, httpRequest } from '../../../core/http/client';
import {
  resolveResourceItemPath,
  resolveResourcePath,
} from '../../../core/http/resourcePath';
import type {
  CreateCutDto,
  CreateFieldDto,
  CreateFieldOperationDto,
  CreateFieldOperationItemDto,
  CreateFieldOperationMachineDto,
  CreateMachineDto,
  CreateProductionBatchDto,
  CutDto,
  FieldDto,
  FieldOperationDto,
  FieldOperationItemDto,
  FieldOperationMachineDto,
  MachineDto,
  ProductionBatchDto,
  UpdateCutDto,
  UpdateFieldDto,
  UpdateFieldOperationDto,
  UpdateFieldOperationItemDto,
  UpdateFieldOperationMachineDto,
  UpdateMachineDto,
  UpdateProductionBatchDto,
} from './dtos';

const FIELDS_API_BASE = {
  mock: '/api/fields',
  api: '/field',
} as const;
const MACHINES_API_BASE = {
  mock: '/api/machines',
  api: '/machine',
} as const;
const CUTS_API_BASE = {
  mock: '/api/cuts',
  api: '/cuts',
} as const;
const FIELD_OPERATIONS_API_BASE = {
  mock: '/api/field-operations',
  api: '/field-operations',
} as const;
const FIELD_OPERATION_MACHINES_API_BASE = {
  mock: '/api/field-operation-machines',
  api: '/field-operation-machines',
} as const;
const FIELD_OPERATION_ITEMS_API_BASE = {
  mock: '/api/field-operation-items',
  api: '/field-operation-items',
} as const;
const PRODUCTION_BATCHES_API_BASE = {
  mock: '/api/production-batches',
  api: '/production-batches',
} as const;

export const agriculturalRepository = {
  listFields: () =>
    httpListRequest<FieldDto>(resolveResourcePath(FIELDS_API_BASE)),
  createField: (payload: CreateFieldDto) =>
    httpRequest<FieldDto>(resolveResourcePath(FIELDS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateField: (id: number, payload: UpdateFieldDto) =>
    httpRequest<FieldDto>(resolveResourceItemPath(FIELDS_API_BASE, id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteField: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(FIELDS_API_BASE, id), {
      method: 'DELETE',
    }),

  listMachines: () =>
    httpListRequest<MachineDto>(resolveResourcePath(MACHINES_API_BASE)),
  createMachine: (payload: CreateMachineDto) =>
    httpRequest<MachineDto>(resolveResourcePath(MACHINES_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMachine: (id: number, payload: UpdateMachineDto) =>
    httpRequest<MachineDto>(resolveResourceItemPath(MACHINES_API_BASE, id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteMachine: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(MACHINES_API_BASE, id), {
      method: 'DELETE',
    }),

  listCuts: () => httpListRequest<CutDto>(resolveResourcePath(CUTS_API_BASE)),
  createCut: (payload: CreateCutDto) =>
    httpRequest<CutDto>(resolveResourcePath(CUTS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCut: (id: number, payload: UpdateCutDto) =>
    httpRequest<CutDto>(resolveResourceItemPath(CUTS_API_BASE, id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteCut: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(CUTS_API_BASE, id), {
      method: 'DELETE',
    }),

  listFieldOperations: () =>
    httpListRequest<FieldOperationDto>(resolveResourcePath(FIELD_OPERATIONS_API_BASE)),
  createFieldOperation: (payload: CreateFieldOperationDto) =>
    httpRequest<FieldOperationDto>(resolveResourcePath(FIELD_OPERATIONS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateFieldOperation: (id: number, payload: UpdateFieldOperationDto) =>
    httpRequest<FieldOperationDto>(
      resolveResourceItemPath(FIELD_OPERATIONS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteFieldOperation: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(FIELD_OPERATIONS_API_BASE, id), {
      method: 'DELETE',
    }),

  listFieldOperationMachines: () =>
    httpListRequest<FieldOperationMachineDto>(
      resolveResourcePath(FIELD_OPERATION_MACHINES_API_BASE),
    ),
  createFieldOperationMachine: (payload: CreateFieldOperationMachineDto) =>
    httpRequest<FieldOperationMachineDto>(
      resolveResourcePath(FIELD_OPERATION_MACHINES_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateFieldOperationMachine: (
    id: number,
    payload: UpdateFieldOperationMachineDto,
  ) =>
    httpRequest<FieldOperationMachineDto>(
      resolveResourceItemPath(FIELD_OPERATION_MACHINES_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteFieldOperationMachine: (id: number) =>
    httpRequest<void>(
      resolveResourceItemPath(FIELD_OPERATION_MACHINES_API_BASE, id),
      {
        method: 'DELETE',
      },
    ),

  listFieldOperationItems: () =>
    httpListRequest<FieldOperationItemDto>(
      resolveResourcePath(FIELD_OPERATION_ITEMS_API_BASE),
    ),
  createFieldOperationItem: (payload: CreateFieldOperationItemDto) =>
    httpRequest<FieldOperationItemDto>(
      resolveResourcePath(FIELD_OPERATION_ITEMS_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateFieldOperationItem: (
    id: number,
    payload: UpdateFieldOperationItemDto,
  ) =>
    httpRequest<FieldOperationItemDto>(
      resolveResourceItemPath(FIELD_OPERATION_ITEMS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteFieldOperationItem: (id: number) =>
    httpRequest<void>(
      resolveResourceItemPath(FIELD_OPERATION_ITEMS_API_BASE, id),
      {
        method: 'DELETE',
      },
    ),

  listProductionBatches: () =>
    httpListRequest<ProductionBatchDto>(
      resolveResourcePath(PRODUCTION_BATCHES_API_BASE),
    ),
  createProductionBatch: (payload: CreateProductionBatchDto) =>
    httpRequest<ProductionBatchDto>(
      resolveResourcePath(PRODUCTION_BATCHES_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateProductionBatch: (id: number, payload: UpdateProductionBatchDto) =>
    httpRequest<ProductionBatchDto>(
      resolveResourceItemPath(PRODUCTION_BATCHES_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteProductionBatch: (id: number) =>
    httpRequest<void>(
      resolveResourceItemPath(PRODUCTION_BATCHES_API_BASE, id),
      {
        method: 'DELETE',
      },
    ),
};
