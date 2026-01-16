import { describe, it, expect, beforeEach } from 'vitest';
import {
  Book,
  BookStatus,
  User,
  Loan,
  LoanStatus,
  BookId,
  UserId,
  LoanId,
  ISBN,
  Email,
  UserExceedLoanLimitException,
  UserHasPenaltiesException,
  BookNotAvailableException,
} from '../../../src/domain';

describe('Entities', () => {
  describe('Book', () => {
    it('should create a new book with AVAILABLE status', () => {
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-596-52068-7'),
        title: 'Test Book',
        author: 'Test Author',
      });

      expect(book.status).toBe(BookStatus.AVAILABLE);
      expect(book.isAvailable()).toBe(true);
    });

    it('should emit BookRegisteredEvent when created', () => {
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-596-52068-7'),
        title: 'Test Book',
        author: 'Test Author',
      });

      const events = book.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('book.registered');
    });

    it('should change status when borrowed', () => {
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-596-52068-7'),
        title: 'Test Book',
        author: 'Test Author',
      });

      book.markAsBorrowed();
      expect(book.status).toBe(BookStatus.BORROWED);
      expect(book.isAvailable()).toBe(false);
    });

    it('should throw when trying to borrow unavailable book', () => {
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-596-52068-7'),
        title: 'Test Book',
        author: 'Test Author',
      });

      book.markAsBorrowed();
      expect(() => book.markAsBorrowed()).toThrow(BookNotAvailableException);
    });
  });

  describe('User', () => {
    let user: User;

    beforeEach(() => {
      user = User.create({
        id: UserId.create('user-1'),
        email: Email.create('test@example.com'),
        name: 'Test User',
      });
    });

    it('should create a new user without loans or penalties', () => {
      expect(user.activeLoans).toHaveLength(0);
      expect(user.hasPenalties()).toBe(false);
      expect(user.canBorrowBook()).toBe(true);
    });

    it('should emit UserRegisteredEvent when created', () => {
      const events = user.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('user.registered');
    });

    it('should allow borrowing up to 3 books', () => {
      // Using valid ISBN-13s
      const validIsbns = [
        '978-0-596-52068-7',
        '978-0-321-12521-7',
        '978-0-13-468599-1',
      ];

      for (let i = 0; i < 3; i++) {
        const book = Book.create({
          id: BookId.create(`book-${i + 1}`),
          isbn: ISBN.create(validIsbns[i]),
          title: `Book ${i + 1}`,
          author: 'Author',
        });

        user.borrowBook(book, LoanId.create(`loan-${i + 1}`));
      }

      expect(user.activeLoans).toHaveLength(3);
      expect(user.canBorrowBook()).toBe(false);
    });

    it('should throw UserExceedLoanLimitException when exceeding 3 books', () => {
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

      // Try to borrow 4th book
      const book4 = Book.create({
        id: BookId.create('book-4'),
        isbn: ISBN.create(validIsbns[3]),
        title: 'Book 4',
        author: 'Author',
      });

      expect(() => user.borrowBook(book4, LoanId.create('loan-4'))).toThrow(
        UserExceedLoanLimitException
      );
    });

    it('should return book and create penalty for late return', () => {
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-596-52068-7'),
        title: 'Test Book',
        author: 'Author',
      });

      user.borrowBook(book, LoanId.create('loan-1'));

      // Simulate returning 5 days late
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + 20); // 14 days + 6 overdue

      const { loan, penalty } = user.returnBook(book.id, book, returnDate);

      expect(loan.status).toBe(LoanStatus.RETURNED);
      expect(book.isAvailable()).toBe(true);
      expect(penalty).not.toBeNull();
      expect(penalty!.daysOverdue).toBeGreaterThan(0);
    });
  });

  describe('Loan', () => {
    it('should create loan with 14-day period', () => {
      const loan = Loan.create({
        id: LoanId.create('loan-1'),
        bookId: BookId.create('book-1'),
        userId: UserId.create('user-1'),
      });

      const expectedDays = 14;
      const actualDays = loan.loanPeriod.getDurationInDays();

      expect(actualDays).toBe(expectedDays);
      expect(loan.status).toBe(LoanStatus.ACTIVE);
    });

    it('should emit BookLoanedEvent when created', () => {
      const loan = Loan.create({
        id: LoanId.create('loan-1'),
        bookId: BookId.create('book-1'),
        userId: UserId.create('user-1'),
      });

      const events = loan.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('book.loaned');
    });

    it('should detect overdue status', () => {
      const loan = Loan.create({
        id: LoanId.create('loan-1'),
        bookId: BookId.create('book-1'),
        userId: UserId.create('user-1'),
      });

      // Check status today (not overdue)
      expect(loan.isOverdue()).toBe(false);

      // Check status 20 days from now (overdue)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);
      expect(loan.isOverdue(futureDate)).toBe(true);
    });
  });
});
