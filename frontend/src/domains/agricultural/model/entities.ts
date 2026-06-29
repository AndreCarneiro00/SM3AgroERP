import type { EntityCollection } from '../../../core/collections/types';
import type {
  FieldOperationStatus,
  FieldOperationType,
  MachineType,
} from '../api/dtos';

export interface Field {
  id: number;
  name: string;
  areaHectares?: number;
}

export interface Machine {
  id: number;
  name: string;
  machineType: MachineType;
  manufacturer?: string;
  model?: string;
  year?: number;
  active: boolean;
  observation?: string;
}

export interface Cut {
  id: number;
  fieldId?: number;
  productFamilyId?: number;
  cutDate?: string;
  cutNumber?: number;
  observation?: string;
  daysSinceLastCut?: number;
}

export interface FieldOperation {
  id: number;
  fieldId?: number;
  cutId?: number;
  operationType: FieldOperationType;
  operationDate: string;
  status: FieldOperationStatus;
  observation?: string;
}

export interface FieldOperationMachine {
  id: number;
  fieldOperationId?: number;
  machineId?: number;
  hoursWorked?: number;
  observation?: string;
}

export interface FieldOperationItem {
  id: number;
  fieldOperationId?: number;
  productId?: number;
  quantity?: number;
  unitCost?: number;
  amount?: number;
  inventoryMovementId?: number;
  observation?: string;
}

export interface ProductionBatch {
  id: number;
  inventoryBatchId?: number;
  qualityGrade?: string;
  cutId?: number;
  observation?: string;
}

export interface AgriculturalCatalog {
  fields: EntityCollection<Field>;
  machines: EntityCollection<Machine>;
  cuts: EntityCollection<Cut>;
  fieldOperations: EntityCollection<FieldOperation>;
  fieldOperationMachines: EntityCollection<FieldOperationMachine>;
  fieldOperationItems: EntityCollection<FieldOperationItem>;
  productionBatches: EntityCollection<ProductionBatch>;
}

export interface FieldInput {
  name: string;
  areaHectares?: number;
}

export interface MachineInput {
  name: string;
  machineType: MachineType;
  manufacturer?: string;
  model?: string;
  year?: number;
  active: boolean;
  observation?: string;
}

export interface CutInput {
  fieldId?: number;
  productFamilyId?: number;
  cutDate?: string;
  cutNumber?: number;
  observation?: string;
  daysSinceLastCut?: number;
}

export interface FieldOperationInput {
  fieldId?: number;
  cutId?: number;
  operationType: FieldOperationType;
  operationDate: string;
  status: FieldOperationStatus;
  observation?: string;
}

export interface FieldOperationMachineInput {
  fieldOperationId?: number;
  machineId?: number;
  hoursWorked?: number;
  observation?: string;
}

export interface FieldOperationItemInput {
  fieldOperationId?: number;
  productId?: number;
  quantity?: number;
  unitCost?: number;
  amount?: number;
  inventoryMovementId?: number;
  observation?: string;
}

export interface ProductionBatchInput {
  inventoryBatchId?: number;
  qualityGrade?: string;
  cutId?: number;
  observation?: string;
}
