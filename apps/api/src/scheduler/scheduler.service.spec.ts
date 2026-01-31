import { SchedulerService } from './scheduler.service';

describe('SchedulerService', () => {
  let service: SchedulerService;

  beforeEach(() => {
    // Create a mock service for testing the date logic
    service = new SchedulerService(
      null as any,
      null as any,
      null as any,
      null as any,
    );
  });

  describe('getLastBusinessDayOfMonth', () => {
    it('should return Friday when last day is Saturday', () => {
      // January 2025 ends on Friday (31st)
      // Let's find a month that ends on Saturday
      // August 2025 ends on Sunday, July 2025 ends on Thursday
      // May 2025 ends on Saturday
      const result = service.getLastBusinessDayOfMonth(2025, 5);
      expect(result.getDate()).toBe(30); // Friday
      expect(result.getDay()).toBe(5); // Friday
    });

    it('should return Friday when last day is Sunday', () => {
      // August 2025 ends on Sunday (31st)
      const result = service.getLastBusinessDayOfMonth(2025, 8);
      expect(result.getDate()).toBe(29); // Friday
      expect(result.getDay()).toBe(5); // Friday
    });

    it('should return the last day when it is a weekday', () => {
      // January 2025 ends on Friday (31st)
      const result = service.getLastBusinessDayOfMonth(2025, 1);
      expect(result.getDate()).toBe(31);
      expect(result.getDay()).toBe(5); // Friday
    });

    it('should return Monday when last day is Monday', () => {
      // March 2025 ends on Monday (31st)
      const result = service.getLastBusinessDayOfMonth(2025, 3);
      expect(result.getDate()).toBe(31);
      expect(result.getDay()).toBe(1); // Monday
    });

    it('should handle February correctly', () => {
      // February 2025 ends on Friday (28th)
      const result = service.getLastBusinessDayOfMonth(2025, 2);
      expect(result.getDate()).toBe(28);
      expect(result.getDay()).toBe(5); // Friday
    });

    it('should handle leap year February', () => {
      // February 2024 ends on Thursday (29th)
      const result = service.getLastBusinessDayOfMonth(2024, 2);
      expect(result.getDate()).toBe(29);
      expect(result.getDay()).toBe(4); // Thursday
    });
  });

  describe('isLastBusinessDayOfMonth', () => {
    it('should return true on the last business day', () => {
      // January 31, 2025 is Friday (last business day)
      const date = new Date(2025, 0, 31); // Month is 0-indexed
      expect(service.isLastBusinessDayOfMonth(date)).toBe(true);
    });

    it('should return false on a regular day', () => {
      const date = new Date(2025, 0, 15);
      expect(service.isLastBusinessDayOfMonth(date)).toBe(false);
    });

    it('should return true on Friday when Saturday is the last day', () => {
      // May 30, 2025 is Friday, May 31 is Saturday
      const date = new Date(2025, 4, 30);
      expect(service.isLastBusinessDayOfMonth(date)).toBe(true);
    });

    it('should return false on Saturday even if it is the last day', () => {
      // May 31, 2025 is Saturday
      const date = new Date(2025, 4, 31);
      expect(service.isLastBusinessDayOfMonth(date)).toBe(false);
    });
  });
});
