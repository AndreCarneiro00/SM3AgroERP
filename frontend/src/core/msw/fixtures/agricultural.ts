import cutsJson from '../../../app/data/json/cuts.json';
import fieldOperationItemsJson from '../../../app/data/json/fieldOperationItems.json';
import fieldOperationMachinesJson from '../../../app/data/json/fieldOperationMachines.json';
import fieldOperationsJson from '../../../app/data/json/fieldOperations.json';
import fieldsJson from '../../../app/data/json/fields.json';
import machinesJson from '../../../app/data/json/machines.json';
import productionBatchesJson from '../../../app/data/json/productionBatches.json';
import type {
  CutDto,
  FieldDto,
  FieldOperationDto,
  FieldOperationItemDto,
  FieldOperationMachineDto,
  MachineDto,
  ProductionBatchDto,
} from '../../../domains/agricultural/api/dtos';

export function createAgriculturalFixtures() {
  return {
    fields: structuredClone(fieldsJson) as FieldDto[],
    machines: structuredClone(machinesJson) as MachineDto[],
    cuts: structuredClone(cutsJson) as CutDto[],
    fieldOperations: structuredClone(fieldOperationsJson) as FieldOperationDto[],
    fieldOperationMachines: structuredClone(
      fieldOperationMachinesJson,
    ) as FieldOperationMachineDto[],
    fieldOperationItems: structuredClone(
      fieldOperationItemsJson,
    ) as FieldOperationItemDto[],
    productionBatches: structuredClone(
      productionBatchesJson,
    ) as ProductionBatchDto[],
  };
}
