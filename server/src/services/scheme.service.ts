import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

export class SchemeService {
  static async listPublished(filters?: { category?: string; district?: string }) {
    const where: any = { published: true };
    if (filters?.category) where.category = filters.category;
    if (filters?.district) where.district = { has: filters.district };

    return prisma.scheme.findMany({
      where,
      include: { helpCentre: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: string) {
    const scheme = await prisma.scheme.findUnique({
      where: { id },
      include: { helpCentre: true },
    });
    if (!scheme) throw new AppError('Scheme not found', 404);
    return scheme;
  }

  static async listAll() {
    return prisma.scheme.findMany({
      include: { helpCentre: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async create(data: {
    code: string;
    nameHi: string;
    nameEn: string;
    descriptionHi: string;
    descriptionEn: string;
    category: string;
    eligibility: any;
    benefits: string;
    benefitsHi: string;
    documents: string[];
    documentsHi: string[];
    applicationProcess: string;
    applicationProcessHi: string;
    sourceUrl?: string;
    lastCheckedDate?: Date;
    helpCentreId?: string;
    district: string[];
  }) {
    return prisma.scheme.create({ data });
  }

  static async update(id: string, data: any) {
    const existing = await prisma.scheme.findUnique({ where: { id } });
    if (!existing) throw new AppError('Scheme not found', 404);
    return prisma.scheme.update({ where: { id }, data });
  }

  static async togglePublish(id: string) {
    const scheme = await prisma.scheme.findUnique({ where: { id } });
    if (!scheme) throw new AppError('Scheme not found', 404);
    return prisma.scheme.update({
      where: { id },
      data: { published: !scheme.published },
    });
  }

  static async approveSummary(id: string) {
    const scheme = await prisma.scheme.findUnique({ where: { id } });
    if (!scheme) throw new AppError('Scheme not found', 404);
    if (!scheme.summaryAiDraft) throw new AppError('No AI draft to approve', 400);
    return prisma.scheme.update({
      where: { id },
      data: {
        summaryHi: scheme.summaryAiDraft,
        summaryApproved: true,
      },
    });
  }

  static async getCategories() {
    const schemes = await prisma.scheme.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ['category'],
    });
    return schemes.map(s => s.category);
  }

  static async getDistricts() {
    const schemes = await prisma.scheme.findMany({
      where: { published: true },
      select: { district: true },
    });
    const districts = new Set<string>();
    schemes.forEach(s => s.district.forEach(d => districts.add(d)));
    return Array.from(districts).sort();
  }
}
