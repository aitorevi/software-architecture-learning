/**
 * Tests unitarios para TaskController
 *
 * Aquí testeamos el Controller en AISLAMIENTO.
 * Usamos supertest para simular peticiones HTTP sin levantar un servidor real.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { TaskService } from '../../src/application/TaskService.js';
import { TaskController } from '../../src/infrastructure/http/TaskController.js';
import { InMemoryTaskRepository } from '../../src/infrastructure/persistence/InMemoryTaskRepository.js';
import { createServer } from '../../src/infrastructure/http/server.js';
import type { Application } from 'express';

describe('TaskController', () => {
  let app: Application;
  let repository: InMemoryTaskRepository;

  beforeEach(() => {
    // Configuramos todo el stack antes de cada test
    repository = new InMemoryTaskRepository();
    const taskService = new TaskService(repository);
    const taskController = new TaskController(taskService);
    app = createServer(taskController);
  });

  describe('POST /tasks', () => {
    it('debe crear una tarea y devolver 201', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'Nueva tarea' });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Nueva tarea');
      expect(response.body.completed).toBe(false);
      expect(response.body.id).toBeDefined();
    });

    it('debe devolver 400 si no se envía title', async () => {
      const response = await request(app).post('/tasks').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('title');
    });

    it('debe devolver 400 si title no es string', async () => {
      const response = await request(app).post('/tasks').send({ title: 123 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /tasks', () => {
    it('debe devolver array vacío si no hay tareas', async () => {
      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('debe devolver todas las tareas', async () => {
      // Creamos algunas tareas primero
      await request(app).post('/tasks').send({ title: 'Tarea 1' });
      await request(app).post('/tasks').send({ title: 'Tarea 2' });

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /tasks/:id', () => {
    it('debe devolver la tarea si existe', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Mi tarea' });

      const response = await request(app).get(`/tasks/${created.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Mi tarea');
    });

    it('debe devolver 404 si no existe', async () => {
      const response = await request(app).get('/tasks/no-existe');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /tasks/:id/complete', () => {
    it('debe marcar la tarea como completada', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Tarea a completar' });

      const response = await request(app).post(
        `/tasks/${created.body.id}/complete`
      );

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });

    it('debe devolver 404 si la tarea no existe', async () => {
      const response = await request(app).post('/tasks/no-existe/complete');

      expect(response.status).toBe(404);
    });

    it('debe devolver 400 si ya está completada', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Tarea' });

      // Completamos la primera vez
      await request(app).post(`/tasks/${created.body.id}/complete`);

      // Intentamos completar de nuevo
      const response = await request(app).post(
        `/tasks/${created.body.id}/complete`
      );

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('ya está completada');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('debe eliminar la tarea y devolver 204', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Tarea a eliminar' });

      const response = await request(app).delete(`/tasks/${created.body.id}`);

      expect(response.status).toBe(204);
    });

    it('debe devolver 404 si no existe', async () => {
      const response = await request(app).delete('/tasks/no-existe');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /health', () => {
    it('debe devolver status ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});
