import { describe, it, expect, beforeEach } from 'vitest';
import {
  RegisterBookUseCase,
  RegisterUserUseCase,
  LoanBookUseCase,
  ReturnBookUseCase,
  GetAvailableBooksUseCase,
} from '../../../src/application';
import {
  FakeBookRepository,
  FakeUserRepository,
  FakeLoanRepository,
  FakeIdGenerator,
} from '../fakes';
import {
  Book,
  User,
  BookId,
  UserId,
  ISBN,
  Email,
  UserNotFoundException,
  BookNotFoundException,
  UserExceedLoanLimitException,
} from '../../../src/domain';

describe('Use Cases', () => {
  let bookRepository: FakeBookRepository;
  let userRepository: FakeUserRepository;
  let loanRepository: FakeLoanRepository;
  let idGenerator: FakeIdGenerator;

  beforeEach(() => {
    bookRepository = new FakeBookRepository();
    userRepository = new FakeUserRepository();
    loanRepository = new FakeLoanRepository();
    idGenerator = new FakeIdGenerator();
  });

  describe('RegisterBookUseCase', () => {
    it('should register a new book', async () => {
      const useCase = new RegisterBookUseCase(bookRepository, idGenerator);

      const result = await useCase.execute({
        isbn: '978-0-596-52068-7',
        title: 'Test Book',
        author: 'Test Author',
      });

      expect(result.id).toBe('test-1');
      expect(result.title).toBe('Test Book');
      expect(result.status).toBe('AVAILABLE');
      expect(bookRepository.count()).toBe(1);
    });

    it('should reject duplicate ISBN', async () => {
      const useCase = new RegisterBookUseCase(bookRepository, idGenerator);

      await useCase.execute({
        isbn: '978-0-596-52068-7',
        title: 'Test Book',
        author: 'Test Author',
      });

      await expect(
        useCase.execute({
          isbn: '978-0-596-52068-7',
          title: 'Another Book',
          author: 'Another Author',
        })
      ).rejects.toThrow('already exists');
    });
  });

  describe('RegisterUserUseCase', () => {
    it('should register a new user', async () => {
      const useCase = new RegisterUserUseCase(userRepository, idGenerator);

      const result = await useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(result.id).toBe('test-1');
      expect(result.email).toBe('test@example.com');
      expect(result.activeLoansCount).toBe(0);
      expect(userRepository.count()).toBe(1);
    });

    it('should reject duplicate email', async () => {
      const useCase = new RegisterUserUseCase(userRepository, idGenerator);

      await useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
      });

      await expect(
        useCase.execute({
          email: 'test@example.com',
          name: 'Another User',
        })
      ).rejects.toThrow('already exists');
    });
  });

  describe('LoanBookUseCase', () => {
    let loanUseCase: LoanBookUseCase;

    beforeEach(async () => {
      loanUseCase = new LoanBookUseCase(
        userRepository,
        bookRepository,
        loanRepository,
        idGenerator
      );

      // Create a user
      const user = User.create({
        id: UserId.create('user-1'),
        email: Email.create('test@example.com'),
        name: 'Test User',
      });
      await userRepository.save(user);

      // Create a book
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-596-52068-7'),
        title: 'Test Book',
        author: 'Author',
      });
      await bookRepository.save(book);
    });

    it('should loan a book to user', async () => {
      const result = await loanUseCase.execute({
        userId: 'user-1',
        bookId: 'book-1',
      });

      expect(result.userId).toBe('user-1');
      expect(result.bookId).toBe('book-1');
      expect(result.status).toBe('ACTIVE');

      // Book should be marked as borrowed
      const book = await bookRepository.findById(BookId.create('book-1'));
      expect(book?.isAvailable()).toBe(false);

      // Loan should be saved
      expect(loanRepository.count()).toBe(1);
    });

    it('should throw when user not found', async () => {
      await expect(
        loanUseCase.execute({
          userId: 'non-existent',
          bookId: 'book-1',
        })
      ).rejects.toThrow(UserNotFoundException);
    });

    it('should throw when book not found', async () => {
      await expect(
        loanUseCase.execute({
          userId: 'user-1',
          bookId: 'non-existent',
        })
      ).rejects.toThrow(BookNotFoundException);
    });

    it('should throw when user exceeds loan limit', async () => {
      // Using valid ISBN-13s
      const validIsbns = [
        '978-0-321-12521-7',
        '978-0-13-468599-1',
        '978-0-201-63361-0',
      ];

      // Create 3 more books and loan them
      for (let i = 0; i < 3; i++) {
        const book = Book.create({
          id: BookId.create(`book-${i + 2}`),
          isbn: ISBN.create(validIsbns[i]),
          title: `Book ${i + 2}`,
          author: 'Author',
        });
        await bookRepository.save(book);
      }

      // Loan 3 books
      await loanUseCase.execute({ userId: 'user-1', bookId: 'book-1' });

      // Reset idGenerator for subsequent loans
      const loanUseCase2 = new LoanBookUseCase(
        userRepository,
        bookRepository,
        loanRepository,
        new FakeIdGenerator('loan')
      );

      await loanUseCase2.execute({ userId: 'user-1', bookId: 'book-2' });
      await loanUseCase2.execute({ userId: 'user-1', bookId: 'book-3' });

      // 4th loan should fail
      await expect(
        loanUseCase2.execute({ userId: 'user-1', bookId: 'book-4' })
      ).rejects.toThrow(UserExceedLoanLimitException);
    });
  });

  describe('ReturnBookUseCase', () => {
    it('should return a book', async () => {
      // Setup
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

      await userRepository.save(user);
      await bookRepository.save(book);

      // Loan the book
      const loanUseCase = new LoanBookUseCase(
        userRepository,
        bookRepository,
        loanRepository,
        idGenerator
      );
      await loanUseCase.execute({ userId: 'user-1', bookId: 'book-1' });

      // Return the book
      const returnUseCase = new ReturnBookUseCase(
        userRepository,
        bookRepository,
        loanRepository
      );
      const result = await returnUseCase.execute({
        userId: 'user-1',
        bookId: 'book-1',
      });

      expect(result.loan.status).toBe('RETURNED');
      expect(result.penalty).toBeNull(); // No penalty for on-time return

      // Book should be available again
      const updatedBook = await bookRepository.findById(BookId.create('book-1'));
      expect(updatedBook?.isAvailable()).toBe(true);
    });
  });

  describe('GetAvailableBooksUseCase', () => {
    it('should return only available books', async () => {
      // Create books
      const book1 = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-596-52068-7'),
        title: 'Available Book',
        author: 'Author',
      });
      const book2 = Book.create({
        id: BookId.create('book-2'),
        isbn: ISBN.create('978-0-596-52069-4'),
        title: 'Borrowed Book',
        author: 'Author',
      });
      book2.markAsBorrowed();

      await bookRepository.save(book1);
      await bookRepository.save(book2);

      const useCase = new GetAvailableBooksUseCase(bookRepository);
      const result = await useCase.execute();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Available Book');
    });
  });
});
