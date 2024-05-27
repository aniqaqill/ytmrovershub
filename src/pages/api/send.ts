// import type { NextApiRequest, NextApiResponse } from 'next';
// import { EmailTemplate } from '../../components/email-templates';
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export default async (req: NextApiRequest, res: NextApiResponse) => {
//     const { firstName, email } = req.body;
    
//     const emailTemplate = new EmailTemplate({ firstName });
    
//     const emailContent = emailTemplate.render();
    
//     await resend.send({
//         to: email,
//         subject: "Welcome to our platform!",
//         html: emailContent,
//     });
    
//     res.status(200).json({ message: "Email sent!" });
//     };


