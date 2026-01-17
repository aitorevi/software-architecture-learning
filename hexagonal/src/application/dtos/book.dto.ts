/**
 * ============================================================================
 * 📦 PATRÓN REPOSITORY - PASO 2: DTOs (Data Transfer Objects)
 * ============================================================================
 *
 * ¡Venga, mi niño! Aquí estamos en la capa de APLICACIÓN.
 * Los DTOs son como los contenedores de las papas arrugadas: solo transportan,
 * no cocinan ni tienen lógica.
 *
 * ¿QUÉ ES UN DTO?
 * ──────────────
 * - Data Transfer Object (Objeto de Transferencia de Datos)
 * - Es un simple "sobre" que lleva datos de una capa a otra
 * - NO tiene comportamiento (no tiene métodos, solo propiedades)
 * - NO tiene validaciones de negocio (eso va en Value Objects)
 *
 * ¿POR QUÉ USAMOS DTOs EN VEZ DE ENTIDADES?
 * ────────────────────────────────────────
 * Mira tú, esto es CRUCIAL:
 *
 * 1. SEPARACIÓN DE RESPONSABILIDADES
 *    - DTO: para comunicación entre capas (JSON ↔ UseCase)
 *    - Entidad: para lógica de negocio (reglas, validaciones)
 *
 * 2. TIPOS PRIMITIVOS vs TIPOS RICOS
 *    - DTO: usa string, number, boolean (fácil de serializar)
 *    - Entidad: usa BookId, ISBN (Value Objects con validación)
 *
 * 3. ESTABILIDAD DE CONTRATOS
 *    - El DTO es el contrato con el exterior (API HTTP, mensajes)
 *    - La entidad puede cambiar internamente sin romper la API
 *
 * EJEMPLO VISUAL:
 * ──────────────
 *
 *   Controller                 UseCase                  Repository
 *   ─────────                  ───────                  ──────────
 *      │                          │                         │
 *      │  RegisterBookCommand     │                         │
 *      │  (DTO con primitivos)    │                         │
 *      ├─────────────────────────>│                         │
 *      │                          │                         │
 *      │                          │  Book Entity            │
 *      │                          │  (con Value Objects)    │
 *      │                          ├────────────────────────>│
 *      │                          │                         │
 *      │  BookResponse            │                         │
 *      │  (DTO con primitivos)    │                         │
 *      <─────────────────────────│                         │
 *
 * Fíjate:
 * - Command: entrada (Controller → UseCase)
 * - Response: salida (UseCase → Controller)
 * - Entidad: solo dentro del dominio/aplicación
 *
 * 👉 SIGUIENTE ARCHIVO: ../use-cases/register-book.use-case.ts
 *    (Para ver cómo el UseCase usa estos DTOs y el Repository)
 * ============================================================================
 */

/**
 * COMMAND (DTO de entrada)
 * ───────────────────────
 * Se usa para CREAR/MODIFICAR algo.
 * Viene del Controller con datos del HTTP request.
 *
 * Ventajas de usar interfaces:
 * - Ligero (no instancias objetos)
 * - TypeScript valida los tipos en compilación
 * - Fácil de serializar a JSON
 */
export interface RegisterBookCommand {
  isbn: string;      // Primitivo (no es ISBN Value Object todavía)
  title: string;     // Primitivo
  author: string;    // Primitivo
}

/**
 * RESPONSE (DTO de salida)
 * ───────────────────────
 * Se usa para DEVOLVER datos al exterior.
 * Va desde el UseCase hacia el Controller.
 *
 * Diferencias con la entidad Book:
 * - id: string (no BookId)
 * - isbn: string (no ISBN Value Object)
 * - status: string (no enum BookStatus)
 * - createdAt: string (no Date, listo para JSON)
 *
 * ¿Por qué no devolvemos la entidad Book directamente?
 * ───────────────────────────────────────────────────
 * 1. La entidad tiene métodos (markAsBorrowed, etc) que no queremos exponer
 * 2. La entidad tiene Value Objects que no se serializan bien a JSON
 * 3. Queremos control sobre QUÉ exponemos al exterior
 */
export interface BookResponse {
  id: string;
  isbn: string;
  title: string;
  author: string;
  status: string;
  createdAt: string;
}
