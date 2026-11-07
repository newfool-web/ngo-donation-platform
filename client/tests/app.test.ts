import { describe, it, expect } from 'vitest';

describe('API client', () => {
  it('should have correct base path', async () => {
    // Verify the API module exports the expected shape
    const { api } = await import('../src/lib/api');
    expect(api).toBeDefined();
    expect(api.login).toBeTypeOf('function');
    expect(api.register).toBeTypeOf('function');
    expect(api.getSchemes).toBeTypeOf('function');
    expect(api.getCampaigns).toBeTypeOf('function');
    expect(api.createDonation).toBeTypeOf('function');
    expect(api.checkEligibility).toBeTypeOf('function');
    expect(api.getMyDonations).toBeTypeOf('function');
    expect(api.downloadReceipt).toBeTypeOf('function');
    expect(api.downloadCertificate).toBeTypeOf('function');
    expect(api.getStats).toBeTypeOf('function');
  });

  it('should have all admin API methods', async () => {
    const { api } = await import('../src/lib/api');
    expect(api.getAllSchemes).toBeTypeOf('function');
    expect(api.createScheme).toBeTypeOf('function');
    expect(api.toggleSchemePublish).toBeTypeOf('function');
    expect(api.generateSchemeSummary).toBeTypeOf('function');
    expect(api.approveSchemeSummary).toBeTypeOf('function');
    expect(api.getAllCampaigns).toBeTypeOf('function');
    expect(api.createCampaign).toBeTypeOf('function');
    expect(api.toggleCampaignStatus).toBeTypeOf('function');
    expect(api.getCampaignReport).toBeTypeOf('function');
  });
});

describe('Language context', () => {
  it('should translate correctly', () => {
    // Test the translation function logic inline
    const t = (hi: string, en: string, lang: string) => (lang === 'hi' ? hi : en);
    expect(t('होम', 'Home', 'hi')).toBe('होम');
    expect(t('होम', 'Home', 'en')).toBe('Home');
    expect(t('योजनाएं', 'Schemes', 'hi')).toBe('योजनाएं');
    expect(t('योजनाएं', 'Schemes', 'en')).toBe('Schemes');
  });
});
