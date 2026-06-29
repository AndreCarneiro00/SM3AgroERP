import baseUnitsJson from '../../../app/data/json/baseUnits.json';
import productFamiliesJson from '../../../app/data/json/productFamilies.json';
import unitsOfMeasureJson from '../../../app/data/json/unitsOfMeasure.json';
import productsJson from '../../../app/data/json/products.json';
import type {
  BaseUnitDto,
  ProductDto,
  ProductFamilyDto,
  UnitOfMeasureDto,
} from '../../../domains/products/api/dtos';

export function createProductsFixtures() {
  return {
    baseUnits: structuredClone(baseUnitsJson) as BaseUnitDto[],
    productFamilies: structuredClone(productFamiliesJson) as ProductFamilyDto[],
    unitsOfMeasure: structuredClone(unitsOfMeasureJson) as UnitOfMeasureDto[],
    products: structuredClone(productsJson) as ProductDto[],
  };
}
