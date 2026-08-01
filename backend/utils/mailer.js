const nodemailer = require('nodemailer');

// Uses standard SMTP. To use Resend/Brevo's SMTP relay, just set
// SMTP_HOST/PORT/USER/PASS in your .env — no code changes needed.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.RESEND_API_KEY || process.env.SMTP_PASS
  }
});

async function sendMail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY && !process.env.SMTP_PASS) {
    console.log(`[mailer] Skipped (no email credentials configured). Would send to ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Adevos-X Tech <no-reply@adevosxtech.site>',
    to, subject, html
  });
}

function otpEmail(code) {
  return `
    <div style="font-family:sans-serif;background:#070b09;color:#eef4f0;padding:24px;">
      <h2 style="color:#00ff66;">Adevos-X Tech</h2>
      <p>Your verification code is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;">${code}</p>
      <p style="color:#9fb0a6;">This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
    </div>`;
}

function feedbackReplyEmail(name, replyText) {
  return `
    <div style="font-family:sans-serif;background:#070b09;color:#eef4f0;padding:24px;">
      <h2 style="color:#00ff66;">Update on your feedback</h2>
      <p>Hi ${name},</p>
      <p>${replyText}</p>
      <p style="color:#9fb0a6;">Team Adevos-X Tech</p>
    </div>`;
}

module.exports = { sendMail, otpEmail, feedbackReplyEmail };
