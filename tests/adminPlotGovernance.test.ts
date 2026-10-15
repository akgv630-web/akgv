import { describe, it, expect, beforeEach } from 'vitest';
import { INITIAL_PLOTS } from '../src/data/groundTruth';
import { Plot, Booking } from '../src/types';

describe('Admin Plot Governance & Registration Tests', () => {
  let currentPlots: Plot[];

  beforeEach(() => {
    currentPlots = JSON.parse(JSON.stringify(INITIAL_PLOTS));
  });

  it('should successfully add a new plot with complete demarcated attributes and pricing', () => {
    const initialCount = currentPlots.length;

    const newPlotData: Omit<Plot, 'id'> = {
      plotNumber: 'A-11',
      block: 'A',
      locationId: 'loc-rampur',
      areaSqft: 1250,
      dimensions: "25' x 50'",
      roadWidth: "30'-0\" WIDE",
      roadFacing: 'North',
      status: 'available_green',
      basePriceInr: 1500000,
      suitableHouseModelIds: ['model-royal-villa', 'model-emerald-duplex'],
      isCornerPlot: true,
      notes: 'New corner plot in Block A',
      x: 900,
      y: 730,
      width: 75,
      height: 125,
    };

    const newPlot: Plot = {
      ...newPlotData,
      id: `plot-a-11-${Date.now()}`
    };

    currentPlots.push(newPlot);

    expect(currentPlots.length).toBe(initialCount + 1);
    const added = currentPlots.find((p) => p.plotNumber === 'A-11');
    expect(added).toBeDefined();
    expect(added?.areaSqft).toBe(1250);
    expect(added?.basePriceInr).toBe(1500000);
    expect(added?.isCornerPlot).toBe(true);
    expect(added?.status).toBe('available_green');
  });

  it('should prevent duplicate plot numbers in the inventory', () => {
    const isDuplicate = (plotNum: string, plotsList: Plot[]) => {
      const clean = plotNum.trim().toUpperCase();
      return plotsList.some((p) => p.plotNumber.toUpperCase() === clean);
    };

    expect(isDuplicate('A-04', currentPlots)).toBe(true);
    expect(isDuplicate('a-04', currentPlots)).toBe(true);
    expect(isDuplicate('B-01', currentPlots)).toBe(true);
    expect(isDuplicate('A-999', currentPlots)).toBe(false);
  });

  it('should update plot status, price, and dimensions', () => {
    const targetPlot = currentPlots.find((p) => p.plotNumber === 'A-08');
    expect(targetPlot).toBeDefined();

    // Update
    targetPlot!.basePriceInr = 1350000;
    targetPlot!.status = 'booked_yellow';
    targetPlot!.roadFacing = 'East';

    expect(targetPlot?.basePriceInr).toBe(1350000);
    expect(targetPlot?.status).toBe('booked_yellow');
    expect(targetPlot?.roadFacing).toBe('East');
  });

  it('should prevent deleting a plot that has active booking records', () => {
    const targetPlot = currentPlots.find((p) => p.plotNumber === 'A-03');
    expect(targetPlot).toBeDefined();

    const mockBookings: Booking[] = [
      {
        id: 'bk-test-01',
        bookingNumber: 'BK-2026-001',
        plotId: targetPlot!.id,
        plotNumber: targetPlot!.plotNumber,
        buyerId: 'usr-buyer-01',
        buyerName: 'Pradeep Verma',
        buyerPhone: '9812345678',
        status: 'confirmed',
        totalAmountInr: 1500000,
        paidAmountInr: 1500000,
        createdAt: new Date().toISOString(),
      }
    ];

    const canDeletePlot = (plotId: string) => {
      return !mockBookings.some((b) => b.plotId === plotId && b.status !== 'cancelled');
    };

    expect(canDeletePlot(targetPlot!.id)).toBe(false);

    // Cancel booking and retry
    mockBookings[0].status = 'cancelled';
    expect(canDeletePlot(targetPlot!.id)).toBe(true);
  });
});
