import type { EntityCollection } from '../../../core/collections/types';

export type ProductType =
  | 'RAW_MATERIAL'
  | 'FINISHED_GOOD'
  | 'CONSUMABLE'
  | 'SPARE_PART'
  | 'SERVICE';

export interface BaseUnit {
  id: number;
  name: string;
}

export interface ProductFamily {
  id: number;
  name: string;
}

export interface UnitOfMeasure {
  id: number;
  name: string;
  baseUnitId?: number;
  conversionFactor?: number;
}

export interface Product {
  id: number;
  name: string;
  unitId?: number;
  productFamilyId?: number;
  productType: ProductType;
  active: boolean;
}

export interface ProductsCatalog {
  baseUnits: EntityCollection<BaseUnit>;
  productFamilies: EntityCollection<ProductFamily>;
  unitsOfMeasure: EntityCollection<UnitOfMeasure>;
  products: EntityCollection<Product>;
}

export interface BaseUnitInput {
  name: string;
}

export interface ProductFamilyInput {
  name: string;
}

export interface UnitOfMeasureInput {
  name: string;
  baseUnitId?: number;
  conversionFactor?: number;
}

export interface ProductInput {
  name: string;
  unitId?: number;
  productFamilyId?: number;
  productType: ProductType;
  active: boolean;
}

export interface ProductRow extends Product {
  familyName: string;
  unitName: string;
}
