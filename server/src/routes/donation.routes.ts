import { Router, Response, NextFunction } from 'express';
import { DonationService } from '../services/donation.service';
import { PdfService } from '../services/pdf.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { donationSchema } from '../validators/schemas';

const router = Router();

// Create a donation (authenticated)
router.post('/', authenticate, validate(donationSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donation = await DonationService.processDonation({
      ...req.body,
      donorId: req.user!.id,
    });
    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
});

// Get donor's donations
router.get('/my', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donations = await DonationService.getDonorDonations(req.user!.id);
    res.json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
});

// Get specific donation (ownership check)
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donorId = req.user!.role === 'ADMIN' ? undefined : req.user!.id;
    const donation = await DonationService.getDonationById(req.params.id, donorId);
    res.json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
});

// Download receipt PDF
router.get('/:id/receipt', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donorId = req.user!.role === 'ADMIN' ? undefined : req.user!.id;
    const donation = await DonationService.getDonationById(req.params.id, donorId);

    if (donation.status !== 'SUCCESS') {
      return res.status(400).json({ success: false, message: 'Receipt available only for successful donations' });
    }

    const pdf = await PdfService.generateReceipt({
      receiptNumber: donation.receiptNumber,
      donorName: donation.donorName,
      donorPan: donation.donorPan,
      amount: donation.amount,
      date: donation.createdAt,
      campaignTitle: donation.campaign?.title,
      type: donation.type,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${donation.receiptNumber}.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

// Download 80G certificate PDF
router.get('/:id/certificate', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donorId = req.user!.role === 'ADMIN' ? undefined : req.user!.id;
    const donation = await DonationService.getDonationById(req.params.id, donorId);

    if (donation.status !== 'SUCCESS') {
      return res.status(400).json({ success: false, message: 'Certificate available only for successful donations' });
    }

    if (!donation.certificateNumber) {
      return res.status(400).json({ success: false, message: 'Certificate not available' });
    }

    const pdf = await PdfService.generateCertificate({
      certificateNumber: donation.certificateNumber,
      receiptNumber: donation.receiptNumber,
      donorName: donation.donorName,
      donorPan: donation.donorPan,
      amount: donation.amount,
      date: donation.createdAt,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=80G-${donation.certificateNumber}.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

export default router;
