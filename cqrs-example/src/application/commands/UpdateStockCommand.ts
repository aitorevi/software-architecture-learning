/**
 * CQRS EXAMPLE - Update Stock Commands
 *
 * Stock updates are separated into specific commands:
 * - IncreaseStock: Adding inventory (receiving shipment)
 * - DecreaseStock: Removing inventory (sales, damage, adjustments)
 *
 * Why separate commands instead of "UpdateStock"?
 * - Clearer intent in the command name
 * - Different validation rules can apply
 * - Audit trail shows exactly what happened
 * - Event-sourcing friendly (events match commands)
 */

export interface IncreaseStockCommand {
  readonly type: 'IncreaseStock';
  readonly productId: string;
  readonly quantity: number;
  readonly reason: string; // e.g., "Shipment received", "Inventory correction"
}

export interface DecreaseStockCommand {
  readonly type: 'DecreaseStock';
  readonly productId: string;
  readonly quantity: number;
  readonly reason: string; // e.g., "Sold", "Damaged", "Theft", "Adjustment"
}

export function createIncreaseStockCommand(
  params: Omit<IncreaseStockCommand, 'type'>
): IncreaseStockCommand {
  return {
    type: 'IncreaseStock',
    ...params,
  };
}

export function createDecreaseStockCommand(
  params: Omit<DecreaseStockCommand, 'type'>
): DecreaseStockCommand {
  return {
    type: 'DecreaseStock',
    ...params,
  };
}
