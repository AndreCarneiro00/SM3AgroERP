import { HttpResponse, http } from 'msw';
import type { RequestHandler } from 'msw';
import { createProductsFixtures } from '../fixtures/products';
import type {
  BaseUnitDto,
  CreateBaseUnitDto,
  CreateProductDto,
  CreateProductFamilyDto,
  CreateUnitOfMeasureDto,
  ProductDto,
  ProductFamilyDto,
  UnitOfMeasureDto,
} from '../../../domains/products/api/dtos';

const fixtures = createProductsFixtures();

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

export const productHandlers: RequestHandler[] = [
  http.get(`/api/base-units`, () => {
    return HttpResponse.json(fixtures.baseUnits);
  }),
  http.post(`/api/base-units`, async ({ request }) => {
    const payload = (await request.json()) as CreateBaseUnitDto;
    const created: BaseUnitDto = {
      id: nextId(fixtures.baseUnits),
      name: payload.name,
    };
    fixtures.baseUnits.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(`/api/base-units/:id`, async ({ params, request }) => {
    const id = parseId(String(params.id));
    const payload = (await request.json()) as CreateBaseUnitDto;
    const index = fixtures.baseUnits.findIndex((item) => item.id === id);

    if (index < 0) return notFound();

    fixtures.baseUnits[index] = {
      ...fixtures.baseUnits[index],
      name: payload.name,
    };

    return HttpResponse.json(fixtures.baseUnits[index]);
  }),
  http.delete(`/api/base-units/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.baseUnits = fixtures.baseUnits.filter((item) => item.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/product-families`, () => {
    return HttpResponse.json(fixtures.productFamilies);
  }),
  http.post(
    `/api/product-families`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateProductFamilyDto;
      const created: ProductFamilyDto = {
        id: nextId(fixtures.productFamilies),
        name: payload.name,
      };
      fixtures.productFamilies.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/product-families/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateProductFamilyDto;
      const index = fixtures.productFamilies.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      fixtures.productFamilies[index] = {
        ...fixtures.productFamilies[index],
        name: payload.name,
      };

      return HttpResponse.json(fixtures.productFamilies[index]);
    },
  ),
  http.delete(`/api/product-families/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.productFamilies = fixtures.productFamilies.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/units-of-measure`, () => {
    return HttpResponse.json(fixtures.unitsOfMeasure);
  }),
  http.post(
    `/api/units-of-measure`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateUnitOfMeasureDto;
      const created: UnitOfMeasureDto = {
        id: nextId(fixtures.unitsOfMeasure),
        name: payload.name,
        baseUnitId: payload.baseUnitId,
        conversionFactor: payload.conversionFactor,
      };
      fixtures.unitsOfMeasure.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/units-of-measure/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateUnitOfMeasureDto;
      const index = fixtures.unitsOfMeasure.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      fixtures.unitsOfMeasure[index] = {
        ...fixtures.unitsOfMeasure[index],
        name: payload.name,
        baseUnitId: payload.baseUnitId,
        conversionFactor: payload.conversionFactor,
      };

      return HttpResponse.json(fixtures.unitsOfMeasure[index]);
    },
  ),
  http.delete(`/api/units-of-measure/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.unitsOfMeasure = fixtures.unitsOfMeasure.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/products`, () => {
    return HttpResponse.json(fixtures.products);
  }),
  http.post(`/api/products`, async ({ request }) => {
    const payload = (await request.json()) as CreateProductDto;
    const created: ProductDto = {
      id: nextId(fixtures.products),
      name: payload.name,
      unitId: payload.unitId,
      productFamilyId: payload.productFamilyId,
      productType: payload.productType,
      active: payload.active,
    };
    fixtures.products.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(`/api/products/:id`, async ({ params, request }) => {
    const id = parseId(String(params.id));
    const payload = (await request.json()) as CreateProductDto;
    const index = fixtures.products.findIndex((item) => item.id === id);

    if (index < 0) return notFound();

    fixtures.products[index] = {
      ...fixtures.products[index],
      name: payload.name,
      unitId: payload.unitId,
      productFamilyId: payload.productFamilyId,
      productType: payload.productType,
      active: payload.active,
    };

    return HttpResponse.json(fixtures.products[index]);
  }),
  http.delete(`/api/products/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.products = fixtures.products.filter((item) => item.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
