import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { productsRepository } from '../api/repository';
import { productsKeys } from './keys';
import {
  mapBaseUnitInputToDto,
  mapProductFamilyInputToDto,
  mapProductInputToDto,
  mapUnitOfMeasureInputToDto,
} from '../model/mappers';
import type {
  BaseUnitInput,
  ProductFamilyInput,
  ProductInput,
  UnitOfMeasureInput,
} from '../model/entities';

function useProductsInvalidation() {
  const queryClient = useQueryClient();

  return async (...keys: readonly QueryKey[]) => {
    await Promise.all(
      keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
  };
}

export function useCreateProductMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: (input: ProductInput) =>
      productsRepository.createProduct(mapProductInputToDto(input)),
    onSuccess: async () => {
      await invalidate(productsKeys.list());
    },
  });
}

export function useUpdateProductMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductInput }) =>
      productsRepository.updateProduct(id, mapProductInputToDto(input)),
    onSuccess: async () => {
      await invalidate(productsKeys.list());
    },
  });
}

export function useDeleteProductMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: (id: number) => productsRepository.deleteProduct(id),
    onSuccess: async () => {
      await invalidate(productsKeys.list());
    },
  });
}

export function useCreateProductFamilyMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: (input: ProductFamilyInput) =>
      productsRepository.createProductFamily(mapProductFamilyInputToDto(input)),
    onSuccess: async () => {
      await invalidate(productsKeys.productFamilies());
    },
  });
}

export function useUpdateProductFamilyMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductFamilyInput }) =>
      productsRepository.updateProductFamily(
        id,
        mapProductFamilyInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(productsKeys.productFamilies());
    },
  });
}

export function useDeleteProductFamilyMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: (id: number) => productsRepository.deleteProductFamily(id),
    onSuccess: async () => {
      await invalidate(productsKeys.productFamilies(), productsKeys.list());
    },
  });
}

export function useCreateBaseUnitMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: (input: BaseUnitInput) =>
      productsRepository.createBaseUnit(mapBaseUnitInputToDto(input)),
    onSuccess: async () => {
      await invalidate(productsKeys.baseUnits());
    },
  });
}

export function useUpdateBaseUnitMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: BaseUnitInput }) =>
      productsRepository.updateBaseUnit(id, mapBaseUnitInputToDto(input)),
    onSuccess: async () => {
      await invalidate(productsKeys.baseUnits(), productsKeys.unitsOfMeasure());
    },
  });
}

export function useDeleteBaseUnitMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: (id: number) => productsRepository.deleteBaseUnit(id),
    onSuccess: async () => {
      await invalidate(productsKeys.baseUnits(), productsKeys.unitsOfMeasure());
    },
  });
}

export function useCreateUnitOfMeasureMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: (input: UnitOfMeasureInput) =>
      productsRepository.createUnitOfMeasure(mapUnitOfMeasureInputToDto(input)),
    onSuccess: async () => {
      await invalidate(productsKeys.unitsOfMeasure());
    },
  });
}

export function useUpdateUnitOfMeasureMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UnitOfMeasureInput }) =>
      productsRepository.updateUnitOfMeasure(
        id,
        mapUnitOfMeasureInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(productsKeys.unitsOfMeasure(), productsKeys.list());
    },
  });
}

export function useDeleteUnitOfMeasureMutation() {
  const invalidate = useProductsInvalidation();

  return useMutation({
    mutationFn: (id: number) => productsRepository.deleteUnitOfMeasure(id),
    onSuccess: async () => {
      await invalidate(productsKeys.unitsOfMeasure(), productsKeys.list());
    },
  });
}
