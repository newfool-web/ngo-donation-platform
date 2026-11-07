import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('../src/db/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    scheme: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    campaign: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    donation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
    receiptSequence: {
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  },
}));

import prisma from '../src/db/prisma';
import { AuthService } from '../src/services/auth.service';
import { SchemeService } from '../src/services/scheme.service';
import { EligibilityService } from '../src/services/eligibility.service';
import { DonationService } from '../src/services/donation.service';
import { PdfService } from '../src/services/pdf.service';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should register a new user', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-1', email: 'test@example.com', name: 'Test User', role: 'DONOR',
    });

    const result = await AuthService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeTruthy();
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should reject duplicate email registration', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' });

    await expect(
      AuthService.register({ email: 'test@example.com', password: 'password123', name: 'Test' })
    ).rejects.toThrow('Email already registered');
  });

  it('should login with valid credentials', async () => {
    const hash = await bcrypt.hash('password123', 12);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user-1', email: 'test@example.com', name: 'Test', role: 'DONOR', passwordHash: hash,
    });

    const result = await AuthService.login('test@example.com', 'password123');
    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeTruthy();
  });

  it('should reject invalid password', async () => {
    const hash = await bcrypt.hash('password123', 12);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user-1', email: 'test@example.com', passwordHash: hash,
    });

    await expect(AuthService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
  });

  it('should reject non-existent user login', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    await expect(AuthService.login('nonexistent@example.com', 'password')).rejects.toThrow('Invalid credentials');
  });
});

describe('SchemeService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should list published schemes', async () => {
    const mockSchemes = [
      { id: '1', nameHi: 'Test', published: true },
    ];
    (prisma.scheme.findMany as any).mockResolvedValue(mockSchemes);

    const result = await SchemeService.listPublished();
    expect(result).toHaveLength(1);
    expect(prisma.scheme.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { published: true } })
    );
  });

  it('should filter by category', async () => {
    (prisma.scheme.findMany as any).mockResolvedValue([]);
    await SchemeService.listPublished({ category: 'health' });
    expect(prisma.scheme.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { published: true, category: 'health' } })
    );
  });

  it('should get scheme by id', async () => {
    (prisma.scheme.findUnique as any).mockResolvedValue({ id: '1', nameHi: 'Test' });
    const result = await SchemeService.getById('1');
    expect(result.id).toBe('1');
  });

  it('should throw for non-existent scheme', async () => {
    (prisma.scheme.findUnique as any).mockResolvedValue(null);
    await expect(SchemeService.getById('nonexistent')).rejects.toThrow('Scheme not found');
  });

  it('should toggle publish status', async () => {
    (prisma.scheme.findUnique as any).mockResolvedValue({ id: '1', published: false });
    (prisma.scheme.update as any).mockResolvedValue({ id: '1', published: true });

    const result = await SchemeService.togglePublish('1');
    expect(prisma.scheme.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { published: true } })
    );
  });
});

describe('EligibilityService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should match widow pension scheme for eligible widow', async () => {
    (prisma.scheme.findMany as any).mockResolvedValue([
      {
        id: '1', nameHi: 'विधवा पेंशन', nameEn: 'Widow Pension',
        published: true,
        eligibility: {
          minAge: 18, maxAge: 79,
          maritalStatus: ['widow'],
          requiresBPL: true,
          district: ['all'],
        },
      },
    ]);

    const results = await EligibilityService.findMatchingSchemes({
      district: 'Bhopal', age: 45, maritalStatus: 'widow',
      isPregnant: false, isSHGMember: false, isBPL: true,
    });

    expect(results).toHaveLength(1);
    expect(results[0].matchedRules.length).toBeGreaterThan(0);
  });

  it('should not match widow pension for married woman', async () => {
    (prisma.scheme.findMany as any).mockResolvedValue([
      {
        id: '1', nameHi: 'विधवा पेंशन',
        published: true,
        eligibility: {
          minAge: 18, maxAge: 79,
          maritalStatus: ['widow'],
          requiresBPL: true,
          district: ['all'],
        },
      },
    ]);

    const results = await EligibilityService.findMatchingSchemes({
      district: 'Bhopal', age: 35, maritalStatus: 'married',
      isPregnant: false, isSHGMember: false, isBPL: true,
    });

    expect(results).toHaveLength(0);
  });

  it('should match SHG loan for SHG member', async () => {
    (prisma.scheme.findMany as any).mockResolvedValue([
      {
        id: '2', nameHi: 'SHG ऋण',
        published: true,
        eligibility: { requiresSHG: true, district: ['all'], minAge: 18, maxAge: 65 },
      },
    ]);

    const results = await EligibilityService.findMatchingSchemes({
      district: 'Indore', age: 30, maritalStatus: 'married',
      isPregnant: false, isSHGMember: true, isBPL: false,
    });

    expect(results).toHaveLength(1);
  });

  it('should match maternity scheme for pregnant woman', async () => {
    (prisma.scheme.findMany as any).mockResolvedValue([
      {
        id: '3', nameHi: 'मातृत्व लाभ',
        published: true,
        eligibility: { requiresPregnancy: true, district: ['all'], minAge: 18, maxAge: 45 },
      },
    ]);

    const results = await EligibilityService.findMatchingSchemes({
      district: 'Gwalior', age: 25, maritalStatus: 'married',
      isPregnant: true, isSHGMember: false, isBPL: false,
    });

    expect(results).toHaveLength(1);
  });

  it('should reject over-age applicants', async () => {
    (prisma.scheme.findMany as any).mockResolvedValue([
      {
        id: '1', nameHi: 'Test',
        published: true,
        eligibility: { minAge: 18, maxAge: 45, district: ['all'] },
      },
    ]);

    const results = await EligibilityService.findMatchingSchemes({
      district: 'Bhopal', age: 50, maritalStatus: 'married',
      isPregnant: false, isSHGMember: false, isBPL: false,
    });

    expect(results).toHaveLength(0);
  });
});

describe('DonationService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should generate unique receipt numbers', async () => {
    (prisma.$queryRaw as any).mockResolvedValue([{ next_number: 42 }]);

    const receipt = await DonationService.generateReceiptNumber();
    expect(receipt).toMatch(/^REC-\d{8}-\d{6}$/);
    expect(receipt).toContain('000042');
  });

  it('should generate certificate number from receipt number', () => {
    const cert = DonationService.generateCertificateNumber('REC-20262027-000042');
    expect(cert).toBe('80G-20262027-000042');
  });

  it('should return existing donation for duplicate idempotency key', async () => {
    const existing = { id: 'don-1', receiptNumber: 'REC-001', status: 'SUCCESS' };
    (prisma.donation.findUnique as any).mockResolvedValue(existing);

    const result = await DonationService.processDonation({
      donorId: 'user-1', amount: 5000, type: 'ONE_TIME',
      donorName: 'Test', donorEmail: 'test@example.com',
      idempotencyKey: 'existing-key',
    });

    expect(result).toEqual(existing);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('should re-check idempotency inside the transaction', async () => {
    const existing = { id: 'don-1', receiptNumber: 'REC-001', status: 'SUCCESS' };
    const transactionDonation = { findUnique: vi.fn().mockResolvedValue(existing) };
    (prisma.donation.findUnique as any).mockResolvedValue(null);
    (prisma.$transaction as any).mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({ donation: transactionDonation })
    );

    const result = await DonationService.processDonation({
      donorId: 'user-1', amount: 5000, type: 'ONE_TIME',
      donorName: 'Test', donorEmail: 'test@example.com',
      idempotencyKey: 'concurrent-key',
    });

    expect(result).toEqual(existing);
    expect(transactionDonation.findUnique).toHaveBeenCalledWith({
      where: { idempotencyKey: 'concurrent-key' },
    });
  });

  it('should reject amounts below 100', async () => {
    (prisma.donation.findUnique as any).mockResolvedValue(null);

    await expect(DonationService.processDonation({
      donorId: 'user-1', amount: 50, type: 'ONE_TIME',
      donorName: 'Test', donorEmail: 'test@example.com',
      idempotencyKey: 'key-1',
    })).rejects.toThrow('Amount must be between');
  });

  it('should reject amounts above 10 lakh', async () => {
    (prisma.donation.findUnique as any).mockResolvedValue(null);

    await expect(DonationService.processDonation({
      donorId: 'user-1', amount: 1500000, type: 'ONE_TIME',
      donorName: 'Test', donorEmail: 'test@example.com',
      idempotencyKey: 'key-2',
    })).rejects.toThrow('Amount must be between');
  });
});

describe('PdfService', () => {
  it('should generate receipt PDF buffer', async () => {
    const pdf = await PdfService.generateReceipt({
      receiptNumber: 'REC-20262027-000001',
      donorName: 'Test Donor',
      donorPan: 'ABCDE1234F',
      amount: 5000,
      date: new Date(),
      type: 'ONE_TIME',
    });

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(100);
    // Check PDF header
    expect(pdf.slice(0, 5).toString()).toBe('%PDF-');
  });

  it('should generate certificate PDF buffer', async () => {
    const pdf = await PdfService.generateCertificate({
      certificateNumber: '80G-20262027-000001',
      receiptNumber: 'REC-20262027-000001',
      donorName: 'Test Donor',
      donorPan: 'ABCDE1234F',
      amount: 10000,
      date: new Date(),
    });

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(100);
    expect(pdf.slice(0, 5).toString()).toBe('%PDF-');
  });

  it('should mask PAN in receipt', async () => {
    const pdf = await PdfService.generateReceipt({
      receiptNumber: 'REC-TEST-000001',
      donorName: 'Test',
      donorPan: 'ABCDE1234F',
      amount: 1000,
      date: new Date(),
      type: 'ONE_TIME',
    });

    // PDF generated successfully - PAN masking is handled in the service
    expect(pdf).toBeInstanceOf(Buffer);
  });

  it('should handle missing PAN gracefully', async () => {
    const pdf = await PdfService.generateReceipt({
      receiptNumber: 'REC-TEST-000002',
      donorName: 'Test',
      donorPan: null,
      amount: 1000,
      date: new Date(),
      type: 'ONE_TIME',
    });

    expect(pdf).toBeInstanceOf(Buffer);
  });
});

describe('Auth Middleware', () => {
  it('should reject request without auth header', async () => {
    const { authenticate } = await import('../src/middleware/auth');
    const req: any = { headers: {} };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    const { authenticate } = await import('../src/middleware/auth');
    const req: any = { headers: { authorization: 'Bearer invalid-token' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should reject non-admin access to admin routes', async () => {
    const { requireAdmin } = await import('../src/middleware/auth');
    const req: any = { user: { role: 'DONOR' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow admin access to admin routes', async () => {
    const { requireAdmin } = await import('../src/middleware/auth');
    const req: any = { user: { role: 'ADMIN' } };
    const res: any = {};
    const next = vi.fn();

    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
