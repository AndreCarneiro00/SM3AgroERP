export interface CounterpartyTypeDto {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface SegmentDto {
  id: number;
  name: string;
}

export interface ActivityGroupDto {
  id: number;
  name: string;
}

export interface DocumentTypeDto {
  id: number;
  name: string;
}

export interface AdjustmentRootCauseDto {
  id: number;
  name: string;
}

export interface CounterpartyDto {
  id: number;
  counterpartyTypeId?: number;
  counterpartyTypeName?: string;
  legalName?: string;
  tradeName?: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
  email?: string;
  document?: string;
  documentType?: 'CPF' | 'CNPJ';
  segmentId?: number;
  segmentName?: string;
  active: boolean;
}

export type CreateCounterpartyTypeDto = Omit<CounterpartyTypeDto, 'id'>;
export type UpdateCounterpartyTypeDto = CreateCounterpartyTypeDto;

export type CreateSegmentDto = Omit<SegmentDto, 'id'>;
export type UpdateSegmentDto = CreateSegmentDto;

export type CreateActivityGroupDto = Omit<ActivityGroupDto, 'id'>;
export type UpdateActivityGroupDto = CreateActivityGroupDto;

export type CreateDocumentTypeDto = Omit<DocumentTypeDto, 'id'>;
export type UpdateDocumentTypeDto = CreateDocumentTypeDto;

export type CreateAdjustmentRootCauseDto = Omit<
  AdjustmentRootCauseDto,
  'id'
>;
export type UpdateAdjustmentRootCauseDto = CreateAdjustmentRootCauseDto;

export type CreateCounterpartyDto = Omit<CounterpartyDto, 'id'>;
export type UpdateCounterpartyDto = CreateCounterpartyDto;
