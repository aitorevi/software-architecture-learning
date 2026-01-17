/**
 * CQRS EXAMPLE - Remove Product Command
 */

export interface RemoveProductCommand {
  readonly type: 'RemoveProduct';
  readonly productId: string;
}

export function createRemoveProductCommand(
  params: Omit<RemoveProductCommand, 'type'>
): RemoveProductCommand {
  return {
    type: 'RemoveProduct',
    ...params,
  };
}
