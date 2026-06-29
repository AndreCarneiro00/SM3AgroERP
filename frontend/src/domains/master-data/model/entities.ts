import type { EntityCollection } from '../../../core/collections/types';

export interface CounterpartyType {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface Segment {
  id: number;
  name: string;
}

export interface ActivityGroup {
  id: number;
  name: string;
}

export interface DocumentType {
  id: number;
  name: string;
}

export interface AdjustmentRootCause {
  id: number;
  name: string;
}

export interface Counterparty {
  id: number;
  counterpartyTypeId?: number;
  legalName: string;
  tradeName?: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
  email?: string;
  document?: string;
  documentType?: 'CPF' | 'CNPJ';
  segmentId?: number;
  active: boolean;
}

export interface MasterDataCatalog {
  counterpartyTypes: EntityCollection<CounterpartyType>;
  segments: EntityCollection<Segment>;
  activityGroups: EntityCollection<ActivityGroup>;
  documentTypes: EntityCollection<DocumentType>;
  adjustmentRootCauses: EntityCollection<AdjustmentRootCause>;
  counterparties: EntityCollection<Counterparty>;
}

export interface CounterpartyTypeInput {
  name: string;
  description?: string;
  active: boolean;
}

export interface SegmentInput {
  name: string;
}

export interface ActivityGroupInput {
  name: string;
}

export interface DocumentTypeInput {
  name: string;
}

export interface AdjustmentRootCauseInput {
  name: string;
}

export interface CounterpartyInput {
  counterpartyTypeId?: number;
  legalName: string;
  tradeName?: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
  email?: string;
  document?: string;
  documentType?: 'CPF' | 'CNPJ';
  segmentId?: number;
  active: boolean;
}

export interface CounterpartyRow extends Counterparty {
  displayName: string;
  counterpartyTypeName: string;
  segmentName: string;
}
