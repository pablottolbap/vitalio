import { describe, it, expect } from 'vitest';
import { findTagConflicts, formatConflicts } from './tagLinter';

describe('tagLinter', () => {
  describe('findTagConflicts', () => {
    it('detects plural conflicts: fat ↔ fats', () => {
      const tags = ['fat', 'fats', 'protein'];
      const conflicts = findTagConflicts(tags);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0]).toMatchObject({
        tag1: 'fat',
        tag2: 'fats',
        type: 'plural',
      });
    });

    it('detects gerund conflicts: train ↔ training', () => {
      const tags = ['train', 'training', 'run'];
      const conflicts = findTagConflicts(tags);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].type).toBe('gerund');
      expect(
        (conflicts[0].tag1 === 'train' && conflicts[0].tag2 === 'training') ||
          (conflicts[0].tag1 === 'training' && conflicts[0].tag2 === 'train')
      ).toBe(true);
    });

    it('detects doubled consonant gerund: run ↔ running', () => {
      const tags = ['run', 'running'];
      const conflicts = findTagConflicts(tags);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some(c => c.type === 'gerund')).toBe(true);
    });

    it('detects dropped-e gerund: bake ↔ baking', () => {
      const tags = ['bake', 'baking'];
      const conflicts = findTagConflicts(tags);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some(c => c.type === 'gerund')).toBe(true);
    });

    it('returns empty array for non-conflicting tags', () => {
      const tags = ['diet', 'nutrition', 'evolution'];
      const conflicts = findTagConflicts(tags);
      expect(conflicts.length).toBe(0);
    });

    it('handles tags with trailing whitespace', () => {
      // Tags should be normalized before calling this function
      const tags = ['mushroom', 'mushrooms'];
      const conflicts = findTagConflicts(tags);
      expect(conflicts.length).toBe(1);
    });

    it('detects comparative conflicts: cold ↔ colder', () => {
      const tags = ['cold', 'colder'];
      const conflicts = findTagConflicts(tags);
      expect(conflicts.length).toBeGreaterThan(0);
    });

    it('does not flag single tags', () => {
      const tags = ['diet'];
      const conflicts = findTagConflicts(tags);
      expect(conflicts.length).toBe(0);
    });

    it('handles multiple conflicts in same dataset', () => {
      const tags = ['fat', 'fats', 'train', 'training'];
      const conflicts = findTagConflicts(tags);
      expect(conflicts.length).toBe(2);
    });
  });

  describe('formatConflicts', () => {
    it('returns success message for empty conflicts', () => {
      const result = formatConflicts([]);
      expect(result).toContain('No inflection conflicts');
      expect(result).toContain('✓');
    });

    it('formats plural conflicts', () => {
      const conflicts = [{ tag1: 'fat', tag2: 'fats', type: 'plural' }];
      const result = formatConflicts(conflicts);
      expect(result).toContain('fat');
      expect(result).toContain('fats');
      expect(result).toContain('PLURAL');
    });

    it('groups conflicts by type', () => {
      const conflicts = [
        { tag1: 'fat', tag2: 'fats', type: 'plural' },
        { tag1: 'train', tag2: 'training', type: 'gerund' },
      ];
      const result = formatConflicts(conflicts);
      expect(result).toContain('PLURAL');
      expect(result).toContain('GERUND');
    });

    it('shows conflict count', () => {
      const conflicts = [
        { tag1: 'a', tag2: 'ab', type: 'plural' },
        { tag1: 'c', tag2: 'cd', type: 'gerund' },
      ];
      const result = formatConflicts(conflicts);
      expect(result).toContain('2');
    });
  });
});
