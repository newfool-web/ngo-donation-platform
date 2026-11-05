import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const donationSchema = z.object({
  campaignId: z.string().uuid().optional(),
  amount: z.number().min(100).max(1000000),
  type: z.enum(['ONE_TIME', 'MONTHLY']),
  donorName: z.string().min(2),
  donorEmail: z.string().email(),
  donorPhone: z.string().optional(),
  donorPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional(),
  idempotencyKey: z.string().uuid(),
});

export const schemeSchema = z.object({
  code: z.string().min(1),
  nameHi: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionHi: z.string().min(1),
  descriptionEn: z.string().min(1),
  category: z.string().min(1),
  eligibility: z.object({}).passthrough(),
  benefits: z.string().min(1),
  benefitsHi: z.string().min(1),
  documents: z.array(z.string()),
  documentsHi: z.array(z.string()),
  applicationProcess: z.string().min(1),
  applicationProcessHi: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  lastCheckedDate: z.string().optional(),
  helpCentreId: z.string().uuid().optional(),
  district: z.array(z.string()),
});

export const campaignSchema = z.object({
  title: z.string().min(1),
  titleHi: z.string().min(1),
  description: z.string().min(1),
  descriptionHi: z.string().min(1),
  targetAmount: z.number().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
});

export const eligibilitySchema = z.object({
  district: z.string().min(1),
  age: z.number().min(1).max(120),
  maritalStatus: z.enum(['married', 'unmarried', 'widow', 'divorced']),
  isPregnant: z.boolean(),
  isSHGMember: z.boolean(),
  isBPL: z.boolean(),
});
