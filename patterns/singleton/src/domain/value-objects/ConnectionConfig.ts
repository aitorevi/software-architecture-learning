/**
 * ConnectionConfig - Configuración de conexión a la base de datos
 *
 * Value Object que encapsula la configuración de una conexión
 */

export interface ConnectionConfigProps {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  maxConnections?: number;
  timeout?: number;
}

export class ConnectionConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly maxConnections: number;
  readonly timeout: number;

  constructor(props: ConnectionConfigProps) {
    if (!props.host) {
      throw new Error('Host is required');
    }
    if (props.port <= 0 || props.port > 65535) {
      throw new Error('Port must be between 1 and 65535');
    }
    if (!props.database) {
      throw new Error('Database name is required');
    }
    if (!props.username) {
      throw new Error('Username is required');
    }

    this.host = props.host;
    this.port = props.port;
    this.database = props.database;
    this.username = props.username;
    this.password = props.password;
    this.maxConnections = props.maxConnections ?? 10;
    this.timeout = props.timeout ?? 5000;
  }

  getConnectionString(): string {
    return `postgresql://${this.username}:${this.maskPassword()}@${this.host}:${this.port}/${this.database}`;
  }

  private maskPassword(): string {
    return '*'.repeat(this.password.length);
  }

  equals(other: ConnectionConfig): boolean {
    return (
      this.host === other.host &&
      this.port === other.port &&
      this.database === other.database &&
      this.username === other.username &&
      this.password === other.password
    );
  }
}
