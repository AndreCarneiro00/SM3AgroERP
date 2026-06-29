import { normalizeById } from '../../../core/collections/normalize';
import type {
  CreateCutDto,
  CreateFieldDto,
  CreateFieldOperationDto,
  CreateFieldOperationItemDto,
  CreateFieldOperationMachineDto,
  CreateMachineDto,
  CreateProductionBatchDto,
  CutDto,
  FieldDto,
  FieldOperationDto,
  FieldOperationItemDto,
  FieldOperationMachineDto,
  MachineDto,
  ProductionBatchDto,
} from '../api/dtos';
import type {
  AgriculturalCatalog,
  Cut,
  CutInput,
  Field,
  FieldInput,
  FieldOperation,
  FieldOperationInput,
  FieldOperationItem,
  FieldOperationItemInput,
  FieldOperationMachine,
  FieldOperationMachineInput,
  Machine,
  MachineInput,
  ProductionBatch,
  ProductionBatchInput,
} from './entities';

export function mapFieldDto(dto: FieldDto): Field {
  return {
    id: dto.id,
    name: dto.name,
    areaHectares: dto.areaHectares,
  };
}

export function mapMachineDto(dto: MachineDto): Machine {
  return {
    id: dto.id,
    name: dto.name,
    machineType: dto.machineType ?? 'OTHER',
    manufacturer: dto.manufacturer,
    model: dto.model,
    year: dto.year,
    active: dto.active,
    observation: dto.observation,
  };
}

export function mapCutDto(dto: CutDto): Cut {
  return {
    id: dto.id,
    fieldId: dto.fieldId,
    productFamilyId: dto.productFamilyId,
    cutDate: dto.cutDate,
    cutNumber: dto.cutNumber,
    observation: dto.observation,
    daysSinceLastCut: dto.daysSinceLastCut,
  };
}

export function mapFieldOperationDto(dto: FieldOperationDto): FieldOperation {
  return {
    id: dto.id,
    fieldId: dto.fieldId,
    cutId: dto.cutId,
    operationType: dto.operationType,
    operationDate: dto.operationDate,
    status: dto.status,
    observation: dto.observation,
  };
}

export function mapFieldOperationMachineDto(
  dto: FieldOperationMachineDto,
): FieldOperationMachine {
  return {
    id: dto.id,
    fieldOperationId: dto.fieldOperationId,
    machineId: dto.machineId,
    hoursWorked: dto.hoursWorked,
    observation: dto.observation,
  };
}

export function mapFieldOperationItemDto(
  dto: FieldOperationItemDto,
): FieldOperationItem {
  return {
    id: dto.id,
    fieldOperationId: dto.fieldOperationId,
    productId: dto.productId,
    quantity: dto.quantity,
    unitCost: dto.unitCost,
    amount: dto.amount,
    inventoryMovementId: dto.inventoryMovementId,
    observation: dto.observation,
  };
}

export function mapProductionBatchDto(dto: ProductionBatchDto): ProductionBatch {
  return {
    id: dto.id,
    inventoryBatchId: dto.inventoryBatchId,
    qualityGrade: dto.qualityGrade,
    cutId: dto.cutId,
    observation: dto.observation,
  };
}

export function mapFieldInputToDto(input: FieldInput): CreateFieldDto {
  return {
    name: input.name,
    areaHectares: input.areaHectares,
  };
}

export function mapMachineInputToDto(input: MachineInput): CreateMachineDto {
  return {
    name: input.name,
    machineType: input.machineType,
    manufacturer: input.manufacturer,
    model: input.model,
    year: input.year,
    active: input.active,
    observation: input.observation,
  };
}

export function mapCutInputToDto(input: CutInput): CreateCutDto {
  return {
    fieldId: input.fieldId,
    productFamilyId: input.productFamilyId,
    cutDate: input.cutDate,
    cutNumber: input.cutNumber,
    observation: input.observation,
    daysSinceLastCut: input.daysSinceLastCut,
  };
}

export function mapFieldOperationInputToDto(
  input: FieldOperationInput,
): CreateFieldOperationDto {
  return {
    fieldId: input.fieldId,
    cutId: input.cutId,
    operationType: input.operationType,
    operationDate: input.operationDate,
    status: input.status,
    observation: input.observation,
  };
}

export function mapFieldOperationMachineInputToDto(
  input: FieldOperationMachineInput,
): CreateFieldOperationMachineDto {
  return {
    fieldOperationId: input.fieldOperationId,
    machineId: input.machineId,
    hoursWorked: input.hoursWorked,
    observation: input.observation,
  };
}

export function mapFieldOperationItemInputToDto(
  input: FieldOperationItemInput,
): CreateFieldOperationItemDto {
  return {
    fieldOperationId: input.fieldOperationId,
    productId: input.productId,
    quantity: input.quantity,
    unitCost: input.unitCost,
    amount: input.amount,
    inventoryMovementId: input.inventoryMovementId,
    observation: input.observation,
  };
}

export function mapProductionBatchInputToDto(
  input: ProductionBatchInput,
): CreateProductionBatchDto {
  return {
    inventoryBatchId: input.inventoryBatchId,
    qualityGrade: input.qualityGrade,
    cutId: input.cutId,
    observation: input.observation,
  };
}

export function createAgriculturalCatalog(params: {
  fields: FieldDto[];
  machines: MachineDto[];
  cuts: CutDto[];
  fieldOperations: FieldOperationDto[];
  fieldOperationMachines: FieldOperationMachineDto[];
  fieldOperationItems: FieldOperationItemDto[];
  productionBatches: ProductionBatchDto[];
}): AgriculturalCatalog {
  const fields = params.fields.map(mapFieldDto);
  const machines = params.machines.map(mapMachineDto);
  const cuts = params.cuts.map(mapCutDto);
  const fieldOperations = params.fieldOperations.map(mapFieldOperationDto);
  const fieldOperationMachines = params.fieldOperationMachines.map(
    mapFieldOperationMachineDto,
  );
  const fieldOperationItems = params.fieldOperationItems.map(
    mapFieldOperationItemDto,
  );
  const productionBatches = params.productionBatches.map(
    mapProductionBatchDto,
  );

  return {
    fields: normalizeById(fields),
    machines: normalizeById(machines),
    cuts: normalizeById(cuts),
    fieldOperations: normalizeById(fieldOperations),
    fieldOperationMachines: normalizeById(fieldOperationMachines),
    fieldOperationItems: normalizeById(fieldOperationItems),
    productionBatches: normalizeById(productionBatches),
  };
}
