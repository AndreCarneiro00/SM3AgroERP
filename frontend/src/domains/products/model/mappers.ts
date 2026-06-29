import { normalizeById } from '../../../core/collections/normalize';
import type {
  BaseUnitDto,
  CreateBaseUnitDto,
  CreateProductDto,
  CreateProductFamilyDto,
  CreateUnitOfMeasureDto,
  ProductDto,
  ProductFamilyDto,
  UnitOfMeasureDto,
} from '../api/dtos';
import type {
  BaseUnit,
  BaseUnitInput,
  Product,
  ProductFamily,
  ProductFamilyInput,
  ProductInput,
  ProductsCatalog,
  UnitOfMeasure,
  UnitOfMeasureInput,
} from './entities';

export function mapBaseUnitDto(dto: BaseUnitDto): BaseUnit {
  return {
    id: dto.id,
    name: dto.name,
  };
}

export function mapProductFamilyDto(dto: ProductFamilyDto): ProductFamily {
  return {
    id: dto.id,
    name: dto.name,
  };
}

export function mapUnitOfMeasureDto(dto: UnitOfMeasureDto): UnitOfMeasure {
  return {
    id: dto.id,
    name: dto.name,
    baseUnitId: dto.baseUnitId,
    conversionFactor: dto.conversionFactor,
  };
}

export function mapProductDto(dto: ProductDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    unitId: dto.unitId,
    productFamilyId: dto.productFamilyId,
    productType: dto.productType ?? 'FINISHED_GOOD',
    active: dto.active,
  };
}

export function mapBaseUnitInputToDto(input: BaseUnitInput): CreateBaseUnitDto {
  return {
    name: input.name,
  };
}

export function mapProductFamilyInputToDto(
  input: ProductFamilyInput,
): CreateProductFamilyDto {
  return {
    name: input.name,
  };
}

export function mapUnitOfMeasureInputToDto(
  input: UnitOfMeasureInput,
): CreateUnitOfMeasureDto {
  return {
    name: input.name,
    baseUnitId: input.baseUnitId,
    conversionFactor: input.conversionFactor,
  };
}

export function mapProductInputToDto(input: ProductInput): CreateProductDto {
  return {
    name: input.name,
    unitId: input.unitId,
    productFamilyId: input.productFamilyId,
    productType: input.productType,
    active: input.active,
  };
}

export function createProductsCatalog(params: {
  baseUnits: BaseUnitDto[];
  productFamilies: ProductFamilyDto[];
  unitsOfMeasure: UnitOfMeasureDto[];
  products: ProductDto[];
}): ProductsCatalog {
  const baseUnits = params.baseUnits.map(mapBaseUnitDto);
  const productFamilies = params.productFamilies.map(mapProductFamilyDto);
  const unitsOfMeasure = params.unitsOfMeasure.map(mapUnitOfMeasureDto);
  const products = params.products.map(mapProductDto);

  return {
    baseUnits: normalizeById(baseUnits),
    productFamilies: normalizeById(productFamilies),
    unitsOfMeasure: normalizeById(unitsOfMeasure),
    products: normalizeById(products),
  };
}
