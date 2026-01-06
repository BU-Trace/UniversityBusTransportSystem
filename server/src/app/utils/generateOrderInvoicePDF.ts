import PDFDocument from 'pdfkit';
import axios from 'axios';
import { IUser } from '../modules/User/user.interface';
import config from '../config';

const DEFAULT_LOGO_URL =
  'https://res.cloudinary.com/dbgrq28js/image/upload/v1736763971/logoipsum-282_ilqjfb_paw4if.png';

/**
 * Generate a PDF contract/invoice for a user
 * @param user - IUser object
 * @returns Promise<Buffer> - PDF as Buffer
 */
export const generateUserContractPDF = async (user: IUser): Promise<Buffer> => {
  try {
    const logoUrl = config.pdf_logo_url ?? DEFAULT_LOGO_URL;
    let logoBuffer: Buffer | undefined;
    try {
      const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
      logoBuffer = Buffer.from(response.data);
    } catch (err) {
      console.warn('Failed to fetch logo for PDF:', err);
    }

    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));
    });

    // Header - Logo & Company Info
    const logoWidth = 70;
    const logoX = (doc.page.width - logoWidth) / 2;
    if (logoBuffer) {
      doc.image(logoBuffer, logoX, doc.y, { width: logoWidth });
    }
    doc.moveDown(1);

    doc.fontSize(20).font('Helvetica-Bold').text('NextMert', { align: 'center' });
    doc.fontSize(10).text('Level-4, 34, Awal Centre, Banani, Dhaka', { align: 'center' });
    doc.fontSize(10).text('Email: support@nextmert.com', { align: 'center' });
    doc.fontSize(10).text('Phone: +880 223 456 678', { align: 'center' });
    doc.moveDown(1);

    doc
      .fontSize(15)
      .font('Helvetica-Bold')
      .fillColor('#003366')
      .text('User Agreement & Contract', { align: 'center' });
    doc.moveDown(0.5);
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // User Information Section
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#003366')
      .text('User Information:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#000000');
    doc.text(`Full Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Role: ${user.role}`);
    doc.text(`Last Login: ${user.lastLogin?.toLocaleString() || 'N/A'}`);
    doc.text(`Account Active: ${user.isActive ? 'Yes' : 'No'}`);
    doc.moveDown(1);

    // Client Device/Browser Information
    if (user.clientITInfo) {
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#003366')
        .text('Client Information:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').fillColor('#000000');
      doc.text(`Device: ${user.clientITInfo.device}`);
      doc.text(`Browser: ${user.clientITInfo.browser}`);
      doc.text(`IP Address: ${user.clientITInfo.ipAddress}`);
      doc.text(`PC Name: ${user.clientITInfo.pcName || 'N/A'}`);
      doc.text(`Operating System: ${user.clientITInfo.os || 'N/A'}`);
      doc.text(`User Agent: ${user.clientITInfo.userAgent || 'N/A'}`);
      doc.moveDown(1);
    }

    // Contract / Terms Section
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#003366')
      .text('Agreement & Terms:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#000000');
    const terms = [
      'The user agrees to provide accurate and truthful information.',
      'The user agrees to comply with all applicable rules and regulations.',
      'The user agrees not to engage in fraudulent or unlawful activities.',
      'The company reserves the right to suspend or terminate accounts that violate terms.',
      'All personal information will be handled according to the company\'s privacy policy.',
      'This agreement is legally binding and enforceable in accordance with local laws.',
    ];
    terms.forEach((term, index) => {
      doc.text(`${index + 1}. ${term}`);
    });
    doc.moveDown(2);

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#003366')
      .text('User Signature: ______________________', { align: 'left' });
    doc.moveDown(1);
    doc
      .fontSize(9)
      .fillColor('#555555')
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });

    // Finalize PDF
    doc.end();

    return pdfBufferPromise;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate user contract PDF: ${message}`);
  }
};
