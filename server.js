require('dotenv').config();

const express = require('express');
const { Resend } = require('resend');

const app = express();
const port = Number(process.env.PORT || 3000);
const requiredMailSettings = [
  'CONTACT_EMAIL',
  'RESEND_API_KEY',
  'RESEND_FROM',
];

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

const missingMailSettings = requiredMailSettings.filter((setting) => !process.env[setting]);

const resend = missingMailSettings.length === 0
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

app.post('/api/appointment', async (req, res) => {
  if (!resend) {
    return res.status(503).json({
      error: 'Der E-Mail-Versand ist noch nicht konfiguriert.',
    });
  }

  const { service, name, phone, email, message } = req.body;
  if (!service || !name || !phone || !email) {
    return res.status(400).json({
      error: 'Bitte fülle alle Pflichtfelder aus.',
    });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: process.env.CONTACT_EMAIL,
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
      throw new Error(error.message);
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
});

app.listen(port, () => {
  console.log(`Senu server listening on http://localhost:${port}`);
});
