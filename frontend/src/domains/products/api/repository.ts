import { httpListRequest, httpRequest } from '../../../core/http/client';
import {
  resolveResourceItemPath,
  resolveResourcePath,
} from '../../../core/http/resourcePath';
import type {
  BaseUnitDto,
  CreateBaseUnitDto,
  CreateProductDto,
  CreateProductFamilyDto,
  CreateUnitOfMeasureDto,
  ProductDto,
  ProductFamilyDto,
  UnitOfMeasureDto,
  UpdateBaseUnitDto,
  UpdateProductDto,
  UpdateProductFamilyDto,
  UpdateUnitOfMeasureDto,
} from './dtos';

const PRODUCTS_API_BASE = {
  mock: '/api/products',
  api: '/product',
} as const;
const BASE_UNITS_API_BASE = {
  mock: '/api/base-units',
  api: '/base-unit',
} as const;
const PRODUCT_FAMILIES_API_BASE = {
  mock: '/api/product-families',
  api: '/product-family',
} as const;
const UNITS_OF_MEASURE_API_BASE = {
  mock: '/api/units-of-measure',
  api: '/unit-of-measure',
} as const;

export const productsRepository = {
  listBaseUnits: () =>
    httpListRequest<BaseUnitDto>(resolveResourcePath(BASE_UNITS_API_BASE)),
  createBaseUnit: (payload: CreateBaseUnitDto) =>
    httpRequest<BaseUnitDto>(resolveResourcePath(BASE_UNITS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateBaseUnit: (id: number, payload: UpdateBaseUnitDto) =>
    httpRequest<BaseUnitDto>(resolveResourceItemPath(BASE_UNITS_API_BASE, id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteBaseUnit: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(BASE_UNITS_API_BASE, id), {
      method: 'DELETE',
    }),

  listProductFamilies: () =>
    httpListRequest<ProductFamilyDto>(
      resolveResourcePath(PRODUCT_FAMILIES_API_BASE),
    ),
  createProductFamily: (payload: CreateProductFamilyDto) =>
    httpRequest<ProductFamilyDto>(resolveResourcePath(PRODUCT_FAMILIES_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProductFamily: (id: number, payload: UpdateProductFamilyDto) =>
    httpRequest<ProductFamilyDto>(
      resolveResourceItemPath(PRODUCT_FAMILIES_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteProductFamily: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(PRODUCT_FAMILIES_API_BASE, id), {
      method: 'DELETE',
    }),

  listUnitsOfMeasure: () =>
    httpListRequest<UnitOfMeasureDto>(
      resolveResourcePath(UNITS_OF_MEASURE_API_BASE),
    ),
  createUnitOfMeasure: (payload: CreateUnitOfMeasureDto) =>
    httpRequest<UnitOfMeasureDto>(resolveResourcePath(UNITS_OF_MEASURE_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateUnitOfMeasure: (id: number, payload: UpdateUnitOfMeasureDto) =>
    httpRequest<UnitOfMeasureDto>(
      resolveResourceItemPath(UNITS_OF_MEASURE_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteUnitOfMeasure: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(UNITS_OF_MEASURE_API_BASE, id), {
      method: 'DELETE',
    }),

  listProducts: () =>
    httpListRequest<ProductDto>(resolveResourcePath(PRODUCTS_API_BASE)),
  createProduct: (payload: CreateProductDto) =>
    httpRequest<ProductDto>(resolveResourcePath(PRODUCTS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProduct: (id: number, payload: UpdateProductDto) =>
    httpRequest<ProductDto>(resolveResourceItemPath(PRODUCTS_API_BASE, id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(PRODUCTS_API_BASE, id), {
      method: 'DELETE',
    }),
};
