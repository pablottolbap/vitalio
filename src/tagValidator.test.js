import { describe, it, expect } from 'vitest';
import { validateNewTags } from './tagValidator';

describe('tagValidator', () => {
  const existingTags = ['diet', 'nutrition', 'fat', 'carbs', 'meat'];

  describe('validateNewTags', () => {
    it('returns no conflicts for valid new tags', () => {
      const result = validateNewTags(existingTags, 'exercise, sleep');
      expect(result.hasConflicts).toBe(false);
      expect(result.conflictingTags).toHaveLength(0);
    });

    it('detects conflict when adding plural variant of existing tag', () => {
      const result = validateNewTags(existingTags, 'fats');
      expect(result.hasConflicts).toBe(true);
      expect(result.conflictingTags).toContain('fats');
      expect(result.suggestions).toHaveProperty('fats', 'fat');
      expect(result.message).toContain('fats');
      expect(result.message).toContain('fat');
    });

    it('detects conflict when adding gerund variant', () => {
      const result = validateNewTags(existingTags, 'training');
      expect(result.hasConflicts).toBe(false); // "training" doesn't conflict with existing tags
    });

    it('detects conflicts between new tags themselves', () => {
      const result = validateNewTags(existingTags, 'run, running');
      expect(result.hasConflicts).toBe(true);
      expect(result.message).toContain('conflict with each other');
    });

    it('handles comma-separated input with whitespace', () => {
      const result = validateNewTags(existingTags, '  exercise  ,  sleep  ');
      expect(result.hasConflicts).toBe(false);
    });

    it('ignores empty input', () => {
      const result = validateNewTags(existingTags, '');
      expect(result.hasConflicts).toBe(false);
      expect(result.conflictingTags).toHaveLength(0);
    });

    it('handles multiple conflicts in new tags', () => {
      const result = validateNewTags(existingTags, 'fats, carbs, proteins');
      expect(result.hasConflicts).toBe(true);
      // "fats" conflicts with "fat", "carbs" already exists (exact match handled elsewhere)
    });

    it('normalizes tags to lowercase', () => {
      const result = validateNewTags(existingTags, 'EXERCISE, Sleep');
      expect(result.hasConflicts).toBe(false);
    });

    it('case-insensitive conflict detection', () => {
      const result = validateNewTags(['Fat'], 'FATS');
      expect(result.hasConflicts).toBe(true);
    });
  });
});
