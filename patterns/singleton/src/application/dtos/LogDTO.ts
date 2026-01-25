/**
 * LogDTO - Data Transfer Object para logs
 */

import { LogEntry } from '../../domain/entities/LogEntry.js';

export interface LogDTO {
  level: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class LogDTOMapper {
  static toDTO(logEntry: LogEntry): LogDTO {
    return {
      level: logEntry.level,
      message: logEntry.message,
      timestamp: logEntry.timestamp.toISOString(),
      metadata: logEntry.metadata,
    };
  }

  static toDTOList(logEntries: LogEntry[]): LogDTO[] {
    return logEntries.map(entry => LogDTOMapper.toDTO(entry));
  }
}
