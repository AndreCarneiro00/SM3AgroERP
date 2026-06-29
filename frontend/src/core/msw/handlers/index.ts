import type { RequestHandler } from 'msw';
import { agriculturalHandlers } from './agricultural';
import { accountingHandlers } from './accounting';
import { bankingHandlers } from './banking';
import { financialHandlers } from './financial';
import { inventoryHandlers } from './inventory';
import { masterDataHandlers } from './masterData';
import { productHandlers } from './products';

export const handlers: RequestHandler[] = [
  ...agriculturalHandlers,
  ...accountingHandlers,
  ...bankingHandlers,
  ...financialHandlers,
  ...inventoryHandlers,
  ...masterDataHandlers,
  ...productHandlers,
];
