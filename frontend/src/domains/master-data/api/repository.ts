import { httpListRequest, httpRequest } from '../../../core/http/client';
import {
  resolveResourceItemPath,
  resolveResourcePath,
} from '../../../core/http/resourcePath';
import type {
  ActivityGroupDto,
  CounterpartyDto,
  CounterpartyTypeDto,
  CreateActivityGroupDto,
  CreateAdjustmentRootCauseDto,
  CreateCounterpartyDto,
  CreateCounterpartyTypeDto,
  CreateDocumentTypeDto,
  CreateSegmentDto,
  DocumentTypeDto,
  AdjustmentRootCauseDto,
  SegmentDto,
  UpdateActivityGroupDto,
  UpdateAdjustmentRootCauseDto,
  UpdateCounterpartyDto,
  UpdateCounterpartyTypeDto,
  UpdateDocumentTypeDto,
  UpdateSegmentDto,
} from './dtos';

const COUNTERPARTIES_API_BASE = {
  mock: '/api/counterparties',
  api: '/counterparty',
} as const;
const COUNTERPARTY_TYPES_API_BASE = {
  mock: '/api/counterparty-types',
  api: '/counterparty-type',
} as const;
const SEGMENTS_API_BASE = {
  mock: '/api/segments',
  api: '/segment',
} as const;
const ACTIVITY_GROUPS_API_BASE = {
  mock: '/api/activity-groups',
  api: '/activity-group',
} as const;
const DOCUMENT_TYPES_API_BASE = {
  mock: '/api/document-types',
  api: '/document-type',
} as const;
const ADJUSTMENT_ROOT_CAUSES_API_BASE = {
  mock: '/api/adjustment-root-causes',
  api: '/adjustment-root-cause',
} as const;

export const masterDataRepository = {
  listCounterpartyTypes: () =>
    httpListRequest<CounterpartyTypeDto>(
      resolveResourcePath(COUNTERPARTY_TYPES_API_BASE),
    ),
  createCounterpartyType: (payload: CreateCounterpartyTypeDto) =>
    httpRequest<CounterpartyTypeDto>(
      resolveResourcePath(COUNTERPARTY_TYPES_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateCounterpartyType: (id: number, payload: UpdateCounterpartyTypeDto) =>
    httpRequest<CounterpartyTypeDto>(
      resolveResourceItemPath(COUNTERPARTY_TYPES_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteCounterpartyType: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(COUNTERPARTY_TYPES_API_BASE, id), {
      method: 'DELETE',
    }),

  listSegments: () =>
    httpListRequest<SegmentDto>(resolveResourcePath(SEGMENTS_API_BASE)),
  createSegment: (payload: CreateSegmentDto) =>
    httpRequest<SegmentDto>(resolveResourcePath(SEGMENTS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateSegment: (id: number, payload: UpdateSegmentDto) =>
    httpRequest<SegmentDto>(resolveResourceItemPath(SEGMENTS_API_BASE, id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteSegment: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(SEGMENTS_API_BASE, id), {
      method: 'DELETE',
    }),

  listActivityGroups: () =>
    httpListRequest<ActivityGroupDto>(
      resolveResourcePath(ACTIVITY_GROUPS_API_BASE),
    ),
  createActivityGroup: (payload: CreateActivityGroupDto) =>
    httpRequest<ActivityGroupDto>(resolveResourcePath(ACTIVITY_GROUPS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateActivityGroup: (id: number, payload: UpdateActivityGroupDto) =>
    httpRequest<ActivityGroupDto>(
      resolveResourceItemPath(ACTIVITY_GROUPS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteActivityGroup: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(ACTIVITY_GROUPS_API_BASE, id), {
      method: 'DELETE',
    }),

  listDocumentTypes: () =>
    httpListRequest<DocumentTypeDto>(
      resolveResourcePath(DOCUMENT_TYPES_API_BASE),
    ),
  createDocumentType: (payload: CreateDocumentTypeDto) =>
    httpRequest<DocumentTypeDto>(resolveResourcePath(DOCUMENT_TYPES_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateDocumentType: (id: number, payload: UpdateDocumentTypeDto) =>
    httpRequest<DocumentTypeDto>(
      resolveResourceItemPath(DOCUMENT_TYPES_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteDocumentType: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(DOCUMENT_TYPES_API_BASE, id), {
      method: 'DELETE',
    }),

  listAdjustmentRootCauses: () =>
    httpListRequest<AdjustmentRootCauseDto>(
      resolveResourcePath(ADJUSTMENT_ROOT_CAUSES_API_BASE),
    ),
  createAdjustmentRootCause: (payload: CreateAdjustmentRootCauseDto) =>
    httpRequest<AdjustmentRootCauseDto>(
      resolveResourcePath(ADJUSTMENT_ROOT_CAUSES_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateAdjustmentRootCause: (
    id: number,
    payload: UpdateAdjustmentRootCauseDto,
  ) =>
    httpRequest<AdjustmentRootCauseDto>(
      resolveResourceItemPath(ADJUSTMENT_ROOT_CAUSES_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteAdjustmentRootCause: (id: number) =>
    httpRequest<void>(
      resolveResourceItemPath(ADJUSTMENT_ROOT_CAUSES_API_BASE, id),
      {
        method: 'DELETE',
      },
    ),

  listCounterparties: () =>
    httpListRequest<CounterpartyDto>(
      resolveResourcePath(COUNTERPARTIES_API_BASE),
    ),
  createCounterparty: (payload: CreateCounterpartyDto) =>
    httpRequest<CounterpartyDto>(resolveResourcePath(COUNTERPARTIES_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCounterparty: (id: number, payload: UpdateCounterpartyDto) =>
    httpRequest<CounterpartyDto>(
      resolveResourceItemPath(COUNTERPARTIES_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteCounterparty: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(COUNTERPARTIES_API_BASE, id), {
      method: 'DELETE',
    }),
};
