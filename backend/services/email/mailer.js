const nodemailer = require('nodemailer');

function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const hasRealSmtpConfig = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS;

  if (hasRealSmtpConfig && process.env.NODE_ENV !== 'test') {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  if (process.env.NODE_ENV !== 'test') {
    console.warn(
      '⚠️  SMTP not configured — emails will be logged locally instead of sent.\n' +
      '   Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env to send real email.'
    );
  }

  return nodemailer.createTransport({ jsonTransport: true });
}

module.exports = buildTransporter();