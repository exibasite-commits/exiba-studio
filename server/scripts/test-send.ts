import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
try {
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'Exiba <onboarding@resend.dev>',
    to: ['maxdenner11@gmail.com'],
    subject: 'Teste Exiba',
    html: '<p>Teste de envio de e-mail.</p>',
  });
  console.log('ENVIO OK:', JSON.stringify(result, null, 2));
} catch (e: any) {
  console.log('ERRO ENVIO:');
  console.log(JSON.stringify(e, null, 2));
}
