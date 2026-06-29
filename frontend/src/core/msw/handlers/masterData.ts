import { HttpResponse, http } from 'msw';
import type { RequestHandler } from 'msw';
import { createMasterDataFixtures } from '../fixtures/masterData';
import type {
  ActivityGroupDto,
  AdjustmentRootCauseDto,
  CounterpartyDto,
  CounterpartyTypeDto,
  CreateActivityGroupDto,
  CreateAdjustmentRootCauseDto,
  CreateCounterpartyDto,
  CreateCounterpartyTypeDto,
  CreateDocumentTypeDto,
  CreateSegmentDto,
  DocumentTypeDto,
  SegmentDto,
} from '../../../domains/master-data/api/dtos';

const fixtures = createMasterDataFixtures();

function nextId(items: Array<{ id: number }>) {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function parseId(rawId?: string) {
  if (!rawId) return undefined;
  const parsed = Number(rawId);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function notFound() {
  return HttpResponse.json({ message: 'Not found' }, { status: 404 });
}

export const masterDataHandlers: RequestHandler[] = [
  http.get(`/api/counterparty-types`, () => {
    return HttpResponse.json(fixtures.counterpartyTypes);
  }),
  http.post(`/api/counterparty-types`, async ({ request }) => {
    const payload = (await request.json()) as CreateCounterpartyTypeDto;
    const created: CounterpartyTypeDto = {
      id: nextId(fixtures.counterpartyTypes),
      name: payload.name,
      description: payload.description,
      active: payload.active,
    };
    fixtures.counterpartyTypes.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/counterparty-types/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateCounterpartyTypeDto;
      const index = fixtures.counterpartyTypes.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      fixtures.counterpartyTypes[index] = {
        ...fixtures.counterpartyTypes[index],
        name: payload.name,
        description: payload.description,
        active: payload.active,
      };

      return HttpResponse.json(fixtures.counterpartyTypes[index]);
    },
  ),
  http.delete(`/api/counterparty-types/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.counterpartyTypes = fixtures.counterpartyTypes.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/segments`, () => {
    return HttpResponse.json(fixtures.segments);
  }),
  http.post(`/api/segments`, async ({ request }) => {
    const payload = (await request.json()) as CreateSegmentDto;
    const created: SegmentDto = {
      id: nextId(fixtures.segments),
      name: payload.name,
    };
    fixtures.segments.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(`/api/segments/:id`, async ({ params, request }) => {
    const id = parseId(String(params.id));
    const payload = (await request.json()) as CreateSegmentDto;
    const index = fixtures.segments.findIndex((item) => item.id === id);

    if (index < 0) return notFound();

    fixtures.segments[index] = {
      ...fixtures.segments[index],
      name: payload.name,
    };

    return HttpResponse.json(fixtures.segments[index]);
  }),
  http.delete(`/api/segments/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.segments = fixtures.segments.filter((item) => item.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/activity-groups`, () => {
    return HttpResponse.json(fixtures.activityGroups);
  }),
  http.post(`/api/activity-groups`, async ({ request }) => {
    const payload = (await request.json()) as CreateActivityGroupDto;
    const created: ActivityGroupDto = {
      id: nextId(fixtures.activityGroups),
      name: payload.name,
    };
    fixtures.activityGroups.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/activity-groups/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateActivityGroupDto;
      const index = fixtures.activityGroups.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      fixtures.activityGroups[index] = {
        ...fixtures.activityGroups[index],
        name: payload.name,
      };

      return HttpResponse.json(fixtures.activityGroups[index]);
    },
  ),
  http.delete(`/api/activity-groups/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.activityGroups = fixtures.activityGroups.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/document-types`, () => {
    return HttpResponse.json(fixtures.documentTypes);
  }),
  http.post(`/api/document-types`, async ({ request }) => {
    const payload = (await request.json()) as CreateDocumentTypeDto;
    const created: DocumentTypeDto = {
      id: nextId(fixtures.documentTypes),
      name: payload.name,
    };
    fixtures.documentTypes.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/document-types/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateDocumentTypeDto;
      const index = fixtures.documentTypes.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      fixtures.documentTypes[index] = {
        ...fixtures.documentTypes[index],
        name: payload.name,
      };

      return HttpResponse.json(fixtures.documentTypes[index]);
    },
  ),
  http.delete(`/api/document-types/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.documentTypes = fixtures.documentTypes.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/adjustment-root-causes`, () => {
    return HttpResponse.json(fixtures.adjustmentRootCauses);
  }),
  http.post(
    `/api/adjustment-root-causes`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateAdjustmentRootCauseDto;
      const created: AdjustmentRootCauseDto = {
        id: nextId(fixtures.adjustmentRootCauses),
        name: payload.name,
      };
      fixtures.adjustmentRootCauses.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/adjustment-root-causes/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateAdjustmentRootCauseDto;
      const index = fixtures.adjustmentRootCauses.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      fixtures.adjustmentRootCauses[index] = {
        ...fixtures.adjustmentRootCauses[index],
        name: payload.name,
      };

      return HttpResponse.json(fixtures.adjustmentRootCauses[index]);
    },
  ),
  http.delete(
    `/api/adjustment-root-causes/:id`,
    ({ params }) => {
      const id = parseId(String(params.id));
      fixtures.adjustmentRootCauses = fixtures.adjustmentRootCauses.filter(
        (item) => item.id !== id,
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.get(`/api/counterparties`, () => {
    return HttpResponse.json(fixtures.counterparties);
  }),
  http.post(`/api/counterparties`, async ({ request }) => {
    const payload = (await request.json()) as CreateCounterpartyDto;
    const created: CounterpartyDto = {
      id: nextId(fixtures.counterparties),
      counterpartyTypeId: payload.counterpartyTypeId,
      legalName: payload.legalName,
      tradeName: payload.tradeName,
      city: payload.city,
      state: payload.state,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      document: payload.document,
      documentType: payload.documentType,
      segmentId: payload.segmentId,
      active: payload.active,
    };
    fixtures.counterparties.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/counterparties/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateCounterpartyDto;
      const index = fixtures.counterparties.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      fixtures.counterparties[index] = {
        ...fixtures.counterparties[index],
        counterpartyTypeId: payload.counterpartyTypeId,
        legalName: payload.legalName,
        tradeName: payload.tradeName,
        city: payload.city,
        state: payload.state,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        document: payload.document,
        documentType: payload.documentType,
        segmentId: payload.segmentId,
        active: payload.active,
      };

      return HttpResponse.json(fixtures.counterparties[index]);
    },
  ),
  http.delete(`/api/counterparties/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.counterparties = fixtures.counterparties.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),
];
