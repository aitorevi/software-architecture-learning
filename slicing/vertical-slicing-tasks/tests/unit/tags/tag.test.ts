import { describe, it, expect } from 'vitest';
import {
  Tag,
  TagId,
  Color,
  TagValidationError,
  ColorValidationError,
} from '../../../src/features/tags/domain';

describe('Tag Entity', () => {
  describe('create', () => {
    it('should create a tag with valid data', () => {
      const tag = Tag.create({
        id: TagId.create('tag-1'),
        name: 'Important',
        color: Color.create('#FF0000'),
      });

      expect(tag.name).toBe('Important');
      expect(tag.color.value).toBe('#FF0000');
    });

    it('should throw error for empty name', () => {
      expect(() =>
        Tag.create({
          id: TagId.create('tag-1'),
          name: '',
          color: Color.RED,
        })
      ).toThrow(TagValidationError);
    });

    it('should throw error for name exceeding 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(() =>
        Tag.create({
          id: TagId.create('tag-1'),
          name: longName,
          color: Color.RED,
        })
      ).toThrow(TagValidationError);
    });
  });

  describe('update', () => {
    it('should update name', () => {
      const tag = Tag.create({
        id: TagId.create('tag-1'),
        name: 'Original',
        color: Color.RED,
      });

      tag.updateName('Updated');
      expect(tag.name).toBe('Updated');
    });

    it('should update color', () => {
      const tag = Tag.create({
        id: TagId.create('tag-1'),
        name: 'Tag',
        color: Color.RED,
      });

      tag.updateColor(Color.BLUE);
      expect(tag.color.value).toBe('#0000FF');
    });
  });
});

describe('Color Value Object', () => {
  it('should create a valid hex color', () => {
    const color = Color.create('#FF5733');
    expect(color.value).toBe('#FF5733');
  });

  it('should normalize to uppercase', () => {
    const color = Color.create('#ff5733');
    expect(color.value).toBe('#FF5733');
  });

  it('should throw error for invalid format', () => {
    expect(() => Color.create('red')).toThrow(ColorValidationError);
    expect(() => Color.create('#FFF')).toThrow(ColorValidationError);
    expect(() => Color.create('#GGGGGG')).toThrow(ColorValidationError);
  });

  it('should provide predefined colors', () => {
    expect(Color.RED.value).toBe('#FF0000');
    expect(Color.GREEN.value).toBe('#00FF00');
    expect(Color.BLUE.value).toBe('#0000FF');
  });
});
