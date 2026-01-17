import { describe, it, expect } from 'vitest';
import {
  PenaltyCalculator,
  LoanValidator,
  User,
  Book,
  UserId,
  BookId,
  LoanId,
  ISBN,
  Email,
} from '../../../src/domain';

describe('Domain Services', () => {
  describe('PenaltyCalculator', () => {
    const calculator = new PenaltyCalculator();

    it('should calculate 0 penalty days for no delay', () => {
      expect(calculator.calculatePenaltyDays(0)).toBe(0);
    });

    it('should calculate 2 penalty days per overdue day', () => {
      expect(calculator.calculatePenaltyDays(1)).toBe(2);
      expect(calculator.calculatePenaltyDays(5)).toBe(10);
      expect(calculator.calculatePenaltyDays(10)).toBe(20);
    });

    it('should calculate monetary penalty', () => {
      // 0.50 EUR per day overdue
      const penalty = calculator.calculateMonetaryPenalty(5);
      expect(penalty.getAmount()).toBe(2.5); // 5 days * 0.50
      expect(penalty.getCurrency()).toBe('EUR');
    });

    it('should return zero money for no overdue', () => {
      const penalty = calculator.calculateMonetaryPenalty(0);
      expect(penalty.isZero()).toBe(true);
    });

    it('should calculate days overdue correctly', () => {
      const dueDate = new Date('2024-01-15');
      const returnDate = new Date('2024-01-20');
      expect(calculator.calculateDaysOverdue(dueDate, returnDate)).toBe(5);
    });

    it('should return 0 if returned on time', () => {
      const dueDate = new Date('2024-01-15');
      const returnDate = new Date('2024-01-10');
      expect(calculator.calculateDaysOverdue(dueDate, returnDate)).toBe(0);
    });
  });

  describe('LoanValidator', () => {
    const validator = new LoanValidator();

    it('should validate loan for eligible user and available book', () => {
      const user = User.create({
        id: UserId.create('user-1'),
        email: Email.create('test@example.com'),
        name: 'Test User',
      });
      // Clear domain events
      user.pullDomainEvents();

      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-596-52068-7'),
        title: 'Test Book',
        author: 'Author',
      });

      const result = validator.validateLoan(user, book);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject loan for unavailable book', () => {
      const user = User.create({
        id: UserId.create('user-1'),
        email: Email.create('test@example.com'),
        name: 'Test User',
      });

      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-596-52068-7'),
        title: 'Test Book',
        author: 'Author',
      });
      book.markAsBorrowed();

      const result = validator.validateLoan(user, book);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Book is not available for loan');
    });

    it('should reject loan for user at loan limit', () => {
      const user = User.create({
        id: UserId.create('user-1'),
        email: Email.create('test@example.com'),
        name: 'Test User',
      });

      // Using valid ISBN-13s
      const validIsbns = [
        '978-0-596-52068-7',
        '978-0-321-12521-7',
        '978-0-13-468599-1',
        '978-0-201-63361-0', // 4th book
      ];

      // Borrow 3 books
      for (let i = 0; i < 3; i++) {
        const book = Book.create({
          id: BookId.create(`book-${i + 1}`),
          isbn: ISBN.create(validIsbns[i]),
          title: `Book ${i + 1}`,
          author: 'Author',
        });
        user.borrowBook(book, LoanId.create(`loan-${i + 1}`));
      }

      const newBook = Book.create({
        id: BookId.create('book-4'),
        isbn: ISBN.create(validIsbns[3]),
        title: 'Book 4',
        author: 'Author',
      });

      const result = validator.validateLoan(user, newBook);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('maximum loan limit'))).toBe(true);
    });

    it('should calculate remaining loan capacity', () => {
      const user = User.create({
        id: UserId.create('user-1'),
        email: Email.create('test@example.com'),
        name: 'Test User',
      });

      expect(validator.getRemainingLoanCapacity(user)).toBe(3);

      // Borrow one book
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-596-52068-7'),
        title: 'Test Book',
        author: 'Author',
      });
      user.borrowBook(book, LoanId.create('loan-1'));

      expect(validator.getRemainingLoanCapacity(user)).toBe(2);
    });
  });
});
