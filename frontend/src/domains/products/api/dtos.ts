export type ProductTypeDto =
  | 'RAW_MATERIAL'
  | 'FINISHED_GOOD'
  | 'CONSUMABLE'
  | 'SPARE_PART'
  | 'SERVICE';

export interface BaseUnitDto {
  id: number;
  name: string;
}

export interface ProductFamilyDto {
  id: number;
  name: string;
}

export interface UnitOfMeasureDto {
  id: number;
  name: string;
  baseUnitId?: number;
  conversionFactor?: number;
}

export interface ProductDto {
  id: number;
  name: string;
  unitId?: number;
  productFamilyId?: number;
  productType?: ProductTypeDto;
  active: boolean;
}

export type CreateBaseUnitDto = Omit<BaseUnitDto, 'id'>;
export type UpdateBaseUnitDto = CreateBaseUnitDto;

export type CreateProductFamilyDto = Omit<ProductFamilyDto, 'id'>;
export type UpdateProductFamilyDto = CreateProductFamilyDto;

export type CreateUnitOfMeasureDto = Omit<UnitOfMeasureDto, 'id'>;
export type UpdateUnitOfMeasureDto = CreateUnitOfMeasureDto;

export type CreateProductDto = Omit<ProductDto, 'id'>;
export type UpdateProductDto = CreateProductDto;
