import nodemailer from 'nodemailer';
import { z } from 'zod';
import { env } from '~/env';
import { protectedProcedure } from '~/server/api/trpc';

const sendEmailCert = protectedProcedure
  .input(z.object({
    email: z.string(),
    name: z.string(),
    cert: z.string(),
  }))
  .mutation(async ({ input }) => {
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_SERVER_HOST,
      port: env.EMAIL_SERVER_PORT,
      auth: {
        user: env.EMAIL_SERVER_USER,
        pass: env.EMAIL_SERVER_PASSWORD,
      },
    });

    const mailOptions = {
      from: env.EMAIL_SERVER_USER,
      to: input.email,
      subject: 'Certificate',
      html: `
        <h1>Congratulations ${input.name}!</h1>
        <p>Here is your certificate:</p>
        <p>${input.cert}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  });

export { sendEmailCert };
