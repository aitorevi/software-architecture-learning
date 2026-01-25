/**
 * TransferController - Adaptador de Entrada (HTTP)
 *
 * Recibe requests HTTP y delega al Application Service.
 * Convierte entre HTTP y el modelo de aplicación.
 */

import { Request, Response } from 'express';
import { TransferMoneyUseCase } from '../../application/use-cases/TransferMoneyUseCase.js';
import { TransferMoneyCommand } from '../../application/dtos/TransferMoneyDTO.js';

export class TransferController {
  constructor(private readonly transferUseCase: TransferMoneyUseCase) {}

  async transfer(req: Request, res: Response): Promise<void> {
    try {
      const command: TransferMoneyCommand = {
        fromAccountId: req.body.fromAccountId,
        toAccountId: req.body.toAccountId,
        amount: parseFloat(req.body.amount),
        currency: req.body.currency || 'EUR',
      };

      // Validación básica
      if (!command.fromAccountId || !command.toAccountId) {
        res.status(400).json({
          error: 'fromAccountId and toAccountId are required',
        });
        return;
      }

      if (isNaN(command.amount) || command.amount <= 0) {
        res.status(400).json({
          error: 'amount must be a positive number',
        });
        return;
      }

      // Ejecutar caso de uso
      const result = await this.transferUseCase.execute(command);

      res.status(200).json(result);
    } catch (error) {
      console.error('Transfer error:', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }
}
