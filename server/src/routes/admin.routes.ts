import { Router, Response, NextFunction } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { schemeSchema, campaignSchema } from '../validators/schemas';
import { SchemeService } from '../services/scheme.service';
import { CampaignService } from '../services/campaign.service';
import { DonationService } from '../services/donation.service';
import { AiService } from '../services/ai.service';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await DonationService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// Recent donations
router.get('/donations/recent', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donations = await DonationService.getRecentDonations(20);
    res.json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
});

// Scheme management
router.get('/schemes', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schemes = await SchemeService.listAll();
    res.json({ success: true, data: schemes });
  } catch (error) {
    next(error);
  }
});

router.post('/schemes', validate(schemeSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = {
      ...req.body,
      lastCheckedDate: req.body.lastCheckedDate ? new Date(req.body.lastCheckedDate) : undefined,
    };
    const scheme = await SchemeService.create(data);
    res.status(201).json({ success: true, data: scheme });
  } catch (error) {
    next(error);
  }
});

router.put('/schemes/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = {
      ...req.body,
      lastCheckedDate: req.body.lastCheckedDate ? new Date(req.body.lastCheckedDate) : undefined,
    };
    const scheme = await SchemeService.update(req.params.id, data);
    res.json({ success: true, data: scheme });
  } catch (error) {
    next(error);
  }
});

router.patch('/schemes/:id/toggle-publish', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scheme = await SchemeService.togglePublish(req.params.id);
    res.json({ success: true, data: scheme });
  } catch (error) {
    next(error);
  }
});

// AI summary generation
router.post('/schemes/:id/generate-summary', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scheme = await SchemeService.getById(req.params.id);
    const summary = await AiService.generateHindiSummary({
      nameEn: scheme.nameEn,
      nameHi: scheme.nameHi,
      descriptionEn: scheme.descriptionEn,
      eligibility: scheme.eligibility,
      benefits: scheme.benefits,
    });

    if (summary) {
      await SchemeService.update(req.params.id, {
        summaryAiDraft: summary,
        summaryApproved: false,
      });
    }

    res.json({ success: true, data: { draft: summary } });
  } catch (error) {
    next(error);
  }
});

router.patch('/schemes/:id/approve-summary', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scheme = await SchemeService.approveSummary(req.params.id);
    res.json({ success: true, data: scheme });
  } catch (error) {
    next(error);
  }
});

// Campaign management
router.get('/campaigns', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const campaigns = await CampaignService.listAll();
    res.json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
});

router.post('/campaigns', validate(campaignSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = {
      ...req.body,
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    };
    const campaign = await CampaignService.create(data);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
});

router.put('/campaigns/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    };
    const campaign = await CampaignService.update(req.params.id, data);
    res.json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
});

router.patch('/campaigns/:id/toggle-status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const campaign = await CampaignService.toggleStatus(req.params.id);
    res.json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
});

router.get('/campaigns/:id/report', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const report = await CampaignService.getReport(req.params.id);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

export default router;
