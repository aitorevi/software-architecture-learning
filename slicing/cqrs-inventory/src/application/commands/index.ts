import { AddProductCommand } from './AddProductCommand';
import { IncreaseStockCommand, DecreaseStockCommand } from './UpdateStockCommand';
import { UpdatePriceCommand } from './UpdatePriceCommand';
import { RemoveProductCommand } from './RemoveProductCommand';

export {
  AddProductCommand,
  createAddProductCommand,
} from './AddProductCommand';

export {
  IncreaseStockCommand,
  DecreaseStockCommand,
  createIncreaseStockCommand,
  createDecreaseStockCommand,
} from './UpdateStockCommand';

export {
  UpdatePriceCommand,
  createUpdatePriceCommand,
} from './UpdatePriceCommand';

export {
  RemoveProductCommand,
  createRemoveProductCommand,
} from './RemoveProductCommand';

/**
 * Union type of all commands
 */
export type Command =
  | AddProductCommand
  | IncreaseStockCommand
  | DecreaseStockCommand
  | UpdatePriceCommand
  | RemoveProductCommand;
