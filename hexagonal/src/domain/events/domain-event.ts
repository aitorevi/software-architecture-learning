/**
 * Base class for all domain events.
 *
 * ¿Por qué eventos de dominio?
 * - Desacoplan componentes del sistema
 * - Permiten reaccionar a cambios de estado
 * - Facilitan audit logs y trazabilidad
 * - Habilitan arquitecturas event-driven
 *
 * Los eventos son inmutables y representan algo que YA OCURRIÓ.
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = this.generateEventId();
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  abstract get eventName(): string;
}
