const supabase = require('../../../src/config/supabase');

jest.mock('../../../src/config/supabase', () => ({
  rpc: jest.fn(),
}));

const metricsRepository = require('../../../src/repositories/metricsRepository');

describe('metricsRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('incrementDailyMetric', () => {
    it('should call supabase.rpc with correct params', async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: null });

      await metricsRepository.incrementDailyMetric('2024-01-15', 'new_users', 1);

      expect(supabase.rpc).toHaveBeenCalledWith('increment_daily_metric', {
        p_date: '2024-01-15',
        p_column: 'new_users',
        p_amount: 1,
      });
    });

    it('should throw when rpc returns error', async () => {
      const dbError = new Error('RPC failed');
      supabase.rpc.mockResolvedValue({ data: null, error: dbError });

      await expect(
        metricsRepository.incrementDailyMetric('2024-01-15', 'new_users', 1),
      ).rejects.toThrow(dbError);
    });

    it('should throw for disallowed column', async () => {
      await expect(
        metricsRepository.incrementDailyMetric('2024-01-15', 'malicious_column', 1),
      ).rejects.toThrow('Invalid metric column');
    });
  });

  describe('incrementMonthlyMetric', () => {
    it('should call supabase.rpc with correct params', async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: null });

      await metricsRepository.incrementMonthlyMetric('2024-01-01', 'total_vendors', 1);

      expect(supabase.rpc).toHaveBeenCalledWith('increment_monthly_metric', {
        p_month: '2024-01-01',
        p_column: 'total_vendors',
        p_amount: 1,
      });
    });

    it('should throw for disallowed column', async () => {
      await expect(
        metricsRepository.incrementMonthlyMetric('2024-01-01', 'invalid_col', 1),
      ).rejects.toThrow('Invalid metric column');
    });
  });

  describe('incrementVendorDailyMetric', () => {
    it('should call supabase.rpc with correct params', async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: null });

      await metricsRepository.incrementVendorDailyMetric('vendor-1', '2024-01-15', 'branches_count', 1);

      expect(supabase.rpc).toHaveBeenCalledWith('increment_vendor_daily_metric', {
        p_vendor_id: 'vendor-1',
        p_date: '2024-01-15',
        p_column: 'branches_count',
        p_amount: 1,
      });
    });

    it('should throw for disallowed column', async () => {
      await expect(
        metricsRepository.incrementVendorDailyMetric('v1', '2024-01-15', 'bad_col', 1),
      ).rejects.toThrow('Invalid metric column');
    });
  });
});
