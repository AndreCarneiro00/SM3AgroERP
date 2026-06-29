import { useMemo } from 'react';
import { createProductsCatalog } from '../model/mappers';
import {
  selectBaseUnits,
  selectProductFamilies,
  selectProductRows,
  selectProducts,
  selectUnitsOfMeasure,
} from '../selectors/selectors';
import {
  useCreateBaseUnitMutation,
  useCreateProductFamilyMutation,
  useCreateProductMutation,
  useCreateUnitOfMeasureMutation,
  useDeleteBaseUnitMutation,
  useDeleteProductFamilyMutation,
  useDeleteProductMutation,
  useDeleteUnitOfMeasureMutation,
  useUpdateBaseUnitMutation,
  useUpdateProductFamilyMutation,
  useUpdateProductMutation,
  useUpdateUnitOfMeasureMutation,
} from '../queries/mutations';
import { useProductsCatalogQueries } from '../queries/queries';

export function useProductsCatalogData() {
  const {
    baseUnitsQuery,
    productFamiliesQuery,
    unitsOfMeasureQuery,
    productsQuery,
  } = useProductsCatalogQueries();

  const catalog = useMemo(
    () =>
      createProductsCatalog({
        baseUnits: baseUnitsQuery.data ?? [],
        productFamilies: productFamiliesQuery.data ?? [],
        unitsOfMeasure: unitsOfMeasureQuery.data ?? [],
        products: productsQuery.data ?? [],
      }),
    [
      baseUnitsQuery.data,
      productFamiliesQuery.data,
      unitsOfMeasureQuery.data,
      productsQuery.data,
    ],
  );

  const baseUnits = useMemo(() => selectBaseUnits(catalog), [catalog]);
  const productFamilies = useMemo(
    () => selectProductFamilies(catalog),
    [catalog],
  );
  const unitsOfMeasure = useMemo(
    () => selectUnitsOfMeasure(catalog),
    [catalog],
  );
  const products = useMemo(() => selectProducts(catalog), [catalog]);
  const productRows = useMemo(() => selectProductRows(catalog), [catalog]);

  return {
    catalog,
    baseUnits,
    productFamilies,
    unitsOfMeasure,
    products,
    productRows,
    isLoading:
      baseUnitsQuery.isLoading ||
      productFamiliesQuery.isLoading ||
      unitsOfMeasureQuery.isLoading ||
      productsQuery.isLoading,
    isFetching:
      baseUnitsQuery.isFetching ||
      productFamiliesQuery.isFetching ||
      unitsOfMeasureQuery.isFetching ||
      productsQuery.isFetching,
  };
}

export function useProductsCatalogMutations() {
  return {
    createBaseUnit: useCreateBaseUnitMutation(),
    updateBaseUnit: useUpdateBaseUnitMutation(),
    deleteBaseUnit: useDeleteBaseUnitMutation(),
    createProductFamily: useCreateProductFamilyMutation(),
    updateProductFamily: useUpdateProductFamilyMutation(),
    deleteProductFamily: useDeleteProductFamilyMutation(),
    createUnitOfMeasure: useCreateUnitOfMeasureMutation(),
    updateUnitOfMeasure: useUpdateUnitOfMeasureMutation(),
    deleteUnitOfMeasure: useDeleteUnitOfMeasureMutation(),
    createProduct: useCreateProductMutation(),
    updateProduct: useUpdateProductMutation(),
    deleteProduct: useDeleteProductMutation(),
  };
}
