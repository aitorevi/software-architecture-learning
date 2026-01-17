import {
  UserRepository,
  User,
  UserId,
  Email,
  UserProps,
  Loan,
  LoanProps,
  LoanId,
  BookId,
  DateRange,
  LoanStatus,
  Penalty,
  PenaltyProps,
} from '../../../domain';

/**
 * InMemoryUserRepository
 *
 * Implementación en memoria del repositorio de usuarios.
 *
 * Nota: El User es un agregado que incluye préstamos activos y penalizaciones.
 * Este repositorio persiste todo el agregado junto.
 */

interface StoredUserData {
  props: {
    id: UserId;
    email: Email;
    name: string;
    createdAt: Date;
  };
  activeLoans: LoanProps[];
  penalties: PenaltyProps[];
}

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, StoredUserData> = new Map();

  async save(user: User): Promise<void> {
    const data: StoredUserData = {
      props: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      activeLoans: user.activeLoans.map((loan) => ({
        id: loan.id,
        bookId: loan.bookId,
        userId: loan.userId,
        loanPeriod: loan.loanPeriod,
        status: loan.status,
        returnedAt: loan.returnedAt,
        createdAt: loan.createdAt,
      })),
      penalties: user.penalties.map((penalty) => ({
        userId: penalty.userId,
        loanId: penalty.loanId,
        penaltyPeriod: penalty.penaltyPeriod,
        daysOverdue: penalty.daysOverdue,
        createdAt: penalty.createdAt,
      })),
    };
    this.users.set(user.id.getValue(), data);
  }

  async findById(id: UserId): Promise<User | null> {
    const data = this.users.get(id.getValue());
    if (!data) return null;
    return this.reconstituteUser(data);
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const data of this.users.values()) {
      if (data.props.email.equals(email)) {
        return this.reconstituteUser(data);
      }
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values()).map((data) =>
      this.reconstituteUser(data)
    );
  }

  async delete(id: UserId): Promise<void> {
    this.users.delete(id.getValue());
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return (await this.findByEmail(email)) !== null;
  }

  private reconstituteUser(data: StoredUserData): User {
    const activeLoans = data.activeLoans.map((loanProps) =>
      Loan.reconstitute(loanProps)
    );

    const penalties = data.penalties.map((penaltyProps) =>
      Penalty.reconstitute(penaltyProps)
    );

    return User.reconstitute({
      id: data.props.id,
      email: data.props.email,
      name: data.props.name,
      activeLoans,
      penalties,
      createdAt: data.props.createdAt,
    });
  }

  // Método para limpiar
  clear(): void {
    this.users.clear();
  }
}
