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

export const productFixtures = createProductsFixtures();

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
    return HttpResponse.json(productFixtures.baseUnits);
  }),
  http.post(`/api/base-units`, async ({ request }) => {
    const payload = (await request.json()) as CreateBaseUnitDto;
    const created: BaseUnitDto = {
      id: nextId(productFixtures.baseUnits),
      name: payload.name,
    };
    productFixtures.baseUnits.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(`/api/base-units/:id`, async ({ params, request }) => {
    const id = parseId(String(params.id));
    const payload = (await request.json()) as CreateBaseUnitDto;
    const index = productFixtures.baseUnits.findIndex((item) => item.id === id);

    if (index < 0) return notFound();

    productFixtures.baseUnits[index] = {
      ...productFixtures.baseUnits[index],
      name: payload.name,
    };

    return HttpResponse.json(productFixtures.baseUnits[index]);
  }),
  http.delete(`/api/base-units/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    productFixtures.baseUnits = productFixtures.baseUnits.filter((item) => item.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/product-families`, () => {
    return HttpResponse.json(productFixtures.productFamilies);
  }),
  http.post(
    `/api/product-families`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateProductFamilyDto;
      const created: ProductFamilyDto = {
        id: nextId(productFixtures.productFamilies),
        name: payload.name,
      };
      productFixtures.productFamilies.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/product-families/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateProductFamilyDto;
      const index = productFixtures.productFamilies.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      productFixtures.productFamilies[index] = {
        ...productFixtures.productFamilies[index],
        name: payload.name,
      };

      return HttpResponse.json(productFixtures.productFamilies[index]);
    },
  ),
  http.delete(`/api/product-families/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    productFixtures.productFamilies = productFixtures.productFamilies.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/units-of-measure`, () => {
    return HttpResponse.json(productFixtures.unitsOfMeasure);
  }),
  http.post(
    `/api/units-of-measure`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateUnitOfMeasureDto;
      const created: UnitOfMeasureDto = {
        id: nextId(productFixtures.unitsOfMeasure),
        name: payload.name,
        baseUnitId: payload.baseUnitId,
        conversionFactor: payload.conversionFactor,
      };
      productFixtures.unitsOfMeasure.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/units-of-measure/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateUnitOfMeasureDto;
      const index = productFixtures.unitsOfMeasure.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      productFixtures.unitsOfMeasure[index] = {
        ...productFixtures.unitsOfMeasure[index],
        name: payload.name,
        baseUnitId: payload.baseUnitId,
        conversionFactor: payload.conversionFactor,
      };

      return HttpResponse.json(productFixtures.unitsOfMeasure[index]);
    },
  ),
  http.delete(`/api/units-of-measure/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    productFixtures.unitsOfMeasure = productFixtures.unitsOfMeasure.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/products`, () => {
    return HttpResponse.json(productFixtures.products);
  }),
  http.post(`/api/products`, async ({ request }) => {
    const payload = (await request.json()) as CreateProductDto;
    const created: ProductDto = {
      id: nextId(productFixtures.products),
      name: payload.name,
      unitId: payload.unitId,
      productFamilyId: payload.productFamilyId,
      productType: payload.productType,
      active: payload.active,
      hasStock: payload.hasStock,
      stockControlStartDate: payload.stockControlStartDate,
    };
    productFixtures.products.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(`/api/products/:id`, async ({ params, request }) => {
    const id = parseId(String(params.id));
    const payload = (await request.json()) as CreateProductDto;
    const index = productFixtures.products.findIndex((item) => item.id === id);

    if (index < 0) return notFound();

    productFixtures.products[index] = {
      ...productFixtures.products[index],
      name: payload.name,
      unitId: payload.unitId,
      productFamilyId: payload.productFamilyId,
      productType: payload.productType,
      active: payload.active,
      hasStock: payload.hasStock,
      stockControlStartDate: payload.stockControlStartDate,
    };

    return HttpResponse.json(productFixtures.products[index]);
  }),
  http.delete(`/api/products/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    productFixtures.products = productFixtures.products.filter((item) => item.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
