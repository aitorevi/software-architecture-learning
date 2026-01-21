import { BaseIntegrationEvent } from './IntegrationEvent';

/**
 * Integration events published by the Catalog context
 */

export class ProductCreatedIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'catalog.product.created';
  readonly sourceContext = 'catalog';

  constructor(
    public readonly productId: string,
    public readonly name: string,
    public readonly priceInCents: number,
    public readonly currency: string
  ) {
    super();
  }
}

export class ProductPriceChangedIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'catalog.product.price_changed';
  readonly sourceContext = 'catalog';

  constructor(
    public readonly productId: string,
    public readonly newPriceInCents: number,
    public readonly currency: string
  ) {
    super();
  }
}

export class ProductDiscontinuedIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'catalog.product.discontinued';
  readonly sourceContext = 'catalog';

  constructor(public readonly productId: string) {
    super();
  }
}
