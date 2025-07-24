import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, name: string) => {
  const response = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Welcome to Our Firm!',
    html: `<strong>Hello ${name},</strong><br />Welcome to our client portal!`,
  })
  return response
}