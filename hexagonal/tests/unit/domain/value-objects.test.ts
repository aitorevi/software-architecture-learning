import { describe, it, expect } from 'vitest';
import { ISBN, Email, Money, DateRange, UserId, BookId } from '../../../src/domain';

describe('Value Objects', () => {
  describe('ISBN', () => {
    it('should create valid ISBN-13', () => {
      const isbn = ISBN.create('978-0-596-52068-7');
      expect(isbn.getValue()).toBe('978-0-596-52068-7');
    });

    it('should create valid ISBN-10', () => {
      const isbn = ISBN.create('0-596-52068-9');
      expect(isbn.getValue()).toBe('0-596-52068-9');
    });

    it('should throw for invalid ISBN', () => {
      expect(() => ISBN.create('invalid-isbn')).toThrow('Invalid ISBN format');
    });

    it('should compare ISBNs correctly', () => {
      const isbn1 = ISBN.create('978-0-596-52068-7');
      const isbn2 = ISBN.create('9780596520687'); // Same without hyphens
      expect(isbn1.equals(isbn2)).toBe(true);
    });
  });

  describe('Email', () => {
    it('should create valid email', () => {
      const email = Email.create('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should normalize to lowercase', () => {
      const email = Email.create('Test@EXAMPLE.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw for invalid email', () => {
      expect(() => Email.create('invalid-email')).toThrow('Invalid email format');
    });

    it('should extract domain', () => {
      const email = Email.create('test@example.com');
      expect(email.getDomain()).toBe('example.com');
    });
  });

  describe('Money', () => {
    it('should create money from decimal amount', () => {
      const money = Money.create(10.5, 'EUR');
      expect(money.getAmount()).toBe(10.5);
      expect(money.getCurrency()).toBe('EUR');
    });

    it('should add money values', () => {
      const money1 = Money.create(10, 'EUR');
      const money2 = Money.create(5.5, 'EUR');
      const result = money1.add(money2);
      expect(result.getAmount()).toBe(15.5);
    });

    it('should throw when adding different currencies', () => {
      const money1 = Money.create(10, 'EUR');
      const money2 = Money.create(5, 'USD');
      expect(() => money1.add(money2)).toThrow('different currencies');
    });

    it('should multiply correctly', () => {
      const money = Money.create(10, 'EUR');
      const result = money.multiply(3);
      expect(result.getAmount()).toBe(30);
    });

    it('should format to string', () => {
      const money = Money.create(10.5, 'EUR');
      expect(money.toString()).toBe('10.50 EUR');
    });
  });

  describe('DateRange', () => {
    it('should create valid date range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-15');
      const range = DateRange.create(start, end);
      expect(range.getDurationInDays()).toBe(14);
    });

    it('should throw if start is after end', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-01');
      expect(() => DateRange.create(start, end)).toThrow('Start date cannot be after end date');
    });

    it('should calculate days overdue', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-15');
      const range = DateRange.create(start, end);
      const checkDate = new Date('2024-01-20');
      expect(range.getDaysOverdue(checkDate)).toBe(5);
    });

    it('should return 0 days overdue if not expired', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-15');
      const range = DateRange.create(start, end);
      const checkDate = new Date('2024-01-10');
      expect(range.getDaysOverdue(checkDate)).toBe(0);
    });
  });

  describe('UserId', () => {
    it('should create valid user id', () => {
      const id = UserId.create('user-123');
      expect(id.getValue()).toBe('user-123');
    });

    it('should throw for empty id', () => {
      expect(() => UserId.create('')).toThrow('cannot be empty');
    });

    it('should compare ids correctly', () => {
      const id1 = UserId.create('user-123');
      const id2 = UserId.create('user-123');
      const id3 = UserId.create('user-456');
      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });
});
