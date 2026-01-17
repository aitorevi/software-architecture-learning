/**
 * VERTICAL SLICING EXAMPLE - Main Application Entry Point
 *
 * This is the composition root where all features are wired together.
 *
 * VERTICAL SLICING KEY CONCEPT:
 * Notice how each feature is self-contained. We import the complete
 * feature module (repositories, use cases, controllers) from a single index.
 *
 * Compare this to horizontal layering where you'd have:
 * - import { BookRepository, UserRepository, ... } from './infrastructure/repositories'
 * - import { RegisterBookUseCase, LoanBookUseCase, ... } from './application/use-cases'
 * - import { BookController, UserController, ... } from './infrastructure/controllers'
 *
 * In vertical slicing, each feature is a complete module:
 * - import * from './features/projects'  // Everything for projects
 * - import * from './features/tasks'     // Everything for tasks
 * - import * from './features/tags'      // Everything for tags
 */

import express from 'express';
import { UuidIdGenerator } from './shared/infrastructure/UuidIdGenerator';

// Import complete features
import {
  InMemoryProjectRepository,
  CreateProjectUseCase,
  GetProjectUseCase,
  ListProjectsUseCase,
  UpdateProjectUseCase,
  DeleteProjectUseCase,
  ProjectController,
} from './features/projects';

import {
  InMemoryTaskRepository,
  CreateTaskUseCase,
  GetTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
  UpdateTaskStatusUseCase,
  StartTaskUseCase,
  CompleteTaskUseCase,
  ReopenTaskUseCase,
  AddTagToTaskUseCase,
  RemoveTagFromTaskUseCase,
  DeleteTaskUseCase,
  TaskController,
} from './features/tasks';

import {
  InMemoryTagRepository,
  CreateTagUseCase,
  GetTagUseCase,
  ListTagsUseCase,
  UpdateTagUseCase,
  DeleteTagUseCase,
  TagController,
} from './features/tags';

/**
 * Application Container - Dependency Injection
 *
 * Each feature is wired independently. If you need to add a new feature,
 * you only need to:
 * 1. Create the feature folder with domain, application, infrastructure
 * 2. Wire it here
 * 3. Mount the router
 *
 * The existing features don't need to change!
 */
function createApp() {
  const app = express();
  app.use(express.json());

  // Shared infrastructure
  const idGenerator = new UuidIdGenerator();

  // === Projects Feature ===
  const projectRepository = new InMemoryProjectRepository();
  const createProjectUseCase = new CreateProjectUseCase(
    projectRepository,
    idGenerator
  );
  const getProjectUseCase = new GetProjectUseCase(projectRepository);
  const listProjectsUseCase = new ListProjectsUseCase(projectRepository);
  const updateProjectUseCase = new UpdateProjectUseCase(projectRepository);
  const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);

  const projectController = new ProjectController(
    createProjectUseCase,
    getProjectUseCase,
    listProjectsUseCase,
    updateProjectUseCase,
    deleteProjectUseCase
  );

  // === Tasks Feature ===
  const taskRepository = new InMemoryTaskRepository();
  const createTaskUseCase = new CreateTaskUseCase(taskRepository, idGenerator);
  const getTaskUseCase = new GetTaskUseCase(taskRepository);
  const listTasksUseCase = new ListTasksUseCase(taskRepository);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
  const updateTaskStatusUseCase = new UpdateTaskStatusUseCase(taskRepository);
  const startTaskUseCase = new StartTaskUseCase(taskRepository);
  const completeTaskUseCase = new CompleteTaskUseCase(taskRepository);
  const reopenTaskUseCase = new ReopenTaskUseCase(taskRepository);
  const addTagToTaskUseCase = new AddTagToTaskUseCase(taskRepository);
  const removeTagFromTaskUseCase = new RemoveTagFromTaskUseCase(taskRepository);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);

  const taskController = new TaskController(
    createTaskUseCase,
    getTaskUseCase,
    listTasksUseCase,
    updateTaskUseCase,
    updateTaskStatusUseCase,
    startTaskUseCase,
    completeTaskUseCase,
    reopenTaskUseCase,
    addTagToTaskUseCase,
    removeTagFromTaskUseCase,
    deleteTaskUseCase
  );

  // === Tags Feature ===
  const tagRepository = new InMemoryTagRepository();
  const createTagUseCase = new CreateTagUseCase(tagRepository, idGenerator);
  const getTagUseCase = new GetTagUseCase(tagRepository);
  const listTagsUseCase = new ListTagsUseCase(tagRepository);
  const updateTagUseCase = new UpdateTagUseCase(tagRepository);
  const deleteTagUseCase = new DeleteTagUseCase(tagRepository);

  const tagController = new TagController(
    createTagUseCase,
    getTagUseCase,
    listTagsUseCase,
    updateTagUseCase,
    deleteTagUseCase
  );

  // Mount feature routers
  app.use('/api/projects', projectController.router);
  app.use('/api/tasks', taskController.router);
  app.use('/api/tags', tagController.router);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', architecture: 'vertical-slicing' });
  });

  return app;
}

// Start server
const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║       Task Manager - Vertical Slicing Architecture            ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                       ║
║                                                               ║
║  Features:                                                    ║
║    /api/projects  - Project management                        ║
║    /api/tasks     - Task management                           ║
║    /api/tags      - Tag management                            ║
║                                                               ║
║  This example demonstrates VERTICAL SLICING:                  ║
║  Each feature contains its own domain, application,           ║
║  and infrastructure layers.                                   ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export { createApp };
