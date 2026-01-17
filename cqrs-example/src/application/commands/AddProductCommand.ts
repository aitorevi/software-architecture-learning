/**
 * CQRS EXAMPLE - Add Product Command
 *
 * CQRS KEY CONCEPT:
 * Commands are objects that represent an INTENTION to change the system state.
 * They are named in imperative form: "AddProduct", "UpdateStock", "RemoveProduct"
 *
 * Commands:
 * - Describe WHAT the user wants to do
 * - Contain all data needed to perform the action
 * - Are handled by exactly ONE handler
 * - May be rejected (validation, business rules)
 * - Result in events being emitted
 *
 * Commands vs Queries:
 * - Commands CHANGE state, Queries READ state
 * - Commands can fail (validation), Queries always succeed
 * - Commands emit events, Queries don't
 */

export interface AddProductCommand {
  readonly type: 'AddProduct';
  readonly sku: string;
  readonly name: string;
  readonly description?: string;
  readonly initialQuantity: number;
  readonly priceInCents: number;
  readonly currency?: string;
  readonly lowStockThreshold?: number;
}

export function createAddProductCommand(
  params: Omit<AddProductCommand, 'type'>
): AddProductCommand {
  return {
    type: 'AddProduct',
    ...params,
  };
}
