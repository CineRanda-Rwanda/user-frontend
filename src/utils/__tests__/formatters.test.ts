import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import {
  formatCurrency,
  formatDuration,
  formatRelativeTime,
  truncateText,
  calculatePercentage,
  formatFileSize,
} from '../formatters';

const normalizeCurrency = (value: string) => value.replace(/\u00a0/g, ' ');

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats numbers using FRW prefix by default', () => {
      const result = normalizeCurrency(formatCurrency(1500));
      expect(result).toBe('FRW 1,500');
    });

    it('supports overriding the display code', () => {
      const result = normalizeCurrency(formatCurrency(2500, 'RWF'));
      expect(result).toBe('RWF 2,500');
    });
  });

  describe('formatDuration', () => {
    it('renders minute/second durations under one hour', () => {
      expect(formatDuration(125)).toBe('2:05');
    });

    it('renders hour/minute/second durations above one hour', () => {
      expect(formatDuration(3661)).toBe('1:01:01');
    });
  });

  describe('formatRelativeTime', () => {
    const fixedNow = new Date('2025-01-01T12:00:00Z');

    beforeAll(() => {
      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it('returns "Just now" for dates within a minute', () => {
      const value = new Date(fixedNow.getTime() - 30 * 1000);
      expect(formatRelativeTime(value)).toBe('Just now');
    });

    it('returns minutes ago inside the first hour', () => {
      const value = new Date(fixedNow.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(value)).toBe('5 minutes ago');
    });

    it('falls back to formatted date for older timestamps', () => {
      const value = new Date('2024-11-15T10:00:00Z');
      expect(formatRelativeTime(value)).toContain('2024');
    });
  });

  describe('truncateText', () => {
    it('returns the original string when length is below limit', () => {
      expect(truncateText('cineranda', 20)).toBe('cineranda');
    });

    it('adds ellipsis when trimming longer text', () => {
      expect(truncateText('front row premiere', 10)).toBe('front row...');
    });
  });

  describe('calculatePercentage', () => {
    it('returns 0 when divisor is 0 to avoid NaN', () => {
      expect(calculatePercentage(5, 0)).toBe(0);
    });

    it('rounds the computed percentage', () => {
      expect(calculatePercentage(25, 60)).toBe(42);
    });
  });

  describe('formatFileSize', () => {
    it('handles bytes precisely', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('converts kilobytes to the closest unit', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });
  });
});
