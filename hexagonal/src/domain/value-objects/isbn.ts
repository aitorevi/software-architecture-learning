/**
 * ISBN Value Object
 *
 * Encapsula y valida el código ISBN de un libro.
 * Soporta ISBN-10 e ISBN-13.
 *
 * ¿Por qué un Value Object para ISBN?
 * - Valida formato automáticamente
 * - Hace imposible tener un ISBN inválido en el sistema
 * - Centraliza la lógica de validación
 */
export class ISBN {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('ISBN cannot be empty');
    }

    const cleanIsbn = value.replace(/[-\s]/g, '');

    if (!this.isValidIsbn10(cleanIsbn) && !this.isValidIsbn13(cleanIsbn)) {
      throw new Error(`Invalid ISBN format: ${value}`);
    }
  }

  private isValidIsbn10(isbn: string): boolean {
    if (isbn.length !== 10) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const digit = parseInt(isbn[i], 10);
      if (isNaN(digit)) return false;
      sum += digit * (10 - i);
    }

    const lastChar = isbn[9].toUpperCase();
    const lastDigit = lastChar === 'X' ? 10 : parseInt(lastChar, 10);
    if (isNaN(lastDigit) && lastChar !== 'X') return false;

    sum += lastDigit;
    return sum % 11 === 0;
  }

  private isValidIsbn13(isbn: string): boolean {
    if (isbn.length !== 13) return false;

    let sum = 0;
    for (let i = 0; i < 13; i++) {
      const digit = parseInt(isbn[i], 10);
      if (isNaN(digit)) return false;
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }

    return sum % 10 === 0;
  }

  static create(value: string): ISBN {
    return new ISBN(value);
  }

  getValue(): string {
    return this.value;
  }

  /**
   * Retorna ISBN normalizado (solo dígitos)
   */
  getNormalized(): string {
    return this.value.replace(/[-\s]/g, '');
  }

  equals(other: ISBN): boolean {
    return this.getNormalized() === other.getNormalized();
  }

  toString(): string {
    return this.value;
  }
}
