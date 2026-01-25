/**
 * AccountController - Gestión de Cuentas
 *
 * Endpoints para crear y consultar cuentas (para el ejemplo)
 */

import { Request, Response } from 'express';
import { AccountRepository } from '../../domain/repositories/AccountRepository.js';
import { Account } from '../../domain/entities/Account.js';
import { Money } from '../../domain/value-objects/Money.js';
import { v4 as uuid } from 'uuid';

export class AccountController {
  constructor(private readonly accountRepository: AccountRepository) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { holderName, initialBalance, currency } = req.body;

      if (!holderName) {
        res.status(400).json({ error: 'holderName is required' });
        return;
      }

      const balance = Money.create(
        parseFloat(initialBalance) || 0,
        currency || 'EUR'
      );

      const account = Account.create(uuid(), holderName, balance);

      await this.accountRepository.save(account);

      res.status(201).json({
        id: account.getId(),
        holderName: account.getHolderName(),
        balance: account.getBalance().getAmount(),
        currency: account.getBalance().getCurrency(),
      });
    } catch (error) {
      console.error('Create account error:', error);

      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const account = await this.accountRepository.findById(id);

      if (!account) {
        res.status(404).json({ error: 'Account not found' });
        return;
      }

      res.status(200).json({
        id: account.getId(),
        holderName: account.getHolderName(),
        balance: account.getBalance().getAmount(),
        currency: account.getBalance().getCurrency(),
      });
    } catch (error) {
      console.error('Get account error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const accounts = await this.accountRepository.findAll();

      res.status(200).json(
        accounts.map(account => ({
          id: account.getId(),
          holderName: account.getHolderName(),
          balance: account.getBalance().getAmount(),
          currency: account.getBalance().getCurrency(),
        }))
      );
    } catch (error) {
      console.error('Get all accounts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
