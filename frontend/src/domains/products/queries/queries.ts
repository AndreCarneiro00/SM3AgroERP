import { useQueries, useQuery } from '@tanstack/react-query';
import { productsRepository } from '../api/repository';
import { productsKeys } from './keys';

export function useBaseUnitsQuery() {
  return useQuery({
    queryKey: productsKeys.baseUnits(),
    queryFn: productsRepository.listBaseUnits,
  });
}

export function useProductFamiliesQuery() {
  return useQuery({
    queryKey: productsKeys.productFamilies(),
    queryFn: productsRepository.listProductFamilies,
  });
}

export function useUnitsOfMeasureQuery() {
  return useQuery({
    queryKey: productsKeys.unitsOfMeasure(),
    queryFn: productsRepository.listUnitsOfMeasure,
  });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: productsKeys.list(),
    queryFn: productsRepository.listProducts,
  });
}

export function useProductsCatalogQueries() {
  const [baseUnitsQuery, productFamiliesQuery, unitsOfMeasureQuery, productsQuery] =
    useQueries({
      queries: [
        {
          queryKey: productsKeys.baseUnits(),
          queryFn: productsRepository.listBaseUnits,
        },
        {
          queryKey: productsKeys.productFamilies(),
          queryFn: productsRepository.listProductFamilies,
        },
        {
          queryKey: productsKeys.unitsOfMeasure(),
          queryFn: productsRepository.listUnitsOfMeasure,
        },
        {
          queryKey: productsKeys.list(),
          queryFn: productsRepository.listProducts,
        },
      ],
    });

  return {
    baseUnitsQuery,
    productFamiliesQuery,
    unitsOfMeasureQuery,
    productsQuery,
  };
}
