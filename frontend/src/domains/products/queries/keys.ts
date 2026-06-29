export const productsKeys = {
  all: ['products'] as const,
  baseUnits: () => [...productsKeys.all, 'base-units'] as const,
  productFamilies: () => [...productsKeys.all, 'product-families'] as const,
  unitsOfMeasure: () => [...productsKeys.all, 'units-of-measure'] as const,
  list: () => [...productsKeys.all, 'list'] as const,
};
