import { Router, Request, Response, NextFunction } from 'express';
import { EligibilityService } from '../services/eligibility.service';
import { validate } from '../middleware/validate';
import { eligibilitySchema } from '../validators/schemas';

const router = Router();

router.post('/check', validate(eligibilitySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await EligibilityService.findMatchingSchemes(req.body);
    res.json({
      success: true,
      data: {
        results,
        disclaimer: 'यह पात्रता जाँच सांकेतिक है। अंतिम पात्रता सरकारी नियमों के अनुसार निर्धारित होती है।',
        disclaimerEn: 'This eligibility check is indicative only. Final eligibility is determined by government rules.',
        helpline: '1800-XXX-XXXX',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
