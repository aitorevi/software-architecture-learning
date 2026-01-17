import { ValueObject } from '@shared/kernel';

/**
 * TAG FEATURE - Color Value Object
 *
 * Represents a hex color code for tags.
 * Validates that the color is a valid hex format.
 */
export class Color extends ValueObject<{ value: string }> {
  private static readonly HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

  private constructor(value: string) {
    super({ value: value.toUpperCase() });
  }

  static create(value: string): Color {
    if (!this.HEX_PATTERN.test(value)) {
      throw new ColorValidationError(
        `Invalid color format: ${value}. Expected hex format like #FF5733`
      );
    }
    return new Color(value);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Predefined colors for convenience
   */
  static readonly RED = Color.create('#FF0000');
  static readonly GREEN = Color.create('#00FF00');
  static readonly BLUE = Color.create('#0000FF');
  static readonly YELLOW = Color.create('#FFFF00');
  static readonly ORANGE = Color.create('#FFA500');
  static readonly PURPLE = Color.create('#800080');
  static readonly GRAY = Color.create('#808080');
}

export class ColorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ColorValidationError';
  }
}
