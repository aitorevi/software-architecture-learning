/**
 * DTOs para Loan
 */

export interface LoanBookCommand {
  userId: string;
  bookId: string;
}

export interface ReturnBookCommand {
  userId: string;
  bookId: string;
}

export interface LoanResponse {
  id: string;
  bookId: string;
  userId: string;
  startDate: string;
  dueDate: string;
  status: string;
  returnedAt: string | null;
  daysOverdue: number;
}

export interface LoanResultResponse {
  loan: LoanResponse;
  penalty: {
    daysOverdue: number;
    endDate: string;
  } | null;
}
