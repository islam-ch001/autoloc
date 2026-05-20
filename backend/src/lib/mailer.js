const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.warn('[Mailer] SMTP_USER / SMTP_PASS non définis — emails non envoyés');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_SECURE ?? 'true') === 'true',
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
  return transporter;
}

async function sendVerificationCode({ to, code, name }) {
  const t = getTransporter();
  if (!t) throw new Error('Service email non configuré');

  const from = process.env.SMTP_FROM || `AutoLoc <${process.env.SMTP_USER}>`;
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f5f5f7;">
    <div style="background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #f59e0b; color: #0a0a0f; font-weight: 800; font-size: 22px; padding: 8px 18px; border-radius: 10px;">🚗 AutoLoc</div>
      </div>
      <h1 style="font-size: 20px; color: #111; margin: 0 0 8px;">Vérification de votre email</h1>
      <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        Bonjour ${name || ''},<br/>
        Voici votre code de vérification pour créer votre compte AutoLoc :
      </p>
      <div style="text-align: center; padding: 20px; background: #f5f5f7; border: 2px dashed #f59e0b; border-radius: 12px; margin: 0 0 24px;">
        <div style="font-size: 32px; font-weight: 800; color: #0a0a0f; letter-spacing: 8px; font-family: 'Courier New', monospace;">
          ${code}
        </div>
      </div>
      <p style="color: #777; font-size: 12px; line-height: 1.6; margin: 0;">
        Ce code expire dans <strong>10 minutes</strong>. Si vous n'avez pas demandé cette inscription, ignorez simplement cet email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 11px; text-align: center; margin: 0;">
        AutoLoc — Système de location de véhicules
      </p>
    </div>
  </div>`;

  await t.sendMail({
    from,
    to,
    subject: `Votre code de vérification AutoLoc : ${code}`,
    text: `Votre code de vérification AutoLoc est : ${code}\n\nCe code expire dans 10 minutes.`,
    html,
  });
}

module.exports = { sendVerificationCode, getTransporter };
