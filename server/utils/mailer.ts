import nodemailer from "nodemailer";
import { env } from "../config/env";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

function isSmtpConfigured(): boolean {
  return Boolean(env.mail.host && env.mail.user && env.mail.pass);
}

function createTransport() {
  return nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    family: 4,
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 8_000,
    auth: {
      user: env.mail.user,
      pass: env.mail.pass,
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildVerificationHtml(code: string, expiresMinutes: number): string {
  const safeCode = escapeHtml(code);
  const digits = [...safeCode]
    .map(
      (digit) =>
        `<td style="width:44px;height:56px;background:#1a1610;border:1px solid #c9a24a;border-radius:10px;text-align:center;font-family:'Georgia',serif;font-size:26px;font-weight:700;color:#f4e4bc;letter-spacing:0;">${digit}</td>`
    )
    .join('<td style="width:8px;"></td>');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your email</title>
  </head>
  <body style="margin:0;padding:0;background:#0b0a08;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0a08;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#14110d;border:1px solid #3a301f;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="height:4px;background:linear-gradient(90deg,#8a6a28,#e8c36a,#8a6a28);"></td>
            </tr>
            <tr>
              <td style="padding:36px 36px 12px 36px;text-align:center;">
                <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#c9a24a;">Gold Era</p>
                <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:500;color:#f7f1e4;">Confirm your email</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 36px 28px 36px;text-align:center;">
                <p style="margin:0;font-size:15px;line-height:1.7;color:#c8bda8;">
                  Use the code below to verify your account. It expires in
                  <strong style="color:#e8c36a;">${expiresMinutes} minutes</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 36px 32px 36px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>${digits}</tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 36px 36px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1610;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 20px;font-size:13px;line-height:1.6;color:#9c907c;">
                      If you did not create a Gold Era account, you can safely ignore this email.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 28px 36px;text-align:center;border-top:1px solid #2a2418;">
                <p style="margin:20px 0 0 0;font-size:12px;color:#6f675b;">&copy; ${new Date().getFullYear()} Gold Era</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function send(message: MailMessage): Promise<void> {
  if (!isSmtpConfigured()) {
    // eslint-disable-next-line no-console
    console.log(
      `[mailer] SMTP is not configured. Preview for ${message.to}:\n${message.text}`
    );
    return;
  }

  const transporter = createTransport();
  try {
    await transporter.sendMail({
      from: env.mail.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  } catch (error) {
    // Registration must not fail after the user row is already saved.
    // eslint-disable-next-line no-console
    console.error("[mailer] Failed to send email:", error);
    console.log(`[mailer] Fallback preview for ${message.to}:\n${message.text}`);
  } finally {
    transporter.close();
  }
}

export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<void> {
  await send({
    to,
    subject: "Your Gold Era verification code",
    text: `Your Gold Era verification code is ${code}. It expires in ${env.otp.expiresMinutes} minutes.`,
    html: buildVerificationHtml(code, env.otp.expiresMinutes),
  });
}
