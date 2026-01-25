/**
 * LogEntry - Una entrada de log
 *
 * Representa un mensaje de log con su nivel, timestamp y metadata
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntryProps {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: Date;
  readonly metadata?: Record<string, unknown>;

  constructor(props: LogEntryProps) {
    this.level = props.level;
    this.message = props.message;
    this.timestamp = props.timestamp;
    this.metadata = props.metadata;
  }

  toString(): string {
    const metaStr = this.metadata
      ? ` ${JSON.stringify(this.metadata)}`
      : '';

    return `[${this.timestamp.toISOString()}] [${this.level}] ${this.message}${metaStr}`;
  }

  toJSON(): Record<string, unknown> {
    return {
      level: this.level,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
    };
  }
}
