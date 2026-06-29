export const masterDataKeys = {
  all: ['master-data'] as const,
  counterpartyTypes: () => [...masterDataKeys.all, 'counterparty-types'] as const,
  segments: () => [...masterDataKeys.all, 'segments'] as const,
  activityGroups: () => [...masterDataKeys.all, 'activity-groups'] as const,
  documentTypes: () => [...masterDataKeys.all, 'document-types'] as const,
  adjustmentRootCauses: () =>
    [...masterDataKeys.all, 'adjustment-root-causes'] as const,
  counterparties: () => [...masterDataKeys.all, 'counterparties'] as const,
};
