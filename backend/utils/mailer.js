const nodemailer = require('nodemailer');

let transporter = null;

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (transporter) return transporter;

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure =
    process.env.SMTP_SECURE === 'true' || port === 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  return transporter;
};

const getFromAddress = () =>
  process.env.SMTP_FROM || '"SRKR Coding Club" <recruitment@srkrec.edu.in>';

const sendEmail = async ({ to, subject, text, html }) => {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[EMAIL SKIPPED] SMTP not configured. Would send to ${to}: ${subject}`);
      if (text) console.warn(`[EMAIL BODY] ${text}`);
    }
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    const info = await getTransporter().sendMail({
      from: getFromAddress(),
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`Email failed to ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
};

const sendOTPEmail = async (email, otp) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] OTP for ${email}: ${otp}`);
  }

  return sendEmail({
    to: email,
    subject: 'Verification OTP - SRKR Coding Club',
    text: `Your OTP for verification is: ${otp}. It is valid for 10 minutes.`,
    html: `<h3>Verification OTP</h3><p>Your OTP for verification is: <b>${otp}</b>. It is valid for 10 minutes.</p>`,
  });
};

const sendRecruitmentEmail = async (email, subject, title, bodyHtml) => {
  return sendEmail({
    to: email,
    subject: `${subject} - SRKR Coding Club`,
    text: `${title}\n\nDetails:\n${bodyHtml.replace(/<[^>]*>/g, '')}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ffd700; border-radius: 12px; background-color: #2b1f1d; color: #ffffff;">
        <h2 style="color: #ffd700; border-bottom: 2px solid #ffd700; padding-bottom: 10px;">${title}</h2>
        <div style="font-size: 14px; line-height: 1.6; color: #e5e5e5; margin-top: 20px;">
          ${bodyHtml}
        </div>
        <p style="font-size: 11px; color: #a3a3a3; margin-top: 30px; border-top: 1px solid #444; padding-top: 10px;">
          This is an automated notification from the SRKR Coding Club Recruitment Portal. Please do not reply directly.
        </p>
      </div>
    `,
  });
};

const verifySmtpConnection = async () => {
  if (!isSmtpConfigured()) {
    console.warn('SMTP not configured — emails will not be sent until SMTP_HOST, SMTP_USER, and SMTP_PASS are set.');
    return false;
  }
  try {
    await getTransporter().verify();
    console.log('SMTP connection verified successfully.');
    return true;
  } catch (err) {
    console.error('SMTP verification failed:', err.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendRecruitmentEmail,
  verifySmtpConnection,
  isSmtpConfigured,
};
