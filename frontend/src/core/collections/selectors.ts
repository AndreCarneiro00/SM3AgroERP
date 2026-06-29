import type { EntityCollection } from './types';

export function selectAll<T, TId extends PropertyKey>(
  collection: EntityCollection<T, TId>,
) {
  return collection.allIds.map((id) => collection.byId[id]);
}

export function selectById<T, TId extends PropertyKey>(
  collection: EntityCollection<T, TId>,
  id?: TId,
) {
  if (id === undefined) return undefined;
  return collection.byId[id];
}
