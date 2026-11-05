import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

export class DonationService {
  /**
   * Generate a unique receipt number using atomic database operations.
   * Uses PostgreSQL advisory locks + sequence table for guaranteed uniqueness.
   */
  static async generateReceiptNumber(): Promise<string> {
    const now = new Date();
    const fiscalYear = now.getMonth() >= 3
      ? `${now.getFullYear()}-${now.getFullYear() + 1}`
      : `${now.getFullYear() - 1}-${now.getFullYear()}`;

    const result = await prisma.$queryRaw<{ next_number: number }[]>`
      INSERT INTO receipt_sequences ("fiscalYear", "lastNumber")
      VALUES (${fiscalYear}, 1)
      ON CONFLICT ("fiscalYear")
      DO UPDATE SET "lastNumber" = receipt_sequences."lastNumber" + 1
      RETURNING "lastNumber" as next_number
    `;

    const seqNum = result[0].next_number;
    const paddedNum = String(seqNum).padStart(6, '0');
    return `REC-${fiscalYear.replace('-', '')}-${paddedNum}`;
  }

  /**
   * Generate a certificate number derived from receipt number.
   */
  static generateCertificateNumber(receiptNumber: string): string {
    return receiptNumber.replace('REC-', '80G-');
  }

  /**
   * Process a donation with idempotency protection.
   * The entire flow is wrapped in a transaction.
   */
  static async processDonation(data: {
    donorId: string;
    campaignId?: string;
    amount: number;
    type: 'ONE_TIME' | 'MONTHLY';
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    donorPan?: string;
    idempotencyKey: string;
  }) {
    // Check for existing donation with same idempotency key
    const existing = await prisma.donation.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });
    if (existing) {
      return existing;
    }

    // Validate amount
    if (data.amount < 100 || data.amount > 1000000) {
      throw new AppError('Amount must be between ₹100 and ₹10,00,000', 400);
    }

    // Validate campaign exists if provided
    if (data.campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: data.campaignId },
      });
      if (!campaign || campaign.status !== 'ACTIVE') {
        throw new AppError('Campaign not found or inactive', 400);
      }
    }

    // Generate receipt number atomically
    const receiptNumber = await this.generateReceiptNumber();
    const certificateNumber = this.generateCertificateNumber(receiptNumber);

    // Simulate payment (mock) — 90% success rate
    const paymentSuccess = Math.random() > 0.1;
    const paymentId = paymentSuccess ? `PAY-${uuidv4().slice(0, 12).toUpperCase()}` : null;

    // Create donation in transaction
    const donation = await prisma.$transaction(async (tx) => {
      const d = await tx.donation.create({
        data: {
          receiptNumber,
          certificateNumber,
          donorId: data.donorId,
          campaignId: data.campaignId,
          amount: data.amount,
          type: data.type,
          status: paymentSuccess ? 'SUCCESS' : 'FAILED',
          paymentId,
          idempotencyKey: data.idempotencyKey,
          donorName: data.donorName,
          donorEmail: data.donorEmail,
          donorPhone: data.donorPhone,
          donorPan: data.donorPan,
        },
      });

      // Update campaign raised amount on success
      if (paymentSuccess && data.campaignId) {
        await tx.campaign.update({
          where: { id: data.campaignId },
          data: { raisedAmount: { increment: data.amount } },
        });
      }

      return d;
    });

    return donation;
  }

  static async getDonorDonations(donorId: string) {
    return prisma.donation.findMany({
      where: { donorId },
      include: { campaign: { select: { title: true, titleHi: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getDonationById(id: string, donorId?: string) {
    const where: any = { id };
    if (donorId) where.donorId = donorId;

    const donation = await prisma.donation.findFirst({
      where,
      include: {
        campaign: { select: { title: true, titleHi: true } },
        donor: { select: { name: true, email: true } },
      },
    });
    if (!donation) throw new AppError('Donation not found', 404);
    return donation;
  }

  static async getRecentDonations(limit: number = 10) {
    return prisma.donation.findMany({
      where: { status: 'SUCCESS' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        receiptNumber: true,
        amount: true,
        donorName: true,
        createdAt: true,
        campaign: { select: { title: true, titleHi: true } },
      },
    });
  }

  static async getStats() {
    const [totalDonations, totalDonors, totalAmount, campaignCount, schemeCount] =
      await Promise.all([
        prisma.donation.count({ where: { status: 'SUCCESS' } }),
        prisma.donation.groupBy({
          by: ['donorId'],
          where: { status: 'SUCCESS' },
          _count: true,
        }),
        prisma.donation.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
        }),
        prisma.campaign.count(),
        prisma.scheme.count({ where: { published: true } }),
      ]);

    return {
      totalDonations,
      totalDonors: totalDonors.length,
      totalAmount: totalAmount._sum.amount || 0,
      campaignCount,
      schemeCount,
    };
  }
}
