/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 1 DE 6: CATALOG CONTEXT - PRODUCT
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Buenas, mi niño! Este es el PRIMER archivo para entender Bounded Contexts.
 * Empezamos con algo simple: un Producto en el contexto de CATÁLOGO.
 *
 * 🎯 ¿QUÉ ES UN BOUNDED CONTEXT?
 *
 * Imagina un e-commerce. La palabra "Producto" se usa en TODOS lados:
 *   - Catálogo: nombre, descripción, imágenes
 *   - Ventas: precio, descuentos, stock
 *   - Envíos: peso, dimensiones, fragilidad
 *   - Marketing: SEO, keywords, popularidad
 *
 * ¿Es el MISMO Producto? NO. Son CONCEPTOS DIFERENTES con el mismo nombre.
 *
 * 💡 BOUNDED CONTEXT = FRONTERA CONCEPTUAL
 *
 * Un Bounded Context es como un "barrio" en una ciudad:
 *   - Cada barrio tiene sus propias reglas
 *   - Cada barrio habla su propio lenguaje
 *   - Los barrios NO comparten modelos (no hay imports cruzados)
 *   - Los barrios se comunican mediante mensajes (Integration Events)
 *
 * 🏗️ ESTE ES EL CATALOG CONTEXT:
 *
 * En el contexto de Catálogo, un Producto es:
 *   - Lo que el cliente VE cuando navega
 *   - Nombre, descripción, categoría
 *   - Información para BUSCAR y FILTRAR
 *
 * Lo que NO le importa a Catálogo:
 *   ❌ Stock (eso es de Ventas)
 *   ❌ Peso (eso es de Envíos)
 *   ❌ Precio de coste (eso es de Finanzas)
 *
 * 🎨 EJEMPLO MENTAL - La Analogía del Restaurante:
 *
 * Piensa en un restaurante con 3 equipos:
 *
 *   COCINA (Kitchen Context):
 *     "Plato" = Receta, ingredientes, tiempo de preparación
 *
 *   SALA (Service Context):
 *     "Plato" = Precio, alergenos, disponibilidad
 *
 *   ALMACÉN (Inventory Context):
 *     "Plato" = Ingredientes necesarios, proveedores
 *
 * ¿Es el mismo "Plato"? NO. Cada equipo ve el plato de forma diferente.
 * Esto es Bounded Contexts aplicado.
 *
 * 🔗 RELACIÓN CON EL README:
 *
 * Lee README_ES.md sección "Bounded Contexts" para entender la teoría completa.
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de ver este Product (Catalog), ve a:
 *   → ../sales-context/domain/Order.ts (ver cómo cambia el concepto)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Money } from '../../shared/kernel';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📋 ProductProps - Propiedades del Producto en Catalog Context
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Fíjate en lo que SÍ tiene:
 *   ✅ name - Para mostrar en listados
 *   ✅ description - Para la página de detalle
 *   ✅ price - Para mostrar al usuario (solo visualización)
 *   ✅ category - Para filtrado y navegación
 *   ✅ isActive - Para saber si mostrar o no
 *
 * Fíjate en lo que NO tiene:
 *   ❌ stock - Eso es responsabilidad del Sales Context
 *   ❌ weight/dimensions - Eso es del Shipping Context
 *   ❌ supplier - Eso sería del Purchasing Context
 *
 * Esta es la ESENCIA de Bounded Contexts: cada contexto tiene SOLO
 * lo que necesita para SU responsabilidad.
 */
export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Money;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏛️ Product Entity - Aggregate Root del Catalog Context
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Esta entidad pertenece SOLO al Catalog Context.
 * Otros contextos NO la importan directamente.
 *
 * Si Sales Context necesita info de un producto, tiene dos opciones:
 *   1. Copiar los datos que necesita (desnormalización)
 *   2. Referenciar por ID y consultar vía API/evento
 *
 * NUNCA: import { Product } from '../../catalog-context' ❌
 * Eso rompería la frontera del contexto.
 */
export class Product {
  private constructor(private props: ProductProps) {}

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🏭 FACTORY METHOD - Crear Nuevo Producto
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Cuando se crea un producto NUEVO en el catálogo:
   *   - Se valida el nombre (regla de negocio)
   *   - Se establece como activo por defecto
   *   - Se registran las fechas de creación
   *
   * 💡 IMPORTANTE: Esta validación es específica del CATALOG context.
   *    Otros contextos podrían tener validaciones diferentes.
   */
  static create(params: {
    id: string;
    name: string;
    description: string;
    price: Money;
    category: string;
  }): Product {
    // Regla de negocio del Catalog: nombre obligatorio
    if (!params.name || params.name.trim() === '') {
      throw new Error('Product name is required');
    }

    const now = new Date();
    return new Product({
      id: params.id,
      name: params.name.trim(),
      description: params.description?.trim() ?? '',
      price: params.price,
      category: params.category,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * 🔄 RECONSTITUTE - Reconstruir desde BD
   *
   * Usado por el Repository para convertir un row/document a entidad.
   */
  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 📖 GETTERS - Acceso de solo lectura
  // ═══════════════════════════════════════════════════════════════════════

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get price(): Money {
    return this.props.price;
  }

  get category(): string {
    return this.props.category;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🎯 COMPORTAMIENTO DE NEGOCIO
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Actualizar precio en el catálogo
   *
   * NOTA: Este método actualiza el precio de VISUALIZACIÓN.
   * El precio real de venta podría estar en Sales Context con descuentos.
   */
  updatePrice(newPrice: Money): void {
    this.props.price = newPrice;
    this.props.updatedAt = new Date();
  }

  /**
   * Descontinuar producto (sacarlo del catálogo)
   *
   * IMPORTANTE: Esto NO elimina el producto de la BD.
   * Solo lo marca como inactivo para que no se muestre en búsquedas.
   */
  discontinue(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔌 ProductRepository - Puerto del Catalog Context
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Esta interface define cómo persistir productos DEL CATÁLOGO.
 *
 * Fíjate en los métodos:
 *   - findByCategory() → necesidad del Catálogo (filtrado)
 *   - findAll() → listar productos en el catálogo
 *
 * Métodos que NO tiene (porque no son responsabilidad del Catálogo):
 *   ❌ findByStock() - Eso sería del Sales Context
 *   ❌ findByWeight() - Eso sería del Shipping Context
 *
 * Cada contexto define SU propio repository con SUS necesidades.
 */
export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findByCategory(category: string): Promise<Product[]>;
}
