import { normalizeById } from '../../../core/collections/normalize';
import type {
  ActivityGroupDto,
  AdjustmentRootCauseDto,
  CounterpartyDto,
  CounterpartyTypeDto,
  CreateActivityGroupDto,
  CreateAdjustmentRootCauseDto,
  CreateCounterpartyDto,
  CreateCounterpartyTypeDto,
  CreateDocumentTypeDto,
  CreateSegmentDto,
  DocumentTypeDto,
  SegmentDto,
} from '../api/dtos';
import type {
  ActivityGroup,
  ActivityGroupInput,
  AdjustmentRootCause,
  AdjustmentRootCauseInput,
  Counterparty,
  CounterpartyInput,
  CounterpartyType,
  CounterpartyTypeInput,
  DocumentType,
  DocumentTypeInput,
  MasterDataCatalog,
  Segment,
  SegmentInput,
} from './entities';

export function mapCounterpartyTypeDto(
  dto: CounterpartyTypeDto,
): CounterpartyType {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    active: dto.active,
  };
}

export function mapSegmentDto(dto: SegmentDto): Segment {
  return {
    id: dto.id,
    name: dto.name,
  };
}

export function mapActivityGroupDto(dto: ActivityGroupDto): ActivityGroup {
  return {
    id: dto.id,
    name: dto.name,
  };
}

export function mapDocumentTypeDto(dto: DocumentTypeDto): DocumentType {
  return {
    id: dto.id,
    name: dto.name,
  };
}

export function mapAdjustmentRootCauseDto(
  dto: AdjustmentRootCauseDto,
): AdjustmentRootCause {
  return {
    id: dto.id,
    name: dto.name,
  };
}

export function mapCounterpartyDto(dto: CounterpartyDto): Counterparty {
  return {
    id: dto.id,
    counterpartyTypeId: dto.counterpartyTypeId,
    legalName: dto.legalName ?? '',
    tradeName: dto.tradeName,
    city: dto.city,
    state: dto.state,
    phoneNumber: dto.phoneNumber,
    email: dto.email,
    document: dto.document,
    documentType: dto.documentType,
    segmentId: dto.segmentId,
    active: dto.active,
  };
}

export function mapCounterpartyTypeInputToDto(
  input: CounterpartyTypeInput,
): CreateCounterpartyTypeDto {
  return {
    name: input.name,
    description: input.description,
    active: input.active,
  };
}

export function mapSegmentInputToDto(input: SegmentInput): CreateSegmentDto {
  return {
    name: input.name,
  };
}

export function mapActivityGroupInputToDto(
  input: ActivityGroupInput,
): CreateActivityGroupDto {
  return {
    name: input.name,
  };
}

export function mapDocumentTypeInputToDto(
  input: DocumentTypeInput,
): CreateDocumentTypeDto {
  return {
    name: input.name,
  };
}

export function mapAdjustmentRootCauseInputToDto(
  input: AdjustmentRootCauseInput,
): CreateAdjustmentRootCauseDto {
  return {
    name: input.name,
  };
}

export function mapCounterpartyInputToDto(
  input: CounterpartyInput,
): CreateCounterpartyDto {
  return {
    counterpartyTypeId: input.counterpartyTypeId,
    legalName: input.legalName,
    tradeName: input.tradeName,
    city: input.city,
    state: input.state,
    phoneNumber: input.phoneNumber,
    email: input.email,
    document: input.document,
    documentType: input.documentType,
    segmentId: input.segmentId,
    active: input.active,
  };
}

export function createMasterDataCatalog(params: {
  counterpartyTypes: CounterpartyTypeDto[];
  segments: SegmentDto[];
  activityGroups: ActivityGroupDto[];
  documentTypes: DocumentTypeDto[];
  adjustmentRootCauses: AdjustmentRootCauseDto[];
  counterparties: CounterpartyDto[];
}): MasterDataCatalog {
  const counterpartyTypes = params.counterpartyTypes.map(mapCounterpartyTypeDto);
  const segments = params.segments.map(mapSegmentDto);
  const activityGroups = params.activityGroups.map(mapActivityGroupDto);
  const documentTypes = params.documentTypes.map(mapDocumentTypeDto);
  const adjustmentRootCauses = params.adjustmentRootCauses.map(
    mapAdjustmentRootCauseDto,
  );
  const counterparties = params.counterparties.map(mapCounterpartyDto);

  return {
    counterpartyTypes: normalizeById(counterpartyTypes),
    segments: normalizeById(segments),
    activityGroups: normalizeById(activityGroups),
    documentTypes: normalizeById(documentTypes),
    adjustmentRootCauses: normalizeById(adjustmentRootCauses),
    counterparties: normalizeById(counterparties),
  };
}
