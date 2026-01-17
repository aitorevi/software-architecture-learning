/**
 * DTOs para User
 */

export interface RegisterUserCommand {
  email: string;
  name: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  activeLoansCount: number;
  hasPenalties: boolean;
  createdAt: string;
}

export interface UserDetailResponse extends UserResponse {
  activeLoans: {
    loanId: string;
    bookId: string;
    dueDate: string;
    isOverdue: boolean;
  }[];
  penalties: {
    daysOverdue: number;
    endDate: string;
    isActive: boolean;
  }[];
}
