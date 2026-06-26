import 'dotenv/config';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

/* =========================================================================
 *  Branded transactional email template
 *  Email-safe: table layout + inline styles only (no <style>/flexbox/svg).
 * ========================================================================= */
export const BRAND = {
    name: 'Scoolg',
    tagline: 'Precision School Management',
    color: '#2563EB',
    colorDark: '#1D4ED8',
    logo: process.env.BRAND_LOGO_URL || 'https://res.cloudinary.com/dmgxy7zh1/image/upload/w_320/scoolg/brand/email-logo.png',
    supportEmail: process.env.GMAIL_USER || 'support@scoolg.com',
};

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Render a branded HTML email.
 * @param {object} o
 * @param {string} o.heading      Big headline.
 * @param {string} o.preheader    Hidden inbox-preview line.
 * @param {string} [o.intro]      Paragraph above the highlight (HTML-escaped).
 * @param {string} [o.code]       Big highlighted code (OTP / campus code).
 * @param {string} [o.codeCaption]Small caption under the code.
 * @param {string} [o.note]       Muted security/footer note (HTML-escaped).
 * @param {{label:string,url:string}} [o.cta] Optional button.
 */
export function renderEmail(o) {
    const codeBlock = o.code ? `
        <tr><td style="padding:8px 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
            <tr><td align="center" style="background:#EFF4FF;border:1px solid #DBE6FE;border-radius:14px;padding:22px 16px;">
              <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:700;letter-spacing:10px;color:#1D4ED8;line-height:1;">${esc(o.code)}</div>
            </td></tr>
          </table>
          ${o.codeCaption ? `<p style="margin:12px 0 0;text-align:center;font-size:13px;color:#64748b;font-weight:600;">${esc(o.codeCaption)}</p>` : ''}
        </td></tr>` : '';

    const ctaBlock = o.cta ? `
        <tr><td align="center" style="padding:24px 32px 0;">
          <a href="${esc(o.cta.url)}" style="display:inline-block;background:${BRAND.color};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;">${esc(o.cta.label)}</a>
        </td></tr>` : '';

    const introBlock = o.intro ? `<tr><td style="padding:0 32px 4px;font-size:15px;line-height:1.6;color:#475569;">${o.intro}</td></tr>` : '';
    const noteBlock = o.note ? `<tr><td style="padding:20px 32px 0;font-size:13px;line-height:1.6;color:#94a3b8;">${o.note}</td></tr>` : '';

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(o.heading)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(o.preheader || o.heading)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;background:#ffffff;border:1px solid #e8edf3;border-radius:18px;overflow:hidden;">
        <!-- header -->
        <tr><td align="center" style="padding:32px 32px 8px;">
          <img src="${BRAND.logo}" alt="${BRAND.name}" height="40" style="height:40px;width:auto;display:block;border:0;outline:none;">
        </td></tr>
        <tr><td style="padding:0 32px;"><div style="height:4px;width:44px;background:${BRAND.color};border-radius:4px;margin:8px 0 4px;"></div></td></tr>
        <!-- heading -->
        <tr><td style="padding:18px 32px 8px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;">${esc(o.heading)}</td></tr>
        ${introBlock}
        ${codeBlock}
        ${ctaBlock}
        ${noteBlock}
        <!-- footer -->
        <tr><td style="padding:28px 32px 0;"><div style="height:1px;background:#eef2f7;"></div></td></tr>
        <tr><td style="padding:18px 32px 30px;">
          <p style="margin:0;font-size:13px;color:#475569;font-weight:700;">${BRAND.name}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#94a3b8;">${BRAND.tagline}</p>
          <p style="margin:10px 0 0;font-size:12px;color:#94a3b8;">Need help? <a href="mailto:${esc(BRAND.supportEmail)}" style="color:${BRAND.color};text-decoration:none;font-weight:600;">${esc(BRAND.supportEmail)}</a></p>
          <p style="margin:10px 0 0;font-size:11px;color:#cbd5e1;">© 2026 ${BRAND.name} Platform. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Mask an email for display, e.g. "parent@gmail.com" -> "pa****@gmail.com". */
export const maskEmail = (e) => {
    const s = String(e || '');
    const at = s.indexOf('@');
    if (at < 1) return s;
    const user = s.slice(0, at);
    const domain = s.slice(at);
    const head = user.length <= 2 ? user.slice(0, 1) : user.slice(0, 2);
    return `${head}${'*'.repeat(Math.max(2, user.length - head.length))}${domain}`;
};

/**
 * Send a 6-digit password-reset OTP. Shared by student/teacher/admin flows.
 * Throws on send failure so the caller can surface a clear error.
 */
export async function sendResetOtpEmail({ to, otp, appName }) {
    await transporter.sendMail({
        from: `"Scoolg" <${process.env.GMAIL_USER}>`,
        to,
        subject: `${otp} is your Scoolg password reset code`,
        text: `Your password reset code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`,
        html: renderEmail({
            heading: 'Reset your password',
            preheader: `Your Scoolg password reset code is ${otp}`,
            intro: `We received a request to reset your ${esc(appName || 'Scoolg')} password. Enter the code below to set a new password.`,
            code: otp,
            codeCaption: 'This code expires in 10 minutes.',
            note: "If you didn't request a password reset, you can safely ignore this email — your password stays unchanged.",
        }),
    });
}

/**
 * Email login credentials (App ID + temporary password) to a new account holder.
 * Never throws — credential delivery must not block account creation. Returns
 * { sent: boolean }. No-op (sent:false) when `to` is empty.
 *
 * @param {object}   o
 * @param {string}   o.to            Recipient email (parentEmail / teacher email / school email).
 * @param {string}   [o.name]        Person's name (greeting).
 * @param {string}   [o.loginLabel]  Label for the login id row (default "Login ID").
 * @param {string}   o.loginId       The login id value (studentAppId / teacherAppId / email).
 * @param {string}   o.password      The temporary password.
 * @param {string}   [o.roleLabel]   e.g. "student account", "teacher account".
 * @param {string}   [o.appName]     App name in the heading/subject.
 * @param {string}   [o.loginUrl]    Optional sign-in URL -> renders a CTA button.
 * @param {{label:string,value:string}[]} [o.extraRows]  Extra credential rows (e.g. campus code).
 */
export async function sendCredentialsEmail(o) {
    if (!o || !o.to) return { sent: false, reason: 'no-recipient' };
    const loginLabel = o.loginLabel || 'Login ID';
    const appName = o.appName || BRAND.name;
    const row = (label, value, accent) => `
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">${esc(label)}</td>
          <td style="padding:12px 16px;font-size:15px;color:${accent ? '#1D4ED8' : '#0f172a'};font-weight:800;font-family:'Courier New',Courier,monospace;border-bottom:1px solid #e2e8f0;text-align:right;letter-spacing:0.5px;">${esc(value)}</td>
        </tr>`;
    const extra = Array.isArray(o.extraRows) ? o.extraRows.map(r => row(r.label, r.value, false)).join('') : '';
    const box = `
      <p style="margin:0 0 16px;">Hi ${o.name ? esc(o.name) : 'there'}, your ${esc(o.roleLabel || 'account')} on <b>${esc(appName)}</b> is ready. Use the details below to sign in:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border:1px solid #DBE6FE;border-radius:14px;overflow:hidden;background:#F8FAFF;">
        ${row(loginLabel, o.loginId, false)}
        ${extra}
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;">Temporary password</td>
          <td style="padding:12px 16px;font-size:15px;color:#1D4ED8;font-weight:800;font-family:'Courier New',Courier,monospace;text-align:right;letter-spacing:0.5px;">${esc(o.password)}</td>
        </tr>
      </table>`;
    const lines = [
        `Hi ${o.name || ''},`,
        ``,
        `Your ${o.roleLabel || 'account'} on ${appName} is ready.`,
        `${loginLabel}: ${o.loginId}`,
        ...(Array.isArray(o.extraRows) ? o.extraRows.map(r => `${r.label}: ${r.value}`) : []),
        `Temporary password: ${o.password}`,
        ``,
        `For your security you'll be asked to change this password the first time you sign in.`,
        ...(o.loginUrl ? [``, `Sign in: ${o.loginUrl}`] : []),
    ];
    try {
        await transporter.sendMail({
            from: `"Scoolg" <${process.env.GMAIL_USER}>`,
            to: o.to,
            subject: `Your ${appName} login details`,
            text: lines.join('\n'),
            html: renderEmail({
                heading: `Welcome to ${appName}`,
                preheader: `Your ${loginLabel} is ${o.loginId}`,
                intro: box,
                cta: o.loginUrl ? { label: 'Open the app', url: o.loginUrl } : undefined,
                note: "For your security you'll be asked to set a new password the first time you sign in. Please keep these details private.",
            }),
        });
        return { sent: true };
    } catch (err) {
        console.error('❌ Credentials email failed:', err.message);
        return { sent: false, reason: err.message };
    }
}

export default { transporter, BRAND, esc, renderEmail, maskEmail, sendResetOtpEmail, sendCredentialsEmail };
