import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

export class CampaignService {
  static async listActive() {
    return prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async listAll() {
    return prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new AppError('Campaign not found', 404);
    return campaign;
  }

  static async create(data: {
    title: string;
    titleHi: string;
    description: string;
    descriptionHi: string;
    targetAmount: number;
    startDate: Date;
    endDate?: Date;
  }) {
    return prisma.campaign.create({ data });
  }

  static async update(id: string, data: any) {
    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) throw new AppError('Campaign not found', 404);
    return prisma.campaign.update({ where: { id }, data });
  }

  static async toggleStatus(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new AppError('Campaign not found', 404);
    const newStatus = campaign.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return prisma.campaign.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  static async getReport(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new AppError('Campaign not found', 404);

    const donations = await prisma.donation.findMany({
      where: { campaignId: id, status: 'SUCCESS' },
      select: {
        id: true,
        amount: true,
        donorName: true,
        createdAt: true,
        receiptNumber: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const donorCount = new Set(donations.map(d => d.donorName)).size;

    return {
      campaign,
      totalAmount,
      donorCount,
      donationCount: donations.length,
      donations,
    };
  }
}
