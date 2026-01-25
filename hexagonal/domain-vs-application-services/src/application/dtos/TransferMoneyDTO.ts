/**
 * DTOs (Data Transfer Objects)
 *
 * Representan los datos que entran y salen de la capa de aplicación.
 * Son "tontos", sin lógica de negocio.
 */

export interface TransferMoneyCommand {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency?: string; // Opcional, por defecto EUR
}

export interface TransferResult {
  success: boolean;
  message: string;
  transactionId?: string;
  fromAccountBalance?: number;
  toAccountBalance?: number;
}

export interface AccountDTO {
  id: string;
  holderName: string;
  balance: number;
  currency: string;
}
