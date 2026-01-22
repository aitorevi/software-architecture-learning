/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ERROR HANDLING - PASO 5: USER (AGGREGATE ROOT)                           ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/domain/value-objects/Password.ts                       ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Cómo construir entidades con Value Objects ya validados             ║
 * ║     • Por qué el constructor de User NO puede fallar                      ║
 * ║     • Aggregate Root - la raíz de consistencia                            ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { UserId } from './UserId.js';
import { Email } from './value-objects/Email.js';
import { Password } from './value-objects/Password.js';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 USER - AGGREGATE ROOT                                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  El User es un AGGREGATE ROOT - la raíz de un grafo de objetos que        ║
 * ║  se tratan como una unidad para cambios de datos.                         ║
 * ║                                                                           ║
 * ║  Características:                                                         ║
 * ║  • Tiene una IDENTIDAD (UserId)                                           ║
 * ║  • Contiene VALUE OBJECTS (Email, Password)                               ║
 * ║  • Es la única entrada al agregado desde fuera                            ║
 * ║  • Mantiene INVARIANTES (reglas de negocio)                               ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Fíjate que el constructor de User NO puede         ║
 * ║  fallar. ¿Por qué? Porque todos los Value Objects ya están validados.     ║
 * ║  La validación ocurrió ANTES, en el boundary. Esto está fetén."           ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export class User {
  private readonly createdAt: Date;
  private acceptedTermsAt: Date | null;

  /**
   * CONSTRUCTOR
   *
   * Fíjate: NO retorna Result. ¿Por qué?
   *
   * Porque todos los parámetros ya están VALIDADOS:
   * • id es UserId (válido)
   * • email es Email (válido)
   * • password es Password (válido)
   *
   * Si tienes estos objetos, el User ES VÁLIDO. No puede fallar.
   *
   * La validación ya ocurrió cuando se crearon estos Value Objects.
   * Esto es FAIL FAST en el boundary.
   */
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private readonly password: Password,
    acceptedTerms: boolean
  ) {
    this.createdAt = new Date();
    this.acceptedTermsAt = acceptedTerms ? new Date() : null;
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  GETTERS                                                                  ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Exponemos los Value Objects a través de getters.                         ║
   * ║  Son readonly - no puedes modificarlos desde fuera.                       ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  getId(): UserId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  hasAcceptedTerms(): boolean {
    return this.acceptedTermsAt !== null;
  }

  getAcceptedTermsAt(): Date | null {
    return this.acceptedTermsAt;
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  COMPORTAMIENTO: acceptTerms()                                            ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Este es un método de DOMINIO - representa una operación de negocio.      ║
   * ║                                                                           ║
   * ║  Fíjate que no retorna Result. ¿Por qué?                                  ║
   * ║  Porque aceptar términos SIEMPRE puede hacerse. No puede fallar.          ║
   * ║                                                                           ║
   * ║  Si hubiera reglas de negocio que pudieran impedir aceptar términos,      ║
   * ║  entonces SÍ retornaría Result.                                           ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  acceptTerms(): void {
    if (!this.acceptedTermsAt) {
      this.acceptedTermsAt = new Date();
    }
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  COMPORTAMIENTO: checkPassword()                                          ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Verifica si un password en texto plano coincide con el del usuario.      ║
   * ║                                                                           ║
   * ║  Delega en el Value Object Password - él sabe cómo verificarse.           ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  checkPassword(plainTextPassword: string): boolean {
    return this.password.matches(plainTextPassword);
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  SERIALIZACIÓN: toDTO()                                                   ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Convierte el User a un objeto plano (DTO) para respuestas HTTP.          ║
   * ║                                                                           ║
   * ║  IMPORTANTE: NO expongas el password, ni siquiera hasheado.               ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  toDTO(): {
    id: string;
    email: string;
    createdAt: string;
    hasAcceptedTerms: boolean;
    acceptedTermsAt: string | null;
  } {
    return {
      id: this.id.toString(),
      email: this.email.toString(),
      createdAt: this.createdAt.toISOString(),
      hasAcceptedTerms: this.hasAcceptedTerms(),
      acceptedTermsAt: this.acceptedTermsAt?.toISOString() || null,
    };
  }

  /**
   * Equality - dos usuarios son iguales si tienen el mismo ID
   */
  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 5                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • Aggregate Root - raíz de consistencia                                  ║
 * ║  • Constructor que NO puede fallar (VOs ya validados)                     ║
 * ║  • Métodos de dominio (acceptTerms, checkPassword)                        ║
 * ║  • Serialización segura (toDTO sin password)                              ║
 * ║                                                                           ║
 * ║  GARANTÍAS DE CONSTRUCCIÓN:                                               ║
 * ║  ┌────────────────────────────────────────────────────────────────────┐   ║
 * ║  │ // Esto NO COMPILA:                                                │   ║
 * ║  │ const user = new User(                                             │   ║
 * ║  │   'not-a-uuid',    // ❌ Necesitas UserId                          │   ║
 * ║  │   'not-an-email',  // ❌ Necesitas Email                           │   ║
 * ║  │   'weak',          // ❌ Necesitas Password                        │   ║
 * ║  │   false                                                            │   ║
 * ║  │ );                                                                 │   ║
 * ║  │                                                                    │   ║
 * ║  │ // Esto SÍ COMPILA:                                                │   ║
 * ║  │ const emailResult = Email.create('millo@laspalmas.com');           │   ║
 * ║  │ const passwordResult = Password.create('Secret123!');              │   ║
 * ║  │                                                                    │   ║
 * ║  │ if (emailResult.isOk() && passwordResult.isOk()) {                 │   ║
 * ║  │   const user = new User(                                           │   ║
 * ║  │     UserId.generate(),                                             │   ║
 * ║  │     emailResult.value,    // Email (válido)                        │   ║
 * ║  │     passwordResult.value, // Password (válido)                     │   ║
 * ║  │     true                                                           │   ║
 * ║  │   );                                                               │   ║
 * ║  │   // ✅ user es válido - imposible crear uno inválido              │   ║
 * ║  │ }                                                                  │   ║
 * ║  └────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/domain/UserRepository.ts                               ║
 * ║     (Puerto - interface para persistencia)                                ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
