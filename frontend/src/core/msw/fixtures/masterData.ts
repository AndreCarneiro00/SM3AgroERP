import activityGroupsJson from '../../../app/data/json/activityGroups.json';
import adjustmentRootCausesJson from '../../../app/data/json/adjustmentRootCauses.json';
import counterpartiesJson from '../../../app/data/json/counterparties.json';
import counterpartyTypesJson from '../../../app/data/json/counterpartyTypes.json';
import documentTypesJson from '../../../app/data/json/documentTypes.json';
import segmentsJson from '../../../app/data/json/segments.json';
import type {
  ActivityGroupDto,
  AdjustmentRootCauseDto,
  CounterpartyDto,
  CounterpartyTypeDto,
  DocumentTypeDto,
  SegmentDto,
} from '../../../domains/master-data/api/dtos';

export function createMasterDataFixtures() {
  return {
    counterpartyTypes: structuredClone(
      counterpartyTypesJson,
    ) as CounterpartyTypeDto[],
    segments: structuredClone(segmentsJson) as SegmentDto[],
    activityGroups: structuredClone(activityGroupsJson) as ActivityGroupDto[],
    documentTypes: structuredClone(documentTypesJson) as DocumentTypeDto[],
    adjustmentRootCauses: structuredClone(
      adjustmentRootCausesJson,
    ) as AdjustmentRootCauseDto[],
    counterparties: structuredClone(counterpartiesJson) as CounterpartyDto[],
  };
}
