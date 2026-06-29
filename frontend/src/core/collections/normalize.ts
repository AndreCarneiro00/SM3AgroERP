import type { EntityCollection } from './types';

export function normalizeById<
  T extends { id: TId },
  TId extends PropertyKey = number,
>(items: T[]): EntityCollection<T, TId> {
  return items.reduce<EntityCollection<T, TId>>(
    (collection, item) => {
      collection.byId[item.id] = item;
      collection.allIds.push(item.id);
      return collection;
    },
    { byId: {} as Record<TId, T>, allIds: [] },
  );
}
