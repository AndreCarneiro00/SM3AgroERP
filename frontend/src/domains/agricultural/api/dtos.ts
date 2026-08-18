export type MachineType =
  | 'TRACTOR'
  | 'BALER'
  | 'MOWER'
  | 'SPRAYER'
  | 'FERTILIZER_SPREADER'
  | 'IRRIGATION'
  | 'PUMP'
  | 'OTHER';

export type FieldOperationType =
  | 'PLANTING'
  | 'FERTILIZATION'
  | 'DEFENSIVE_APPLICATION'
  | 'IRRIGATION'
  | 'SOIL_CORRECTION'
  | 'MOWING'
  | 'BALING'
  | 'FIELD_REFORM'
  | 'OTHER';

export type FieldOperationStatus = 'PLANNED' | 'DONE' | 'CANCELED';

export type CutStatus = 'DONE' | 'CANCELED';

export interface FieldDto {
  id: number;
  name: string;
  areaHectares?: number;
}

export interface MachineDto {
  id: number;
  name: string;
  machineType?: MachineType;
  manufacturer?: string;
  model?: string;
  year?: number;
  active: boolean;
  observation?: string;
}

export interface CutDto {
  id: number;
  fieldId?: number;
  productId?: number;
  inventoryBatchId?: number;
  inventoryMovementId?: number;
  productionBatchId?: number;
  batchCode?: string;
  cutDate?: string;
  cutNumber?: number;
  status?: CutStatus;
  quantity?: number;
  unitCost?: number;
  qualityGrade?: string;
  observation?: string;
  daysSinceLastCut?: number;
}

export interface FieldOperationDto {
  id: number;
  fieldId?: number;
  cutId?: number;
  operationType: FieldOperationType;
  operationDate: string;
  status: FieldOperationStatus;
  observation?: string;
}

export interface FieldOperationMachineDto {
  id: number;
  fieldOperationId?: number;
  machineId?: number;
  hoursWorked?: number;
  observation?: string;
}

export interface FieldOperationItemDto {
  id: number;
  fieldOperationId?: number;
  productId?: number;
  quantity?: number;
  unitCost?: number;
  amount?: number;
  inventoryMovementId?: number;
  observation?: string;
}

export interface ProductionBatchDto {
  id: number;
  inventoryBatchId?: number;
  inventoryMovementId?: number;
  quantity?: number;
  qualityGrade?: string;
  cutId?: number;
  observation?: string;
}

export type CreateFieldDto = Omit<FieldDto, 'id'>;
export type UpdateFieldDto = CreateFieldDto;

export type CreateMachineDto = Omit<MachineDto, 'id'>;
export type UpdateMachineDto = CreateMachineDto;

export interface LaunchCutDto {
  fieldId?: number;
  productId?: number;
  cutDate?: string;
  quantity?: number;
  unitCost?: number;
  qualityGrade?: string;
  observation?: string;
}

export type CreateFieldOperationDto = Omit<FieldOperationDto, 'id'>;
export type UpdateFieldOperationDto = CreateFieldOperationDto;

export type CreateFieldOperationMachineDto = Omit<
  FieldOperationMachineDto,
  'id'
>;
export type UpdateFieldOperationMachineDto = CreateFieldOperationMachineDto;

export type CreateFieldOperationItemDto = Omit<FieldOperationItemDto, 'id'>;
export type UpdateFieldOperationItemDto = CreateFieldOperationItemDto;

export type CreateProductionBatchDto = Omit<ProductionBatchDto, 'id'>;
export type UpdateProductionBatchDto = CreateProductionBatchDto;
