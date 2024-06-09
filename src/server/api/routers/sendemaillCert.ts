import nodemailer from 'nodemailer';
import { z } from 'zod';
import { env } from '~/env';
import { protectedProcedure } from '~/server/api/trpc';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { certificatebase64 } from '../../../utils/certificateBase64';

interface PdfMake {
  vfs: typeof pdfFonts.pdfMake.vfs;
  createPdf: (docDefinition: TDocumentDefinitions) => TCreatedPdf;
}

interface TCreatedPdf {
  getBuffer: (callback: (buffer: Uint8Array) => void) => void;
}

interface TDocumentDefinitions {
  pageOrientation: 'portrait' | 'landscape';
  background: Array<{ image: string, width: number, height: number }>;
  content: Array<string | { text: string, style: string }>;
  styles: {
    header: {
      margin: [number, number, number, number];
      fontSize: number;
      bold: boolean;
    };
  };
}

const pdfMakeWithVfs: PdfMake = pdfmake as unknown as PdfMake;
pdfMakeWithVfs.vfs = pdfFonts.pdfMake.vfs;

const sendEmailCert = protectedProcedure
  .input(z.object({
    email: z.string().email(),
    name: z.string(),
    program : z.string()
  }))
  .mutation(async ({ input }) => {
    try {
      const transporter = nodemailer.createTransport({
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        secure: env.EMAIL_SERVER_PORT === 465,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        },
      });

      const docDefinition: TDocumentDefinitions = {
        pageOrientation: 'landscape',
        background: [
          {
            image: certificatebase64,
            width: 842,
            height: 595
          }
        ],
        content: [
          // { text: `${input.name}`, style: 'header' },
          { text: `${input.name} for completing the ${input.program} program.`, style: 'header'},
          
        ],
        styles: {
          header: {
            margin : [20, 240, 0, 0],
            fontSize: 18,
            bold: true,
          },
        },
      };

      const pdfDocGenerator = pdfMakeWithVfs.createPdf(docDefinition);
      const pdfBuffer: Buffer = await new Promise<Buffer>((resolve, reject) => {
        pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
          if (buffer) {
            resolve(Buffer.from(buffer));
          } else {
            reject(new Error('Failed to generate PDF buffer'));
          }
        });
      });

      const mailOptions = {
        from: env.EMAIL_SERVER_USER,
        to: input.email,
        subject: 'Certificate',
        text: `Dear ${input.name},\n\nCongratulations on your achievement! Please find your certificate attached.\n\nBest regards,\nYour Team`,
        attachments: [
          {
            filename: 'certificate.pdf',
            content: pdfBuffer,
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send the email');
    }
  });

export { sendEmailCert };
