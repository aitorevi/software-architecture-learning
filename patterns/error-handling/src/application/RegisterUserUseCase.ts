/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ERROR HANDLING - PASO 6: REGISTER USER USE CASE                          ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/domain/User.ts                                         ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Cómo componer múltiples Results en un Use Case                      ║
 * ║     • Railway Oriented Programming en acción                              ║
 * ║     • Errores de dominio vs errores de infraestructura                    ║
 * ║                                                                           ║
 * ║  ⭐ AQUÍ VES TODO JUNTO - RESULT EN PRODUCCIÓN ⭐                         ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { User } from '../domain/User.js';
import { UserId } from '../domain/UserId.js';
import { Email } from '../domain/value-objects/Email.js';
import { Password } from '../domain/value-objects/Password.js';
import { UserRepository } from '../domain/UserRepository.js';
import { Result } from '../domain/Result.js';
import {
  DomainError,
  ValidationError,
  UserAlreadyExistsError,
  TermsNotAcceptedError,
} from '../domain/errors/DomainError.js';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  DTO: RegisterUserCommand                                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  DTO (Data Transfer Object) - objeto para transferir datos desde HTTP.    ║
 * ║                                                                           ║
 * ║  Características:                                                         ║
 * ║  • Datos PRIMITIVOS (string, boolean, number)                             ║
 * ║  • SIN lógica de negocio                                                  ║
 * ║  • Representa la ENTRADA del Use Case                                     ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export interface RegisterUserCommand {
  email: string;
  password: string;
  acceptedTerms: boolean;
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  USE CASE: RegisterUserUseCase                                            ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Un Use Case representa una OPERACIÓN DE NEGOCIO.                         ║
 * ║                                                                           ║
 * ║  Este Use Case:                                                           ║
 * ║  1. Valida los datos de entrada (email, password)                         ║
 * ║  2. Verifica reglas de negocio (términos aceptados, email no duplicado)   ║
 * ║  3. Crea el usuario                                                       ║
 * ║  4. Lo persiste                                                           ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Mira tú, este es el núcleo del error handling.     ║
 * ║  Fíjate cómo CADA paso puede fallar, y manejamos CADA error como valor."  ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export class RegisterUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  EXECUTE                                                                  ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Este método retorna Promise<Result<User, DomainError>>                   ║
   * ║                                                                           ║
   * ║  Fíjate en el TIPO:                                                       ║
   * ║  • Promise → operación asíncrona                                          ║
   * ║  • Result → puede fallar                                                  ║
   * ║  • User → tipo de éxito                                                   ║
   * ║  • DomainError → tipo de error (puede ser cualquier DomainError)          ║
   * ║                                                                           ║
   * ║  El tipo TE DICE que esta operación puede fallar por razones de negocio.  ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  async execute(
    command: RegisterUserCommand
  ): Promise<Result<User, DomainError>> {
    // ═══════════════════════════════════════════════════════════════════════
    // PASO 1: Validar Email
    // ═══════════════════════════════════════════════════════════════════════
    const emailResult = Email.create(command.email);

    if (emailResult.isError()) {
      // 🚂 Descarrilamiento - retornar error inmediatamente
      return Result.fail(emailResult.error);
    }

    // A partir de aquí, emailResult.value es Email (válido)
    const email = emailResult.value;

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 2: Validar Password
    // ═══════════════════════════════════════════════════════════════════════
    const passwordResult = Password.create(command.password);

    if (passwordResult.isError()) {
      // 🚂 Descarrilamiento - retornar error inmediatamente
      return Result.fail(passwordResult.error);
    }

    // A partir de aquí, passwordResult.value es Password (válido)
    const password = passwordResult.value;

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 3: Verificar Términos Aceptados
    // ═══════════════════════════════════════════════════════════════════════
    if (!command.acceptedTerms) {
      // 🚂 Descarrilamiento - regla de negocio no cumplida
      return Result.fail(new TermsNotAcceptedError());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 4: Verificar Email No Duplicado
    // ═══════════════════════════════════════════════════════════════════════
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      // 🚂 Descarrilamiento - email ya existe
      return Result.fail(new UserAlreadyExistsError(email.toString()));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 5: Crear Usuario
    // ═══════════════════════════════════════════════════════════════════════
    // Fíjate: el constructor de User NO puede fallar porque todos los
    // Value Objects ya están validados. Esto es FAIL FAST en acción.
    const user = new User(
      UserId.generate(),
      email,
      password,
      command.acceptedTerms
    );

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 6: Persistir Usuario
    // ═══════════════════════════════════════════════════════════════════════
    // IMPORTANTE: Si save() lanza una exception (BD caída), dejamos que
    // se propague. ¿Por qué? Porque es un error de INFRAESTRUCTURA, no
    // de DOMINIO. No lo manejamos con Result, sino con try/catch más arriba.
    await this.userRepository.save(user);

    // ═══════════════════════════════════════════════════════════════════════
    // ÉXITO: Retornar Usuario Creado
    // ═══════════════════════════════════════════════════════════════════════
    return Result.ok(user);
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 6                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • Use Case retorna Promise<Result<T, E>>                                 ║
 * ║  • Railway Oriented Programming - si un paso falla, todo falla            ║
 * ║  • Validar paso por paso, retornar Result.fail() inmediatamente           ║
 * ║  • Errores de dominio → Result.fail()                                     ║
 * ║  • Errores de infraestructura → throw (se manejan arriba)                 ║
 * ║                                                                           ║
 * ║  FLUJO VISUAL:                                                            ║
 * ║  ┌────────────────────────────────────────────────────────────────────┐   ║
 * ║  │ execute(command)                                                   │   ║
 * ║  │    │                                                               │   ║
 * ║  │    ├─→ Email.create() ──┬─→ ok  → continuar                       │   ║
 * ║  │    │                     └─→ fail → return Result.fail() 🚂        │   ║
 * ║  │    │                                                               │   ║
 * ║  │    ├─→ Password.create() ──┬─→ ok  → continuar                    │   ║
 * ║  │    │                        └─→ fail → return Result.fail() 🚂     │   ║
 * ║  │    │                                                               │   ║
 * ║  │    ├─→ acceptedTerms? ──┬─→ true  → continuar                     │   ║
 * ║  │    │                     └─→ false → return Result.fail() 🚂       │   ║
 * ║  │    │                                                               │   ║
 * ║  │    ├─→ existingUser? ──┬─→ null  → continuar                      │   ║
 * ║  │    │                   └─→ exists → return Result.fail() 🚂        │   ║
 * ║  │    │                                                               │   ║
 * ║  │    ├─→ new User() → siempre ok (VOs validados)                    │   ║
 * ║  │    │                                                               │   ║
 * ║  │    ├─→ save() → puede lanzar exception (infraestructura)          │   ║
 * ║  │    │                                                               │   ║
 * ║  │    └─→ return Result.ok(user) ✅                                   │   ║
 * ║  └────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/infrastructure/http/UserController.ts                  ║
 * ║     (Traducir Result → HTTP status codes)                                 ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
