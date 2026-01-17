/**
 * DTOs para Book
 *
 * Los DTOs son estructuras de datos simples que cruzan
 * las capas de la aplicación. No tienen comportamiento.
 */

export interface RegisterBookCommand {
  isbn: string;
  title: string;
  author: string;
}

export interface BookResponse {
  id: string;
  isbn: string;
  title: string;
  author: string;
  status: string;
  createdAt: string;
}
