import { Router, Request, Response, NextFunction } from 'express';
import { SchemeService } from '../services/scheme.service';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, district } = req.query;
    const schemes = await SchemeService.listPublished({
      category: category as string,
      district: district as string,
    });
    res.json({ success: true, data: schemes });
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await SchemeService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

router.get('/districts', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const districts = await SchemeService.getDistricts();
    res.json({ success: true, data: districts });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scheme = await SchemeService.getById(req.params.id as string);
    res.json({ success: true, data: scheme });
  } catch (error) {
    next(error);
  }
});

export default router;
