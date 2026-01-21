export interface AddressProps {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export class Address {
  private constructor(private readonly props: AddressProps) {}

  static create(props: AddressProps): Address {
    if (!props.street || props.street.trim() === '') {
      throw new Error('Street is required');
    }
    if (!props.city || props.city.trim() === '') {
      throw new Error('City is required');
    }
    if (!props.postalCode || props.postalCode.trim() === '') {
      throw new Error('Postal code is required');
    }
    if (!props.country || props.country.trim() === '') {
      throw new Error('Country is required');
    }

    return new Address({
      street: props.street.trim(),
      city: props.city.trim(),
      postalCode: props.postalCode.trim(),
      country: props.country.trim().toUpperCase(),
    });
  }

  get street(): string {
    return this.props.street;
  }

  get city(): string {
    return this.props.city;
  }

  get postalCode(): string {
    return this.props.postalCode;
  }

  get country(): string {
    return this.props.country;
  }

  equals(other: Address): boolean {
    return (
      this.props.street === other.props.street &&
      this.props.city === other.props.city &&
      this.props.postalCode === other.props.postalCode &&
      this.props.country === other.props.country
    );
  }

  toString(): string {
    return `${this.props.street}, ${this.props.postalCode} ${this.props.city}, ${this.props.country}`;
  }

  toJSON(): AddressProps {
    return { ...this.props };
  }
}
