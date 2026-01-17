-- Library System Database Schema
-- Run this script to initialize the database

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(36) PRIMARY KEY,
    isbn VARCHAR(17) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_book_status CHECK (status IN ('AVAILABLE', 'BORROWED'))
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(36) PRIMARY KEY,
    book_id VARCHAR(36) NOT NULL REFERENCES books(id),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    start_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    returned_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_loan_status CHECK (status IN ('ACTIVE', 'RETURNED', 'OVERDUE'))
);

-- Penalties table
CREATE TABLE IF NOT EXISTS penalties (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    loan_id VARCHAR(36) NOT NULL REFERENCES loans(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    days_overdue INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_book_id ON loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_penalties_user_id ON penalties(user_id);
