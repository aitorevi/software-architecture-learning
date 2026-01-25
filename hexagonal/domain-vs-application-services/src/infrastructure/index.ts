/**
 * Main - Punto de entrada de la aplicación
 *
 * Aquí ensamblamos todas las piezas:
 * - Repositorios
 * - Servicios
 * - Casos de uso
 * - Controladores
 * - Servidor HTTP
 */

import express from 'express';
import { InMemoryAccountRepository } from './persistence/InMemoryAccountRepository.js';
import { MoneyTransferService } from '../domain/services/MoneyTransferService.js';
import { TransferMoneyUseCase } from '../application/use-cases/TransferMoneyUseCase.js';
import { TransferController } from './http/TransferController.js';
import { AccountController } from './http/AccountController.js';
import { Account } from '../domain/entities/Account.js';
import { Money } from '../domain/value-objects/Money.js';

// ========================================
// Dependency Injection Manual
// ========================================

// Repositorios
const accountRepository = new InMemoryAccountRepository();

// Domain Services
const transferService = new MoneyTransferService();

// Application Services
const transferUseCase = new TransferMoneyUseCase(
  accountRepository,
  transferService
  // notificationService y eventPublisher son opcionales
);

// Controllers
const transferController = new TransferController(transferUseCase);
const accountController = new AccountController(accountRepository);

// ========================================
// Express App
// ========================================

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'domain-vs-application-services' });
});

// Account endpoints
app.post('/accounts', (req, res) => accountController.create(req, res));
app.get('/accounts', (req, res) => accountController.getAll(req, res));
app.get('/accounts/:id', (req, res) => accountController.getById(req, res));

// Transfer endpoint
app.post('/transfers', (req, res) => transferController.transfer(req, res));

// ========================================
// Seed Data (para demos)
// ========================================

async function seedData() {
  const account1 = Account.create(
    'account-1',
    'Juan Pérez',
    Money.create(1000, 'EUR')
  );

  const account2 = Account.create(
    'account-2',
    'María García',
    Money.create(500, 'EUR')
  );

  await accountRepository.save(account1);
  await accountRepository.save(account2);

  console.log('✅ Seed data created:');
  console.log(`   - Account 1: ${account1.getId()} (${account1.getBalance().toString()})`);
  console.log(`   - Account 2: ${account2.getId()} (${account2.getBalance().toString()})`);
}

// ========================================
// Start Server
// ========================================

const PORT = 3000;

seedData().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`\n📖 Try these commands:`);
    console.log(`   curl http://localhost:${PORT}/accounts`);
    console.log(`   curl -X POST http://localhost:${PORT}/transfers \\`);
    console.log(`        -H "Content-Type: application/json" \\`);
    console.log(`        -d '{"fromAccountId":"account-1","toAccountId":"account-2","amount":100}'`);
    console.log('');
  });
});
