const { Resend } = require('resend');

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Methode nicht erlaubt.' });
  }

  const { CONTACT_EMAIL, RESEND_API_KEY, RESEND_FROM } = process.env;
  if (!CONTACT_EMAIL || !RESEND_API_KEY || !RESEND_FROM) {
    return res.status(503).json({
      error: 'Der E-Mail-Versand ist noch nicht konfiguriert.',
    });
  }

  const { service, name, phone, email, message } = req.body || {};
  if (!service || !name || !phone || !email) {
    return res.status(400).json({
      error: 'Bitte fülle alle Pflichtfelder aus.',
    });
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Neue Terminanfrage: ${service}`,
      html: `
        <h2>Neue Terminanfrage über die Senu Website</h2>
        <p><strong>Service:</strong> ${escapeHtml(service)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
        <p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Anliegen:</strong> ${escapeHtml(message || 'Keine Angabe')}</p>
      `,
    });

    if (error) {
      return res.status(502).json({
        error: 'Die Terminanfrage konnte gerade nicht gesendet werden. Bitte versuche es später erneut.',
      });
    }

    return res.status(202).json({
      message: 'Deine Terminanfrage wurde übermittelt.',
      id: data?.id,
    });
  } catch (error) {
    console.error('Appointment email could not be sent:', error);
    return res.status(502).json({
      error: 'Die Terminanfrage konnte gerade nicht gesendet werden. Bitte versuche es später erneut.',
    });
  }
};
