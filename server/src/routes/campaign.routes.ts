import { Router, Request, Response, NextFunction } from 'express';
import { CampaignService } from '../services/campaign.service';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await CampaignService.listActive();
    res.json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await CampaignService.getById(req.params.id as string);
    res.json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
});

export default router;
