import { BaseDomainEvent } from './DomainEvent';

/**
 * CQRS EXAMPLE - Product Domain Events
 *
 * In CQRS, domain events play a crucial role:
 * - Commands modify the write model and emit events
 * - Events are used to update the read model(s)
 * - This enables eventual consistency between read and write models
 */

export class ProductAddedEvent extends BaseDomainEvent {
  readonly eventName = 'inventory.product.added';

  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly name: string,
    public readonly initialQuantity: number,
    public readonly priceInCents: number
  ) {
    super();
  }
}

export class StockIncreasedEvent extends BaseDomainEvent {
  readonly eventName = 'inventory.stock.increased';

  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly newTotal: number,
    public readonly reason: string
  ) {
    super();
  }
}

export class StockDecreasedEvent extends BaseDomainEvent {
  readonly eventName = 'inventory.stock.decreased';

  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly newTotal: number,
    public readonly reason: string
  ) {
    super();
  }
}

export class LowStockAlertEvent extends BaseDomainEvent {
  readonly eventName = 'inventory.stock.low';

  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly currentQuantity: number,
    public readonly threshold: number
  ) {
    super();
  }
}

export class ProductPriceUpdatedEvent extends BaseDomainEvent {
  readonly eventName = 'inventory.product.price_updated';

  constructor(
    public readonly productId: string,
    public readonly oldPriceInCents: number,
    public readonly newPriceInCents: number
  ) {
    super();
  }
}
