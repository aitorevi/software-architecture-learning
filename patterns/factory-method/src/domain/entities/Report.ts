export interface ReportProps {
  id: string;
  title: string;
  content: string;
  author: string;
  date: Date;
  category?: string;
}

export class Report {
  private constructor(private props: ReportProps) {
    this.validate();
  }

  static create(props: Omit<ReportProps, 'id' | 'date'>): Report {
    return new Report({
      ...props,
      id: this.generateId(),
      date: new Date()
    });
  }

  static fromPersistence(props: ReportProps): Report {
    return new Report(props);
  }

  private static generateId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim() === '') {
      throw new Error('Report title cannot be empty');
    }

    if (!this.props.content || this.props.content.trim() === '') {
      throw new Error('Report content cannot be empty');
    }

    if (!this.props.author || this.props.author.trim() === '') {
      throw new Error('Report author cannot be empty');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get author(): string {
    return this.props.author;
  }

  get date(): Date {
    return this.props.date;
  }

  get category(): string | undefined {
    return this.props.category;
  }

  toJSON(): ReportProps {
    return { ...this.props };
  }
}
