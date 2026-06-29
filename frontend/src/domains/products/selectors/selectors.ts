import { selectAll, selectById } from '../../../core/collections/selectors';
import type { ProductsCatalog, ProductRow } from '../model/entities';

export function selectBaseUnits(catalog: ProductsCatalog) {
  return selectAll(catalog.baseUnits);
}

export function selectProductFamilies(catalog: ProductsCatalog) {
  return selectAll(catalog.productFamilies);
}

export function selectUnitsOfMeasure(catalog: ProductsCatalog) {
  return selectAll(catalog.unitsOfMeasure);
}

export function selectProducts(catalog: ProductsCatalog) {
  return selectAll(catalog.products);
}

export function selectProductRows(catalog: ProductsCatalog): ProductRow[] {
  return selectProducts(catalog).map((product) => ({
    ...product,
    familyName:
      selectById(catalog.productFamilies, product.productFamilyId)?.name ?? '-',
    unitName:
      selectById(catalog.unitsOfMeasure, product.unitId)?.name ?? '-',
  }));
}
