import { HttpResponse, http } from 'msw';
import type { RequestHandler } from 'msw';
import type {
  BankTransferDto,
  CancelBankTransferDto,
  CancelFinancialTransactionDto,
  CancelFinancialTransactionFulfillmentDto,
  CreateBankTransferDto,
  CreateFinancialTransactionAttachmentDto,
  CreateFinancialTransactionDto,
  CreateFinancialTransactionFulfillmentDto,
  CreateFinancialTransactionPayloadDto,
  FinancialTransactionAttachmentDto,
  FinancialTransactionDto,
  FinancialTransactionFulfillmentAllocationDto,
  FinancialTransactionFulfillmentDto,
  FinancialTransactionItemDto,
} from '../../../domains/financial/api/dtos';
import type {
  InventoryBatchDto,
  InventoryMovementDto,
} from '../../../domains/inventory/api/dtos';
import { cashManagementState } from '../state/cashManagement';
import {
  validateBankTransfer,
  validateBankTransferAdjustment,
  validateFulfillment,
  validateFulfillmentAdjustment,
} from '../utils/bankBalances';
import { inventoryFixtures } from './inventory';
import { productFixtures } from './products';

const fixtures = cashManagementState;

function nextId(items: Array<{ id: number }>) {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function parseId(rawId?: string) {
  if (!rawId) return undefined;
  const parsed = Number(rawId);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function notFound() {
  return HttpResponse.json({ message: 'Not found' }, { status: 404 });
}

function badRequest(message: string) {
  return HttpResponse.json({ message }, { status: 400 });
}

function getDateRange(request: Request) {
  const url = new URL(request.url);

  return {
    startDate: url.searchParams.get('startDate'),
    endDate: url.searchParams.get('endDate'),
  };
}

function isInDateRange(
  value: string | undefined,
  startDate: string | null,
  endDate: string | null,
) {
  if (!startDate && !endDate) {
    return true;
  }

  if (!value) {
    return false;
  }

  return (!startDate || value >= startDate) && (!endDate || value <= endDate);
}

function transactionNotFound(id?: number) {
  return fixtures.financialTransactions.find((item) => item.id === id);
}

function getProduct(productId?: number) {
  return productFixtures.products.find((product) => product.id === productId);
}

function stockApplies(
  product: { hasStock?: boolean | null; stockControlStartDate?: string | null } | undefined,
  issueDate?: string,
) {
  if (!product || product.hasStock !== true) {
    return false;
  }

  return !product.stockControlStartDate || !issueDate
    ? true
    : issueDate >= product.stockControlStartDate;
}

function hasStockMovement(itemId?: number) {
  return inventoryFixtures.inventoryMovements.some(
    (movement) => movement.financialTransactionItemId === itemId,
  );
}

function hasStockMovementInTransaction(financialTransactionId: number) {
  return fixtures.financialTransactionItems.some(
    (item) =>
      item.financialTransactionId === financialTransactionId &&
      hasStockMovement(item.id),
  );
}

function getTotalAmount(financialTransactionId: number) {
  return fixtures.financialTransactionItems
    .filter((item) => item.financialTransactionId === financialTransactionId)
    .reduce((sum, item) => sum + (item.amount ?? 0), 0);
}

function getPaidAmount(
  financialTransactionId: number,
  excludedFulfillmentId?: number,
) {
  return fixtures.financialTransactionFulfillments
    .filter(
      (item) =>
        item.financialTransactionId === financialTransactionId &&
        item.id !== excludedFulfillmentId &&
        (item.status ?? 'ACTIVE') === 'ACTIVE',
    )
    .reduce((sum, item) => sum + item.amountPaid, 0);
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

type InventorySnapshot = {
  inventoryBatches: InventoryBatchDto[];
  inventoryMovements: InventoryMovementDto[];
};

function createInventorySnapshot(): InventorySnapshot {
  return {
    inventoryBatches: structuredClone(inventoryFixtures.inventoryBatches),
    inventoryMovements: structuredClone(inventoryFixtures.inventoryMovements),
  };
}

function restoreInventorySnapshot(snapshot: InventorySnapshot) {
  inventoryFixtures.inventoryBatches = snapshot.inventoryBatches;
  inventoryFixtures.inventoryMovements = snapshot.inventoryMovements;
}

function getTransactionItems(financialTransactionId: number) {
  return fixtures.financialTransactionItems.filter(
    (item) => item.financialTransactionId === financialTransactionId,
  );
}

function getAllocatedAmountForItem(itemId: number) {
  return fixtures.financialTransactionFulfillments
    .filter((fulfillment) => (fulfillment.status ?? 'ACTIVE') === 'ACTIVE')
    .flatMap((fulfillment) => fulfillment.allocations ?? [])
    .filter((allocation) => allocation.itemId === itemId)
    .reduce((sum, allocation) => sum + allocation.amount, 0);
}

function nextAllocationId() {
  return (
    fixtures.financialTransactionFulfillments
      .flatMap((fulfillment) => fulfillment.allocations ?? [])
      .reduce(
        (highest, allocation) => Math.max(highest, allocation.id ?? 0),
        0,
      ) + 1
  );
}

function resolveFulfillmentAllocations(
  financialTransactionId: number,
  amountPaid: number,
  allocations:
    | FinancialTransactionFulfillmentAllocationDto[]
    | undefined,
  items: FinancialTransactionItemDto[],
  excludedFulfillmentId?: number,
): FinancialTransactionFulfillmentAllocationDto[] | undefined {
  type ResolvedFulfillmentAllocation = {
    id: number;
    itemId: number;
    amount: number;
  };

  const totalAmount = getTotalAmount(financialTransactionId);
  const alreadyPaid = getPaidAmount(
    financialTransactionId,
    excludedFulfillmentId,
  );

  if (roundCurrency(alreadyPaid + amountPaid - totalAmount) > 0.009) {
    return undefined;
  }

  const allocatedByItemId = new Map<number, number>();

  fixtures.financialTransactionFulfillments
    .filter(
      (fulfillment) =>
        fulfillment.financialTransactionId === financialTransactionId &&
        fulfillment.id !== excludedFulfillmentId &&
        (fulfillment.status ?? 'ACTIVE') === 'ACTIVE',
    )
    .forEach((fulfillment) => {
      (fulfillment.allocations ?? []).forEach((allocation) => {
        if (!allocation.itemId) {
          return;
        }

        allocatedByItemId.set(
          allocation.itemId,
          roundCurrency(
            (allocatedByItemId.get(allocation.itemId) ?? 0) +
              allocation.amount,
          ),
        );
      });
    });

  const incomingAllocations = allocations ?? [];

  if (incomingAllocations.length === 0) {
    let remainingPayment = roundCurrency(amountPaid);
    const generatedAllocations: FinancialTransactionFulfillmentAllocationDto[] =
      [];

    [...items]
      .sort((left, right) => left.id - right.id)
      .forEach((item) => {
        if (remainingPayment <= 0) {
          return;
        }

        const itemAmount = roundCurrency(item.amount ?? 0);
        const alreadyAllocated = allocatedByItemId.get(item.id) ?? 0;
        const availableAmount = roundCurrency(itemAmount - alreadyAllocated);

        if (availableAmount <= 0) {
          return;
        }

        const allocatedAmount = roundCurrency(
          Math.min(availableAmount, remainingPayment),
        );

        generatedAllocations.push({
          id: nextAllocationId() + generatedAllocations.length,
          itemId: item.id,
          amount: allocatedAmount,
        });
        remainingPayment = roundCurrency(remainingPayment - allocatedAmount);
      });

    return remainingPayment > 0.009 ? undefined : generatedAllocations;
  }

  const resolvedAllocations = incomingAllocations
    .map((allocation, index) => {
      const item =
        allocation.itemId !== undefined
          ? items.find((candidate) => candidate.id === allocation.itemId)
          : allocation.itemIndex !== undefined
            ? items[allocation.itemIndex]
            : undefined;

      if (!item) {
        return undefined;
      }

      return {
        id: allocation.id ?? nextAllocationId() + index,
        itemId: item.id,
        amount: allocation.amount,
      };
    })
    .filter(
      (
        allocation,
      ): allocation is ResolvedFulfillmentAllocation => allocation !== undefined,
    );

  if (resolvedAllocations.length !== incomingAllocations.length) {
    return undefined;
  }

  const allocatedAmount = roundCurrency(
    resolvedAllocations.reduce((sum, allocation) => sum + allocation.amount, 0),
  );

  if (Math.abs(roundCurrency(allocatedAmount - amountPaid)) > 0.009) {
    return undefined;
  }

  const incomingByItemId = new Map<number, number>();
  resolvedAllocations.forEach((allocation) => {
    if (!allocation.itemId) {
      return;
    }

    incomingByItemId.set(
      allocation.itemId,
      roundCurrency(
        (incomingByItemId.get(allocation.itemId) ?? 0) + allocation.amount,
      ),
    );
  });

  const exceedsItemAmount = items.some((item) => {
    const allocatedAmountForItem = roundCurrency(
      (allocatedByItemId.get(item.id) ?? 0) +
        (incomingByItemId.get(item.id) ?? 0),
    );

    return allocatedAmountForItem - roundCurrency(item.amount ?? 0) > 0.009;
  });

  return exceedsItemAmount ? undefined : resolvedAllocations;
}

function normalizeFulfillmentAllocations(
  allocations:
    | FinancialTransactionFulfillmentAllocationDto[]
    | undefined,
  items: FinancialTransactionItemDto[],
) {
  return (allocations ?? [])
    .map((allocation) => {
      const itemId =
        allocation.itemId ??
        (allocation.itemIndex !== undefined
          ? items[allocation.itemIndex]?.id
          : undefined);

      return {
        itemId,
        amount: roundCurrency(allocation.amount),
      };
    })
    .sort((left, right) => {
      if ((left.itemId ?? 0) !== (right.itemId ?? 0)) {
        return (left.itemId ?? 0) - (right.itemId ?? 0);
      }

      return left.amount - right.amount;
    });
}

function fulfillmentAllocationsChanged(
  current: FinancialTransactionFulfillmentDto,
  payload: CreateFinancialTransactionFulfillmentDto,
) {
  const items = getTransactionItems(current.financialTransactionId);
  const currentAllocations = normalizeFulfillmentAllocations(
    current.allocations,
    items,
  );
  const incomingAllocations = normalizeFulfillmentAllocations(
    payload.allocations,
    items,
  );

  if (currentAllocations.length !== incomingAllocations.length) {
    return true;
  }

  return currentAllocations.some((allocation, index) => {
    const incoming = incomingAllocations[index];

    return (
      allocation.itemId !== incoming.itemId ||
      Math.abs(roundCurrency(allocation.amount - incoming.amount)) > 0.009
    );
  });
}

function fulfillmentCashFieldsChanged(
  current: FinancialTransactionFulfillmentDto,
  payload: CreateFinancialTransactionFulfillmentDto,
) {
  return (
    current.bankAccountId !== payload.bankAccountId ||
    current.paymentDate !== payload.paymentDate ||
    Math.abs(roundCurrency(current.amountPaid - payload.amountPaid)) > 0.009 ||
    fulfillmentAllocationsChanged(current, payload)
  );
}

function createFulfillmentAdjustment(
  fulfillment: FinancialTransactionFulfillmentDto,
  request: CancelFinancialTransactionFulfillmentDto,
) {
  if ((fulfillment.status ?? 'ACTIVE') !== 'ACTIVE') {
    throw new Error('Only active fulfillments can be canceled.');
  }

  validateFulfillmentAdjustment(fixtures, fulfillment, request.adjustmentDate);

  const created: FinancialTransactionFulfillmentDto = {
    id: nextId(fixtures.financialTransactionFulfillments),
    financialTransactionId: fulfillment.financialTransactionId,
    bankAccountId: fulfillment.bankAccountId,
    paymentDate: request.adjustmentDate,
    amountPaid: fulfillment.amountPaid,
    allocations: [],
    observation: request.observation,
    status: 'ADJUSTMENT',
    cancelId: fulfillment.id,
  };

  fulfillment.status = 'CANCELED';
  fixtures.financialTransactionFulfillments.push(created);
  syncTransaction(fulfillment.financialTransactionId);
  return created;
}

function syncTransaction(financialTransactionId: number) {
  const financialTransaction = fixtures.financialTransactions.find(
    (item) => item.id === financialTransactionId,
  );

  if (!financialTransaction) return;

  const totalAmount = getTotalAmount(financialTransactionId);
  const paidAmount = getPaidAmount(financialTransactionId);

  financialTransaction.totalAmount = totalAmount;
  financialTransaction.paidAmount = paidAmount;
  financialTransaction.remainingAmount = Math.max(totalAmount - paidAmount, 0);
  financialTransaction.itemCount = fixtures.financialTransactionItems.filter(
    (item) => item.financialTransactionId === financialTransactionId,
  ).length;
  financialTransaction.attachmentCount =
    fixtures.financialTransactionAttachments.filter(
      (item) => item.financialTransactionId === financialTransactionId,
    ).length;
  financialTransaction.fulfillmentCount =
    fixtures.financialTransactionFulfillments.filter(
      (item) => item.financialTransactionId === financialTransactionId,
    ).length;

  if (financialTransaction.status === 'CANCELED') return;

  if (paidAmount <= 0) {
    financialTransaction.status = 'PENDING';
  } else if (paidAmount >= totalAmount) {
    financialTransaction.status = 'PAID';
  } else {
    financialTransaction.status = 'PARTIAL';
  }
}

function syncAllTransactions() {
  fixtures.financialTransactions.forEach((transaction) =>
    syncTransaction(transaction.id),
  );
}

function buildTransactionDetail(financialTransaction: FinancialTransactionDto) {
  syncTransaction(financialTransaction.id);
  const items = getTransactionItems(financialTransaction.id);
  const fulfillments = fixtures.financialTransactionFulfillments
    .filter((item) => item.financialTransactionId === financialTransaction.id)
    .map((fulfillment) => {
      if (!fulfillment.allocations) {
        fulfillment.allocations =
          resolveFulfillmentAllocations(
            financialTransaction.id,
            fulfillment.amountPaid,
            undefined,
            items,
            fulfillment.id,
          ) ?? [];
      }

      return {
        ...fulfillment,
        allocations: fulfillment.allocations ?? [],
      };
    });

  return {
    ...financialTransaction,
    items,
    attachments: fixtures.financialTransactionAttachments.filter(
      (item) => item.financialTransactionId === financialTransaction.id,
    ),
    fulfillments,
  };
}

async function readPayloadPart<T>(request: Request): Promise<{
  payload: T;
  formData?: FormData;
}> {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return {
      payload: (await request.json()) as T,
    };
  }

  const formData = await request.formData();
  const rawPayload = formData.get('payload');

  if (!rawPayload) {
    throw new Error('Missing multipart payload.');
  }

  const payloadText =
    typeof rawPayload === 'string' ? rawPayload : await rawPayload.text();

  return {
    payload: JSON.parse(payloadText) as T,
    formData,
  };
}

async function readOptionalJson<T>(request: Request) {
  const text = await request.text();

  return text.trim().length > 0 ? (JSON.parse(text) as T) : undefined;
}

function createAttachmentFromFile(
  financialTransactionId: number,
  payload: CreateFinancialTransactionAttachmentDto,
  file: FormDataEntryValue,
): FinancialTransactionAttachmentDto {
  const uploadedFile = file instanceof File ? file : undefined;

  return {
    id: nextId(fixtures.financialTransactionAttachments),
    financialTransactionId,
    documentTypeId: payload.documentTypeId,
    fileName: uploadedFile?.name ?? 'anexo',
    declaredContentType: uploadedFile?.type,
    sizeBytes: uploadedFile?.size,
    storageProvider: 'LOCAL',
    storagePath: `mock/${financialTransactionId}/${uploadedFile?.name ?? 'anexo'}`,
    active: true,
    observation: payload.observation,
  };
}

function createStockMovements(
  financialTransaction: FinancialTransactionDto,
  items: FinancialTransactionItemDto[],
) {
  for (const item of items) {
    if (!item.productId) {
      continue;
    }

    const product = getProduct(item.productId);

    if (!product) {
      return `Product not found: ${item.productId}`;
    }

    if (product.hasStock === null || product.hasStock === undefined) {
      return 'Product must be classified for stock control before use.';
    }

    if (!stockApplies(product, financialTransaction.issueDate)) {
      continue;
    }

    if (!item.quantity || item.quantity <= 0) {
      return 'quantity must be greater than zero';
    }

    if (financialTransaction.type === 'EXPENSE') {
      const inventoryUnitCost = item.inventoryUnitCost ?? item.unitPrice;

      if (inventoryUnitCost === undefined || inventoryUnitCost === null) {
        return 'unitPrice is required for stock-controlled purchases.';
      }

      if (inventoryUnitCost < 0) {
        return 'unitPrice must be greater than or equal to zero';
      }

      const batchId = nextId(inventoryFixtures.inventoryBatches);
      const createdBatch: InventoryBatchDto = {
        id: batchId,
        productId: item.productId,
        code: `PUR-${financialTransaction.id}-ITEM-${item.id}`,
        batchDate: financialTransaction.issueDate,
        status: 'ACTIVE',
        unitCost: inventoryUnitCost,
        quantity: item.quantity,
      };
      inventoryFixtures.inventoryBatches.push(createdBatch);

      const movementId = nextId(inventoryFixtures.inventoryMovements);
      inventoryFixtures.inventoryMovements.push({
        id: movementId,
        batchId,
        movementType: 'PURCHASE_IN',
        quantity: item.quantity,
        unitCost: inventoryUnitCost,
        movementDate: financialTransaction.issueDate,
        financialTransactionItemId: item.id,
      });

      item.inventoryBatchId = batchId;
      item.inventoryMovementId = movementId;
      item.stockMovementType = 'PURCHASE_IN';
      continue;
    }

    if (!item.inventoryBatchId) {
      return 'inventoryBatchId is required for stock-controlled sales.';
    }

    const batch = inventoryFixtures.inventoryBatches.find(
      (candidate) => candidate.id === item.inventoryBatchId,
    );

    if (!batch) {
      return `InventoryBatch not found: ${item.inventoryBatchId}`;
    }

    if (batch.productId !== item.productId) {
      return 'Inventory batch does not belong to the financial item product.';
    }

    if (batch.status !== 'ACTIVE') {
      return 'Inventory batch is not available for sale.';
    }

    if ((batch.quantity ?? 0) < item.quantity) {
      return 'Inventory batch does not have enough stock.';
    }

    const movementId = nextId(inventoryFixtures.inventoryMovements);
    inventoryFixtures.inventoryMovements.push({
      id: movementId,
      batchId: batch.id,
      movementType: 'SALE_OUT',
      quantity: item.quantity,
      unitCost: batch.unitCost,
      movementDate: financialTransaction.issueDate,
      financialTransactionItemId: item.id,
    });

    const remainingQuantity = roundCurrency((batch.quantity ?? 0) - item.quantity);
    batch.quantity = remainingQuantity <= 0 ? 0 : remainingQuantity;
    batch.status = remainingQuantity <= 0 ? 'SOLD' : 'ACTIVE';

    item.inventoryBatchId = batch.id;
    item.inventoryMovementId = movementId;
    item.stockMovementType = 'SALE_OUT';
  }

  return undefined;
}

function rollbackCreatedTransaction(
  financialTransactionId: number,
  inventorySnapshot?: InventorySnapshot,
) {
  fixtures.financialTransactionAttachments =
    fixtures.financialTransactionAttachments.filter(
      (attachment) => attachment.financialTransactionId !== financialTransactionId,
    );
  fixtures.financialTransactionFulfillments =
    fixtures.financialTransactionFulfillments.filter(
      (fulfillment) => fulfillment.financialTransactionId !== financialTransactionId,
    );
  fixtures.financialTransactionItems = fixtures.financialTransactionItems.filter(
    (item) => item.financialTransactionId !== financialTransactionId,
  );
  fixtures.financialTransactions = fixtures.financialTransactions.filter(
    (financialTransaction) => financialTransaction.id !== financialTransactionId,
  );

  if (inventorySnapshot) {
    restoreInventorySnapshot(inventorySnapshot);
  }
}

export const financialHandlers: RequestHandler[] = [
  http.get(`/api/financial-transactions`, ({ request }) => {
    syncAllTransactions();
    const { startDate, endDate } = getDateRange(request);
    const filtered = fixtures.financialTransactions.filter(
      (financialTransaction) =>
        isInDateRange(financialTransaction.issueDate, startDate, endDate),
    );

    return HttpResponse.json(filtered);
  }),
  http.get(`/api/financial-transactions/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    const financialTransaction = transactionNotFound(id);
    if (!financialTransaction) return notFound();

    return HttpResponse.json(buildTransactionDetail(financialTransaction));
  }),
  http.post(`/api/financial-transactions`, async ({ request }) => {
    const { payload, formData } =
      await readPayloadPart<CreateFinancialTransactionPayloadDto>(request);
    const inventorySnapshot = createInventorySnapshot();
    const id = nextId(fixtures.financialTransactions);
    const created: FinancialTransactionDto = {
      id,
      description: payload.description,
      counterpartyId: payload.counterpartyId,
      issueDate: payload.issueDate,
      dueDate: payload.dueDate,
      documentNumber: payload.documentNumber,
      status: 'PENDING',
      type: payload.type,
      observation: payload.observation,
      hasNf: payload.hasNf,
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      itemCount: 0,
      attachmentCount: 0,
      fulfillmentCount: 0,
    };

    fixtures.financialTransactions.push(created);

    const createdItems: FinancialTransactionItemDto[] = [];

    payload.items.forEach((item) => {
      const createdItem: FinancialTransactionItemDto = {
        id: nextId(fixtures.financialTransactionItems),
        financialTransactionId: id,
        chartOfAccountId: item.chartOfAccountId,
        costCenterId: item.costCenterId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        productId: item.productId,
      };

      fixtures.financialTransactionItems.push(createdItem);
      createdItems.push(createdItem);
    });

    const stockError = createStockMovements(created, createdItems);

    if (stockError) {
      rollbackCreatedTransaction(id, inventorySnapshot);
      return HttpResponse.json({ message: stockError }, { status: 400 });
    }

    for (const fulfillment of payload.fulfillments ?? []) {
      const allocations = resolveFulfillmentAllocations(
        id,
        fulfillment.amountPaid,
        fulfillment.allocations,
        createdItems,
      );

      if (!allocations) {
        rollbackCreatedTransaction(id, inventorySnapshot);
        return HttpResponse.json(
          { message: 'Invalid fulfillment allocations' },
          { status: 400 },
        );
      }

      try {
        validateFulfillment(fixtures, id, {
          bankAccountId: fulfillment.bankAccountId ?? 0,
          paymentDate: fulfillment.paymentDate,
          amountPaid: fulfillment.amountPaid,
        });
      } catch (error) {
        rollbackCreatedTransaction(id, inventorySnapshot);
        return HttpResponse.json(
          { message: error instanceof Error ? error.message : 'Invalid fulfillment' },
          { status: 400 },
        );
      }

      fixtures.financialTransactionFulfillments.push({
        id: nextId(fixtures.financialTransactionFulfillments),
        financialTransactionId: id,
        bankAccountId: fulfillment.bankAccountId ?? 0,
        paymentDate: fulfillment.paymentDate,
        amountPaid: fulfillment.amountPaid,
        allocations,
        observation: fulfillment.observation,
        status: 'ACTIVE',
      });
    }

    const files = formData?.getAll('files') ?? [];
    (payload.attachments ?? []).forEach((attachment) => {
      const file = files[attachment.fileIndex];
      if (!file) return;
      fixtures.financialTransactionAttachments.push(
        createAttachmentFromFile(id, attachment, file),
      );
    });

    return HttpResponse.json(buildTransactionDetail(created), { status: 201 });
  }),
  http.patch(`/api/financial-transactions/:id`, async ({ params, request }) => {
    const id = parseId(String(params.id));
    const payload = (await request.json()) as CreateFinancialTransactionDto;
    const index = fixtures.financialTransactions.findIndex(
      (item) => item.id === id,
    );

    if (index < 0) return notFound();

    const current = fixtures.financialTransactions[index];

    if (current.type !== payload.type) {
      return HttpResponse.json(
        { message: 'Financial transaction type cannot be changed after creation.' },
        { status: 400 },
      );
    }

    if (current.issueDate !== payload.issueDate) {
      return HttpResponse.json(
        { message: 'Financial transaction issue date cannot be changed after creation.' },
        { status: 400 },
      );
    }

    fixtures.financialTransactions[index] = {
      ...current,
      description: payload.description,
      counterpartyId: payload.counterpartyId,
      dueDate: payload.dueDate,
      documentNumber: payload.documentNumber,
      observation: payload.observation,
      hasNf: payload.hasNf,
    };

    return HttpResponse.json(
      buildTransactionDetail(fixtures.financialTransactions[index]),
    );
  }),
  http.post(`/api/financial-transactions/:id/cancel`, async ({ params, request }) => {
    const id = parseId(String(params.id));
    const financialTransaction = transactionNotFound(id);
    if (!financialTransaction) return notFound();

    if (financialTransaction.status === 'CANCELED') {
      return badRequest('Canceled financial transactions cannot be changed.');
    }

    if (hasStockMovementInTransaction(id ?? 0)) {
      return badRequest(
        'Cannot cancel a financial transaction with inventory movements.',
      );
    }

    const payload =
      (await readOptionalJson<CancelFinancialTransactionDto>(request)) ?? {};
    const activeFulfillments = fixtures.financialTransactionFulfillments.filter(
      (fulfillment) =>
        fulfillment.financialTransactionId === id &&
        (fulfillment.status ?? 'ACTIVE') === 'ACTIVE',
    );

    if (activeFulfillments.length > 0 && !payload.adjustmentDate) {
      return badRequest(
        'Adjustment date is required to cancel a paid financial transaction.',
      );
    }

    const fulfillmentsSnapshot = structuredClone(
      fixtures.financialTransactionFulfillments,
    );
    const currentStatus = financialTransaction.status;

    try {
      activeFulfillments.forEach((fulfillment) => {
        createFulfillmentAdjustment(fulfillment, {
          adjustmentDate: payload.adjustmentDate ?? '',
          observation: payload.observation,
        });
      });
    } catch (error) {
      fixtures.financialTransactionFulfillments = fulfillmentsSnapshot;
      financialTransaction.status = currentStatus;
      syncTransaction(id ?? 0);

      return badRequest(
        error instanceof Error ? error.message : 'Invalid fulfillment adjustment',
      );
    }

    financialTransaction.status = 'CANCELED';
    return HttpResponse.json(buildTransactionDetail(financialTransaction));
  }),

  http.post(
    `/api/financial-transactions/:id/items`,
    ({ params }) => {
      const financialTransactionId = parseId(String(params.id));
      if (!transactionNotFound(financialTransactionId)) return notFound();

      return HttpResponse.json(
        { message: 'Financial transaction items can only be defined during transaction creation.' },
        { status: 400 },
      );
    },
  ),
  http.patch(
    `/api/financial-transactions/:id/items/:itemId`,
    ({ params }) => {
      const financialTransactionId = parseId(String(params.id));
      const itemId = parseId(String(params.itemId));
      if (!transactionNotFound(financialTransactionId)) return notFound();

      const itemExists = fixtures.financialTransactionItems.some(
        (item) =>
          item.id === itemId &&
          item.financialTransactionId === financialTransactionId,
      );

      if (!itemExists) return notFound();

      return HttpResponse.json(
        { message: 'Financial transaction items can only be defined during transaction creation.' },
        { status: 400 },
      );
    },
  ),
  http.delete(`/api/financial-transactions/:id/items/:itemId`, ({ params }) => {
    const financialTransactionId = parseId(String(params.id));
    const itemId = parseId(String(params.itemId));
    if (!transactionNotFound(financialTransactionId)) return notFound();

    const itemExists = fixtures.financialTransactionItems.some(
      (item) =>
        item.id === itemId &&
        item.financialTransactionId === financialTransactionId,
    );

    if (!itemExists) return notFound();

    return HttpResponse.json(
      { message: 'Financial transaction items can only be defined during transaction creation.' },
      { status: 400 },
    );
  }),

  http.post(
    `/api/financial-transactions/:id/fulfillments`,
    async ({ params, request }) => {
      const financialTransactionId = parseId(String(params.id));
      if (!transactionNotFound(financialTransactionId)) return notFound();
      const payload =
        (await request.json()) as CreateFinancialTransactionFulfillmentDto;
      const allocations = resolveFulfillmentAllocations(
        financialTransactionId ?? 0,
        payload.amountPaid,
        payload.allocations,
        getTransactionItems(financialTransactionId ?? 0),
      );

      if (!allocations) {
        return HttpResponse.json(
          { message: 'Invalid fulfillment allocations' },
          { status: 400 },
        );
      }

      try {
        validateFulfillment(fixtures, financialTransactionId ?? 0, {
          bankAccountId: payload.bankAccountId,
          paymentDate: payload.paymentDate,
          amountPaid: payload.amountPaid,
        });
      } catch (error) {
        return HttpResponse.json(
          { message: error instanceof Error ? error.message : 'Invalid fulfillment' },
          { status: 400 },
        );
      }

      const created: FinancialTransactionFulfillmentDto = {
        id: nextId(fixtures.financialTransactionFulfillments),
        financialTransactionId: financialTransactionId ?? 0,
        bankAccountId: payload.bankAccountId,
        paymentDate: payload.paymentDate,
        amountPaid: payload.amountPaid,
        allocations,
        observation: payload.observation,
        status: 'ACTIVE',
      };

      fixtures.financialTransactionFulfillments.push(created);
      syncTransaction(financialTransactionId ?? 0);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.patch(
    `/api/financial-transactions/:id/fulfillments/:fulfillmentId`,
    async ({ params, request }) => {
      const financialTransactionId = parseId(String(params.id));
      const fulfillmentId = parseId(String(params.fulfillmentId));
      const payload =
        (await request.json()) as CreateFinancialTransactionFulfillmentDto;
      const index = fixtures.financialTransactionFulfillments.findIndex(
        (item) =>
          item.id === fulfillmentId &&
          item.financialTransactionId === financialTransactionId,
      );

      if (index < 0) return notFound();

      const current = fixtures.financialTransactionFulfillments[index];

      if (fulfillmentCashFieldsChanged(current, payload)) {
        return badRequest(
          'Paid fulfillment cash fields cannot be changed. Use a cancellation adjustment.',
        );
      }

      fixtures.financialTransactionFulfillments[index] = {
        ...current,
        observation: payload.observation,
      };
      syncTransaction(financialTransactionId ?? 0);
      return HttpResponse.json(fixtures.financialTransactionFulfillments[index]);
    },
  ),
  http.delete(
    `/api/financial-transactions/:id/fulfillments/:fulfillmentId`,
    ({ params }) => {
      const financialTransactionId = parseId(String(params.id));
      const fulfillmentId = parseId(String(params.fulfillmentId));
      const fulfillmentExists = fixtures.financialTransactionFulfillments.some(
        (item) =>
          item.id === fulfillmentId &&
          item.financialTransactionId === financialTransactionId,
      );

      if (!fulfillmentExists) return notFound();

      return badRequest(
        'Paid fulfillment cannot be deleted. Use a cancellation adjustment.',
      );
    },
  ),
  http.post(
    `/api/financial-transactions/:id/fulfillments/:fulfillmentId/cancel`,
    async ({ params, request }) => {
      const financialTransactionId = parseId(String(params.id));
      const fulfillmentId = parseId(String(params.fulfillmentId));
      const financialTransaction = transactionNotFound(financialTransactionId);
      if (!financialTransaction) return notFound();

      if (financialTransaction.status === 'CANCELED') {
        return badRequest('Canceled financial transactions cannot be changed.');
      }

      const fulfillment = fixtures.financialTransactionFulfillments.find(
        (item) =>
          item.id === fulfillmentId &&
          item.financialTransactionId === financialTransactionId,
      );

      if (!fulfillment) return notFound();

      const payload =
        await readOptionalJson<CancelFinancialTransactionFulfillmentDto>(request);

      if (!payload?.adjustmentDate) {
        return badRequest('Adjustment date is required.');
      }

      try {
        const adjustment = createFulfillmentAdjustment(fulfillment, payload);
        syncTransaction(financialTransactionId ?? 0);
        return HttpResponse.json(adjustment, { status: 201 });
      } catch (error) {
        return badRequest(
          error instanceof Error ? error.message : 'Invalid fulfillment adjustment',
        );
      }
    },
  ),

  http.post(
    `/api/financial-transactions/:id/attachments`,
    async ({ params, request }) => {
      const financialTransactionId = parseId(String(params.id));
      if (!transactionNotFound(financialTransactionId)) return notFound();
      const { payload, formData } =
        await readPayloadPart<CreateFinancialTransactionAttachmentDto>(request);
      const file = formData?.get('file');
      if (!file) return HttpResponse.json({ message: 'Missing file' }, { status: 400 });

      const created = createAttachmentFromFile(
        financialTransactionId ?? 0,
        payload,
        file,
      );
      fixtures.financialTransactionAttachments.push(created);
      syncTransaction(financialTransactionId ?? 0);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.patch(
    `/api/financial-transactions/:id/attachments/:attachmentId`,
    async ({ params, request }) => {
      const financialTransactionId = parseId(String(params.id));
      const attachmentId = parseId(String(params.attachmentId));
      const payload =
        (await request.json()) as CreateFinancialTransactionAttachmentDto;
      const index = fixtures.financialTransactionAttachments.findIndex(
        (item) =>
          item.id === attachmentId &&
          item.financialTransactionId === financialTransactionId,
      );

      if (index < 0) return notFound();

      fixtures.financialTransactionAttachments[index] = {
        ...fixtures.financialTransactionAttachments[index],
        documentTypeId: payload.documentTypeId,
        observation: payload.observation,
      };
      return HttpResponse.json(fixtures.financialTransactionAttachments[index]);
    },
  ),
  http.put(
    `/api/financial-transactions/:id/attachments/:attachmentId/file`,
    async ({ params, request }) => {
      const financialTransactionId = parseId(String(params.id));
      const attachmentId = parseId(String(params.attachmentId));
      const index = fixtures.financialTransactionAttachments.findIndex(
        (item) =>
          item.id === attachmentId &&
          item.financialTransactionId === financialTransactionId,
      );

      if (index < 0) return notFound();

      const formData = await request.formData();
      const file = formData.get('file');
      const uploadedFile = file instanceof File ? file : undefined;

      fixtures.financialTransactionAttachments[index] = {
        ...fixtures.financialTransactionAttachments[index],
        fileName: uploadedFile?.name ?? fixtures.financialTransactionAttachments[index].fileName,
        declaredContentType:
          uploadedFile?.type ??
          fixtures.financialTransactionAttachments[index].declaredContentType,
        sizeBytes:
          uploadedFile?.size ??
          fixtures.financialTransactionAttachments[index].sizeBytes,
        storagePath: `mock/${financialTransactionId}/${uploadedFile?.name ?? 'anexo'}`,
      };

      return HttpResponse.json(fixtures.financialTransactionAttachments[index]);
    },
  ),
  http.delete(
    `/api/financial-transactions/:id/attachments/:attachmentId`,
    ({ params }) => {
      const financialTransactionId = parseId(String(params.id));
      const attachmentId = parseId(String(params.attachmentId));
      fixtures.financialTransactionAttachments =
        fixtures.financialTransactionAttachments.filter(
          (item) =>
            item.id !== attachmentId ||
            item.financialTransactionId !== financialTransactionId,
        );
      syncTransaction(financialTransactionId ?? 0);
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.get(`/api/bank-transfers`, ({ request }) => {
    const { startDate, endDate } = getDateRange(request);
    const filtered = fixtures.bankTransfers.filter((bankTransfer) =>
      isInDateRange(bankTransfer.transferDate, startDate, endDate),
    );

    return HttpResponse.json(filtered);
  }),
  http.post(`/api/bank-transfers`, async ({ request }) => {
    const payload = (await request.json()) as CreateBankTransferDto;

    try {
      validateBankTransfer(fixtures, payload);
    } catch (error) {
      return HttpResponse.json(
        { message: error instanceof Error ? error.message : 'Invalid bank transfer' },
        { status: 400 },
      );
    }

    const created: BankTransferDto = {
      id: nextId(fixtures.bankTransfers),
      sourceBankAccountId: payload.sourceBankAccountId,
      destinationBankAccountId: payload.destinationBankAccountId,
      amount: payload.amount,
      transferDate: payload.transferDate,
      observation: payload.observation,
      status: 'ACTIVE',
    };
    fixtures.bankTransfers.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(`/api/bank-transfers/:id`, async ({ params, request }) => {
    const id = parseId(String(params.id));
    const payload = (await request.json()) as CreateBankTransferDto;
    const index = fixtures.bankTransfers.findIndex((item) => item.id === id);

    if (index < 0) return notFound();

    const current = fixtures.bankTransfers[index];
    const cashFieldsChanged =
      current.sourceBankAccountId !== payload.sourceBankAccountId ||
      current.destinationBankAccountId !== payload.destinationBankAccountId ||
      Math.abs(roundCurrency(current.amount - payload.amount)) > 0.009 ||
      current.transferDate !== payload.transferDate;

    if (cashFieldsChanged) {
      return badRequest(
        'Bank transfer cash fields cannot be changed. Use a cancellation adjustment.',
      );
    }

    fixtures.bankTransfers[index] = {
      ...current,
      observation: payload.observation,
    };

    return HttpResponse.json(fixtures.bankTransfers[index]);
  }),
  http.delete(`/api/bank-transfers/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    const bankTransferExists = fixtures.bankTransfers.some((item) => item.id === id);

    if (!bankTransferExists) return notFound();

    return badRequest(
      'Bank transfer cannot be deleted. Use a cancellation adjustment.',
    );
  }),
  http.post(`/api/bank-transfers/:id/cancel`, async ({ params, request }) => {
    const id = parseId(String(params.id));
    const original = fixtures.bankTransfers.find((item) => item.id === id);

    if (!original) return notFound();

    if ((original.status ?? 'ACTIVE') !== 'ACTIVE') {
      return badRequest('Only active bank transfers can be canceled.');
    }

    const payload = await readOptionalJson<CancelBankTransferDto>(request);

    if (!payload?.adjustmentDate) {
      return badRequest('Adjustment date is required.');
    }

    try {
      validateBankTransferAdjustment(fixtures, original, payload.adjustmentDate);
    } catch (error) {
      return badRequest(
        error instanceof Error ? error.message : 'Invalid bank transfer adjustment',
      );
    }

    const adjustment: BankTransferDto = {
      id: nextId(fixtures.bankTransfers),
      sourceBankAccountId: original.destinationBankAccountId,
      destinationBankAccountId: original.sourceBankAccountId,
      amount: original.amount,
      transferDate: payload.adjustmentDate,
      observation: payload.observation,
      status: 'ADJUSTMENT',
      cancelId: original.id,
    };

    original.status = 'CANCELED';
    fixtures.bankTransfers.push(adjustment);
    return HttpResponse.json(adjustment, { status: 201 });
  }),
];
