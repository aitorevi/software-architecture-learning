/**
 * CQRS EXAMPLE - Update Price Command
 */

export interface UpdatePriceCommand {
  readonly type: 'UpdatePrice';
  readonly productId: string;
  readonly newPriceInCents: number;
  readonly currency?: string;
}

export function createUpdatePriceCommand(
  params: Omit<UpdatePriceCommand, 'type'>
): UpdatePriceCommand {
  return {
    type: 'UpdatePrice',
    ...params,
  };
}
