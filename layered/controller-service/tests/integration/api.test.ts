/**
 * Tests de integración para la API
 *
 * Aquí testeamos el FLUJO COMPLETO de la aplicación.
 * Verificamos que todas las capas trabajan juntas correctamente.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { TaskService } from '../../src/application/TaskService.js';
import { TaskController } from '../../src/infrastructure/http/TaskController.js';
import { InMemoryTaskRepository } from '../../src/infrastructure/persistence/InMemoryTaskRepository.js';
import { createServer } from '../../src/infrastructure/http/server.js';
import type { Application } from 'express';

describe('API Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    const repository = new InMemoryTaskRepository();
    const taskService = new TaskService(repository);
    const taskController = new TaskController(taskService);
    app = createServer(taskController);
  });

  describe('Flujo completo de gestión de tareas', () => {
    it('debe permitir crear, listar, completar y eliminar tareas', async () => {
      // 1. Crear una tarea
      const createResponse = await request(app)
        .post('/tasks')
        .send({ title: 'Aprender arquitectura hexagonal' });

      expect(createResponse.status).toBe(201);
      const taskId = createResponse.body.id;

      // 2. Verificar que aparece en la lista
      const listResponse = await request(app).get('/tasks');
      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].title).toBe('Aprender arquitectura hexagonal');

      // 3. Obtener por ID
      const getResponse = await request(app).get(`/tasks/${taskId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.completed).toBe(false);

      // 4. Completar la tarea
      const completeResponse = await request(app).post(
        `/tasks/${taskId}/complete`
      );
      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.completed).toBe(true);

      // 5. Verificar que sigue completada
      const verifyResponse = await request(app).get(`/tasks/${taskId}`);
      expect(verifyResponse.body.completed).toBe(true);

      // 6. Eliminar la tarea
      const deleteResponse = await request(app).delete(`/tasks/${taskId}`);
      expect(deleteResponse.status).toBe(204);

      // 7. Verificar que ya no existe
      const notFoundResponse = await request(app).get(`/tasks/${taskId}`);
      expect(notFoundResponse.status).toBe(404);

      // 8. Lista vacía de nuevo
      const emptyListResponse = await request(app).get('/tasks');
      expect(emptyListResponse.body).toHaveLength(0);
    });

    it('debe manejar múltiples tareas correctamente', async () => {
      // Crear varias tareas
      const tasks = [
        'Tarea 1: Diseñar la entidad',
        'Tarea 2: Implementar el repositorio',
        'Tarea 3: Crear el service',
        'Tarea 4: Crear el controller',
        'Tarea 5: Escribir tests',
      ];

      const createdIds: string[] = [];

      for (const title of tasks) {
        const response = await request(app).post('/tasks').send({ title });
        expect(response.status).toBe(201);
        createdIds.push(response.body.id);
      }

      // Verificar que se crearon todas
      const listResponse = await request(app).get('/tasks');
      expect(listResponse.body).toHaveLength(5);

      // Completar las primeras 3
      for (let i = 0; i < 3; i++) {
        await request(app).post(`/tasks/${createdIds[i]}/complete`);
      }

      // Verificar estados
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get(`/tasks/${createdIds[i]}`);
        expect(response.body.completed).toBe(i < 3);
      }
    });
  });

  describe('Manejo de errores', () => {
    it('debe validar campos requeridos', async () => {
      const response = await request(app).post('/tasks').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('debe manejar IDs inexistentes', async () => {
      const getResponse = await request(app).get('/tasks/id-que-no-existe');
      expect(getResponse.status).toBe(404);

      const completeResponse = await request(app).post(
        '/tasks/id-que-no-existe/complete'
      );
      expect(completeResponse.status).toBe(404);

      const deleteResponse = await request(app).delete(
        '/tasks/id-que-no-existe'
      );
      expect(deleteResponse.status).toBe(404);
    });

    it('debe prevenir completar una tarea ya completada', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Tarea' });

      await request(app).post(`/tasks/${created.body.id}/complete`);
      const response = await request(app).post(
        `/tasks/${created.body.id}/complete`
      );

      expect(response.status).toBe(400);
    });
  });
});
