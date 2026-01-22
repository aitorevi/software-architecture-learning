/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ERROR HANDLING - PASO 7: USER CONTROLLER                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/application/RegisterUserUseCase.ts                     ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Cómo traducir Result a HTTP status codes                            ║
 * ║     • Cómo mapear errores de dominio a respuestas HTTP                    ║
 * ║     • Separación entre errores de dominio e infraestructura               ║
 * ║                                                                           ║
 * ║  ⭐ AQUÍ SE CIERRA EL CÍRCULO - RESULT → HTTP ⭐                          ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/RegisterUserUseCase.js';
import {
  DomainError,
  ValidationError,
  UserAlreadyExistsError,
  TermsNotAcceptedError,
  UserNotFoundError,
} from '../../domain/errors/DomainError.js';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 USER CONTROLLER                                                       ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  El Controller es un ADAPTADOR DE ENTRADA (Primary Adapter).              ║
 * ║                                                                           ║
 * ║  Responsabilidades:                                                       ║
 * ║  1. Extraer datos del Request                                             ║
 * ║  2. Llamar al Use Case                                                    ║
 * ║  3. Traducir Result → HTTP Response                                       ║
 * ║  4. Manejar errores de infraestructura (try/catch)                        ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Aquí es donde los errores de dominio se            ║
 * ║  convierten en status codes. ValidationError → 400, UserExists → 409."    ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export class UserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  ENDPOINT: POST /users                                                    ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Registra un nuevo usuario.                                               ║
   * ║                                                                           ║
   * ║  Flujo:                                                                   ║
   * ║  1. Extraer body                                                          ║
   * ║  2. Llamar Use Case                                                       ║
   * ║  3. Si result.isOk() → 201 Created                                        ║
   * ║  4. Si result.isError() → mapear error a status code                      ║
   * ║  5. Si exception → 500 Internal Server Error                              ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // ═══════════════════════════════════════════════════════════════════════
      // PASO 1: Extraer datos del Request
      // ═══════════════════════════════════════════════════════════════════════
      const { email, password, acceptedTerms } = req.body;

      // ═══════════════════════════════════════════════════════════════════════
      // PASO 2: Ejecutar Use Case
      // ═══════════════════════════════════════════════════════════════════════
      const result = await this.registerUserUseCase.execute({
        email,
        password,
        acceptedTerms,
      });

      // ═══════════════════════════════════════════════════════════════════════
      // PASO 3: Manejar Result
      // ═══════════════════════════════════════════════════════════════════════
      if (result.isError()) {
        // ERROR DE DOMINIO - traducir a HTTP
        const statusCode = this.errorToStatusCode(result.error);
        res.status(statusCode).json({
          error: result.error.name,
          message: result.error.message,
          ...(Object.keys(result.error.metadata).length > 0 && {
            details: result.error.metadata,
          }),
        });
        return;
      }

      // ÉXITO - retornar usuario creado
      const user = result.value;
      res.status(201).json(user.toDTO());
    } catch (error) {
      // ═══════════════════════════════════════════════════════════════════════
      // ERROR DE INFRAESTRUCTURA (inesperado)
      // ═══════════════════════════════════════════════════════════════════════
      // Este catch atrapa errores que NO son de dominio:
      // - Base de datos caída
      // - Timeout de red
      // - OutOfMemory
      // - Bugs (null pointer, etc.)
      //
      // Estos NO deberían pasar, son errores del SERVIDOR (5xx)

      console.error('Error inesperado en register:', error);

      res.status(500).json({
        error: 'InternalServerError',
        message: 'Ocurrió un error inesperado. Por favor intenta más tarde.',
        // En producción, NO expongas el error real (seguridad)
        // En desarrollo, puedes incluirlo para debugging
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      });
    }
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  MAPEO: errorToStatusCode()                                               ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Traduce errores de dominio a HTTP status codes.                          ║
   * ║                                                                           ║
   * ║  Esta es la RESPONSABILIDAD del Controller - saber de HTTP.               ║
   * ║  El dominio NO conoce HTTP, el Controller SÍ.                             ║
   * ║                                                                           ║
   * ║  Mapeo:                                                                   ║
   * ║  • ValidationError         → 400 Bad Request                              ║
   * ║  • UserAlreadyExistsError  → 409 Conflict                                 ║
   * ║  • TermsNotAcceptedError   → 403 Forbidden                                ║
   * ║  • UserNotFoundError       → 404 Not Found                                ║
   * ║  • DomainError (otros)     → 400 Bad Request (default)                    ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  private errorToStatusCode(error: DomainError): number {
    // instanceof funciona gracias a la jerarquía de clases
    if (error instanceof ValidationError) {
      return 400; // Bad Request
    }

    if (error instanceof UserAlreadyExistsError) {
      return 409; // Conflict
    }

    if (error instanceof TermsNotAcceptedError) {
      return 403; // Forbidden
    }

    if (error instanceof UserNotFoundError) {
      return 404; // Not Found
    }

    // Default para otros DomainErrors
    return 400; // Bad Request
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 7                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • Controller traduce Result → HTTP                                       ║
 * ║  • result.isError() → mapear a status code específico                     ║
 * ║  • result.isOk() → 201 Created con body                                   ║
 * ║  • try/catch SOLO para errores de infraestructura → 500                   ║
 * ║                                                                           ║
 * ║  SEPARACIÓN DE RESPONSABILIDADES:                                         ║
 * ║  ┌────────────────────────────────────────────────────────────────────┐   ║
 * ║  │ DOMINIO (Use Case):                                                │   ║
 * ║  │   • Retorna Result<User, DomainError>                              │   ║
 * ║  │   • NO conoce HTTP                                                 │   ║
 * ║  │   • Modelador errores de negocio                                   │   ║
 * ║  │                                                                    │   ║
 * ║  │ INFRAESTRUCTURA (Controller):                                      │   ║
 * ║  │   • Traduce Result → HTTP Response                                 │   ║
 * ║  │   • SÍ conoce HTTP (status codes, Request, Response)               │   ║
 * ║  │   • Mapea DomainError → status code                                │   ║
 * ║  └────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║  FLUJO COMPLETO:                                                          ║
 * ║  ┌────────────────────────────────────────────────────────────────────┐   ║
 * ║  │ POST /users {"email":"bad"}                                        │   ║
 * ║  │   ↓                                                                │   ║
 * ║  │ Controller.register()                                              │   ║
 * ║  │   ↓                                                                │   ║
 * ║  │ RegisterUserUseCase.execute()                                      │   ║
 * ║  │   ↓                                                                │   ║
 * ║  │ Email.create("bad")                                                │   ║
 * ║  │   ↓                                                                │   ║
 * ║  │ Result.fail(ValidationError)                                       │   ║
 * ║  │   ↓                                                                │   ║
 * ║  │ Controller: errorToStatusCode() → 400                              │   ║
 * ║  │   ↓                                                                │   ║
 * ║  │ HTTP Response:                                                     │   ║
 * ║  │   status: 400                                                      │   ║
 * ║  │   body: {                                                          │   ║
 * ║  │     error: "ValidationError",                                      │   ║
 * ║  │     message: "email: debe contener @"                              │   ║
 * ║  │   }                                                                │   ║
 * ║  └────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/infrastructure/http/server.ts                          ║
 * ║     (Configurar Express y rutas)                                          ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
