export interface EntityCollection<T, TId extends PropertyKey = number> {
  byId: Record<TId, T>;
  allIds: TId[];
}
