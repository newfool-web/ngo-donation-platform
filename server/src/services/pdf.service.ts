import PDFDocument from 'pdfkit';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

interface ReceiptData {
  receiptNumber: string;
  donorName: string;
  donorPan?: string | null;
  amount: number;
  date: Date;
  campaignTitle?: string;
  type: string;
}

interface CertificateData {
  certificateNumber: string;
  receiptNumber: string;
  donorName: string;
  donorPan?: string | null;
  amount: number;
  date: Date;
}

export class PdfService {
  static generateReceipt(data: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text(config.trustName, { align: 'center' });
      doc.fontSize(10).text(config.trustAddress, { align: 'center' });
      doc.moveDown(0.5);

      // DEMO NOTICE
      doc.fontSize(8)
        .fillColor('red')
        .text('*** ILLUSTRATIVE DOCUMENT — NOT LEGALLY VALID ***', { align: 'center' })
        .fillColor('black');
      doc.moveDown(1);

      // Title
      doc.fontSize(16).text('DONATION RECEIPT', { align: 'center' });
      doc.moveDown(1);

      // Horizontal line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Receipt details
      const details = [
        ['Receipt Number', data.receiptNumber],
        ['Date', new Date(data.date).toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric'
        })],
        ['Donor Name', data.donorName],
        ['Donor PAN', data.donorPan ? `${data.donorPan.slice(0, 3)}****${data.donorPan.slice(-2)}` : 'Not Provided'],
        ['Amount', `₹${data.amount.toLocaleString('en-IN')}`],
        ['Donation Type', data.type === 'MONTHLY' ? 'Monthly' : 'One-Time'],
        ['Campaign', data.campaignTitle || 'General Fund'],
      ];

      details.forEach(([label, value]) => {
        doc.fontSize(11)
          .text(`${label}:`, 50, doc.y, { continued: true, width: 180 })
          .text(` ${value}`, { width: 350 });
        doc.moveDown(0.3);
      });

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Trust details
      doc.fontSize(10).text(`Trust PAN: ${config.trustPan}`);
      doc.text(`80G Registration: ${config.trust80GNumber}`);
      doc.moveDown(1);

      doc.fontSize(9)
        .text('This receipt is generated electronically and does not require a physical signature.', { align: 'center' })
        .moveDown(0.3)
        .fillColor('red')
        .text('This is a demo receipt for illustrative purposes only.', { align: 'center' })
        .fillColor('black');

      doc.end();
    });
  }

  static generateCertificate(data: CertificateData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text(config.trustName, { align: 'center' });
      doc.fontSize(10).text(config.trustAddress, { align: 'center' });
      doc.moveDown(0.5);

      // DEMO NOTICE
      doc.fontSize(8)
        .fillColor('red')
        .text('*** ILLUSTRATIVE DOCUMENT — NOT LEGALLY VALID ***', { align: 'center' })
        .fillColor('black');
      doc.moveDown(1);

      // Title
      doc.fontSize(16).text('80G DONATION CERTIFICATE', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text('Under Section 80G of the Income Tax Act, 1961', { align: 'center' });
      doc.moveDown(1);

      // Line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Certificate details
      const details = [
        ['Certificate Number', data.certificateNumber],
        ['Receipt Number', data.receiptNumber],
        ['Date', new Date(data.date).toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric'
        })],
        ['Donor Name', data.donorName],
        ['Donor PAN', data.donorPan ? `${data.donorPan.slice(0, 3)}****${data.donorPan.slice(-2)}` : 'Not Provided'],
        ['Amount Donated', `₹${data.amount.toLocaleString('en-IN')}`],
      ];

      details.forEach(([label, value]) => {
        doc.fontSize(11)
          .text(`${label}:`, 50, doc.y, { continued: true, width: 180 })
          .text(` ${value}`, { width: 350 });
        doc.moveDown(0.3);
      });

      doc.moveDown(1);

      // Certificate text
      doc.fontSize(10).text(
        `This is to certify that a donation of ₹${data.amount.toLocaleString('en-IN')} ` +
        `has been received from ${data.donorName} on ` +
        `${new Date(data.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}. ` +
        `The donation is eligible for deduction under Section 80G of the Income Tax Act, 1961.`,
        { align: 'justify' }
      );

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Trust details
      doc.fontSize(10).text(`Trust Name: ${config.trustName}`);
      doc.text(`Trust PAN: ${config.trustPan}`);
      doc.text(`80G Registration Number: ${config.trust80GNumber}`);
      doc.moveDown(1.5);

      doc.fontSize(11).text('Authorized Signatory', { align: 'right' });
      doc.fontSize(10).text(config.trustName, { align: 'right' });

      doc.moveDown(2);
      doc.fontSize(8)
        .fillColor('red')
        .text('DISCLAIMER: This is an illustrative 80G certificate for demo purposes only. ' +
          'It is not legally valid and should not be used for tax filing.', { align: 'center' })
        .fillColor('black');

      doc.end();
    });
  }
}
