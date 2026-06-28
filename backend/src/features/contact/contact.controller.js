import { transporter, renderEmail, esc } from '../../utils/email.js';

// Where website enquiries / demo requests are delivered. Override via env if needed.
const RECIPIENTS = (process.env.CONTACT_RECIPIENTS || 'neerajbhattadx@gmail.com,scoolg.dev@gmail.com')
    .split(',').map(s => s.trim()).filter(Boolean);

const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ''));

const detailTable = (rows) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-collapse:separate;background:#F8FAFF;border:1px solid #DBE6FE;border-radius:12px;overflow:hidden;">
    ${rows.filter(Boolean).map(([l, v]) => `
      <tr>
        <td style="padding:10px 14px;color:#64748b;font-weight:600;font-size:13px;border-bottom:1px solid #e2e8f0;width:40%;">${esc(l)}</td>
        <td style="padding:10px 14px;color:#0f172a;font-weight:700;font-size:14px;border-bottom:1px solid #e2e8f0;">${esc(v)}</td>
      </tr>`).join('')}
  </table>`;

const noteBlock = (text) => `<div style="margin-top:16px;padding:14px 16px;background:#f8fafc;border-left:3px solid #2563EB;border-radius:8px;color:#334155;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(text)}</div>`;

// POST /api/contact — "Contact Us" enquiry from the website.
export const postContact = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const email = String(req.body.email || '').trim();
        const phone = String(req.body.phone || '').trim();
        const message = String(req.body.message || '').trim();
        if (!name) return res.status(400).json({ error: "Name is required" });
        if (!isEmail(email)) return res.status(400).json({ error: "A valid email is required" });
        if (!message) return res.status(400).json({ error: "Message is required" });

        await transporter.sendMail({
            from: `"Scoolg Website" <${process.env.GMAIL_USER}>`,
            to: RECIPIENTS,
            replyTo: email,
            subject: `📩 New enquiry from ${name} — Scoolg website`,
            text: `New contact enquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\n\nMessage:\n${message}`,
            html: renderEmail({
                heading: 'New website enquiry',
                preheader: `${name} sent a message via the Scoolg website`,
                intro: `Someone reached out through the <b>Contact Us</b> form on the Scoolg website:${detailTable([['Name', name], ['Email', email], phone && ['Phone', phone]])}${noteBlock(message)}`,
                note: `Reply directly to this email to respond to ${esc(name)}.`,
            })
        });
        return res.json({ ok: true, message: "Thanks! We'll get back to you shortly." });
    } catch (err) {
        console.error("Contact form error:", err.message);
        return res.status(500).json({ error: "Could not send your message. Please try again." });
    }
};

// POST /api/demo — "Book a Demo" request (date + time slot) from the website.
export const postBookDemo = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const email = String(req.body.email || '').trim();
        const phone = String(req.body.phone || '').trim();
        const school = String(req.body.school || '').trim();
        const date = String(req.body.date || '').trim();   // YYYY-MM-DD
        const time = String(req.body.time || '').trim();   // e.g. "11:00 AM"
        const notes = String(req.body.notes || '').trim();
        if (!name) return res.status(400).json({ error: "Name is required" });
        if (!isEmail(email)) return res.status(400).json({ error: "A valid email is required" });
        if (!phone) return res.status(400).json({ error: "Phone number is required" });
        if (!date || !time) return res.status(400).json({ error: "Please pick a date and time" });

        let prettyDate = date;
        try { prettyDate = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch { /* keep raw */ }

        await transporter.sendMail({
            from: `"Scoolg Website" <${process.env.GMAIL_USER}>`,
            to: RECIPIENTS,
            replyTo: email,
            subject: `📅 Demo request: ${name} — ${prettyDate}, ${time}`,
            text: `New demo booking\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSchool: ${school || '-'}\nDate: ${prettyDate}\nTime: ${time}\n\nNotes:\n${notes || '-'}`,
            html: renderEmail({
                heading: 'New demo request 📅',
                preheader: `${name} requested a demo on ${prettyDate} at ${time}`,
                intro: `A new <b>Book a Demo</b> request came in from the Scoolg website:${detailTable([['Name', name], ['Email', email], ['Phone', phone], school && ['School', school], ['Preferred date', prettyDate], ['Preferred time', time]])}${notes ? noteBlock(notes) : ''}`,
                note: `Reply directly to this email to confirm the meeting with ${esc(name)}.`,
            })
        });

        // Acknowledge the requester (best-effort — never blocks the main flow).
        try {
            await transporter.sendMail({
                from: `"Scoolg" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: `Your Scoolg demo request — ${prettyDate}, ${time}`,
                text: `Hi ${name},\n\nThanks for requesting a Scoolg demo. We've received your preferred slot:\n${prettyDate} at ${time}\n\nOur team will reach out shortly to confirm.\n\n— Team Scoolg`,
                html: renderEmail({
                    heading: 'Demo request received 🎉',
                    preheader: `We got your demo request for ${prettyDate} at ${time}`,
                    intro: `Hi ${esc(name)}, thanks for your interest in <b>Scoolg</b>! We've received your demo request for the slot below — our team will reach out shortly to confirm.`,
                    code: time,
                    codeCaption: prettyDate,
                    note: "Need to change the time? Just reply to this email and we'll sort it out.",
                })
            });
        } catch (ackErr) { console.error("Demo ack email failed:", ackErr.message); }

        return res.json({ ok: true, message: "Demo request sent! We'll confirm shortly." });
    } catch (err) {
        console.error("Book demo error:", err.message);
        return res.status(500).json({ error: "Could not send your request. Please try again." });
    }
};
