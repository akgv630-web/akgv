import { describe, it, expect } from 'vitest';
import { AREA_SCHEDULE, INITIAL_PLOTS } from '../src/data/groundTruth';

describe('Plot Master Plan & Area Schedule Tests', () => {
  it('should match exact blueprint area schedule transcribed from brochure', () => {
    expect(AREA_SCHEDULE.totalAreaSqft).toBe(77550);
    expect(AREA_SCHEDULE.plotAreaSqft).toBe(55970);
    expect(AREA_SCHEDULE.roadAreaSqft).toBe(21580);
    expect(AREA_SCHEDULE.roadPercentage).toBe(27.82);
    expect(AREA_SCHEDULE.mainRoadWidth).toContain("30'-0\"");
    expect(AREA_SCHEDULE.internalRoadWidth).toContain("25'-0\"");
  });

  it('should verify Block A, B, and C plots exist with correct dimensions', () => {
    const plotA01 = INITIAL_PLOTS.find((p) => p.plotNumber === 'A-01');
    expect(plotA01).toBeDefined();
    expect(plotA01?.areaSqft).toBe(1500);
    expect(plotA01?.dimensions).toBe("30' x 50'");
    expect(plotA01?.roadWidth).toBe("30'-0\" WIDE");

    const plotA04 = INITIAL_PLOTS.find((p) => p.plotNumber === 'A-04');
    expect(plotA04).toBeDefined();
    expect(plotA04?.areaSqft).toBe(1250);
    expect(plotA04?.dimensions).toBe("25' x 50'");

    const plotB01 = INITIAL_PLOTS.find((p) => p.plotNumber === 'B-01');
    expect(plotB01).toBeDefined();
    expect(plotB01?.areaSqft).toBe(1000);
    expect(plotB01?.dimensions).toBe("20' x 50'");

    const plotC01 = INITIAL_PLOTS.find((p) => p.plotNumber === 'C-01');
    expect(plotC01).toBeDefined();
    expect(plotC01?.areaSqft).toBe(1260);
    expect(plotC01?.dimensions).toBe("42' x 30'");
  });

  it('should verify plot booking eligibility rules', () => {
    const greenPlots = INITIAL_PLOTS.filter((p) => p.status === 'available_green');
    expect(greenPlots.length).toBeGreaterThan(0);

    const bookedPlots = INITIAL_PLOTS.filter((p) => p.status === 'booked_yellow');
    expect(bookedPlots.length).toBeGreaterThan(0);

    const vacantPlots = INITIAL_PLOTS.filter((p) => p.status === 'vacant_red');
    expect(vacantPlots.length).toBeGreaterThan(0);
  });
});
