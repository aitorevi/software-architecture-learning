import { describe, it, expect, beforeEach } from 'vitest';
import {
  Project,
  ProjectId,
  ProjectValidationError,
  ProjectCreatedEvent,
} from '../../../src/features/projects/domain';

describe('Project Entity', () => {
  describe('create', () => {
    it('should create a project with valid data', () => {
      const project = Project.create({
        id: ProjectId.create('project-1'),
        name: 'My Project',
        description: 'A test project',
      });

      expect(project.name).toBe('My Project');
      expect(project.description).toBe('A test project');
      expect(project.id.value).toBe('project-1');
    });

    it('should create a project without description', () => {
      const project = Project.create({
        id: ProjectId.create('project-1'),
        name: 'My Project',
      });

      expect(project.description).toBe('');
    });

    it('should emit ProjectCreatedEvent when created', () => {
      const project = Project.create({
        id: ProjectId.create('project-1'),
        name: 'My Project',
      });

      const events = project.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProjectCreatedEvent);
      expect((events[0] as ProjectCreatedEvent).projectName).toBe('My Project');
    });

    it('should throw error for empty name', () => {
      expect(() =>
        Project.create({
          id: ProjectId.create('project-1'),
          name: '',
        })
      ).toThrow(ProjectValidationError);
    });

    it('should throw error for name exceeding 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() =>
        Project.create({
          id: ProjectId.create('project-1'),
          name: longName,
        })
      ).toThrow(ProjectValidationError);
    });

    it('should throw error for description exceeding 500 characters', () => {
      const longDescription = 'a'.repeat(501);
      expect(() =>
        Project.create({
          id: ProjectId.create('project-1'),
          name: 'Valid Name',
          description: longDescription,
        })
      ).toThrow(ProjectValidationError);
    });
  });

  describe('update', () => {
    let project: Project;

    beforeEach(() => {
      project = Project.create({
        id: ProjectId.create('project-1'),
        name: 'Original Name',
        description: 'Original description',
      });
      project.pullDomainEvents(); // Clear creation event
    });

    it('should update name', () => {
      project.update({ name: 'New Name' });
      expect(project.name).toBe('New Name');
    });

    it('should update description', () => {
      project.update({ description: 'New description' });
      expect(project.description).toBe('New description');
    });

    it('should emit ProjectUpdatedEvent', () => {
      project.update({ name: 'New Name' });
      const events = project.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('project.updated');
    });

    it('should not emit event when no changes', () => {
      project.update({});
      const events = project.pullDomainEvents();
      expect(events).toHaveLength(0);
    });
  });
});
