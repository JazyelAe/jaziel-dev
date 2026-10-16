/**
 * JAZIEL.DEV — Endpoint HTTP en Firebase Cloud Functions (2nd Gen)
 * Procesa el formulario de contacto con:
 * - Restricción CORS por origen permitido
 * - Límite de tasa (Rate Limiting) por IP en memoria de instancia
 * - Filtro Honeypot y sanitización del lado del servidor
 * - Envío de correo mediante SMTP seguro (variables de entorno privadas)
 * - Sin exponer ninguna colección pública de base de datos
 */

const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const nodemailer = require('nodemailer');

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS_PER_WINDOW = 5;
const ipHits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const record = ipHits.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
    ipHits.set(ip, record);
    return false;
  }
  record.count += 1;
  ipHits.set(ip, record);
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

function cleanText(input, maxLen = 500) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 120;
}

exports.sendContactMessage = onRequest(
  {
    region: 'us-central1',
    maxInstances: 5,
    timeoutSeconds: 20,
    memory: '256MiB'
  },
  async (req, res) => {
    const allowedList = (process.env.ALLOWED_ORIGINS || 'https://jazyelae.github.io')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const origin = req.headers.origin || '';
    if (allowedList.includes(origin) || allowedList.includes('*')) {
      res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');

    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Método no permitido. Usa POST.' });
    }

    const clientIp =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.ip ||
      'unknown';

    if (isRateLimited(clientIp)) {
      logger.warn('Rate limit alcanzado para IP:', clientIp);
      return res.status(429).json({
        ok: false,
        error: 'Demasiados intentos recientes. Por favor intenta más tarde.'
      });
    }

    const body = req.body || {};

    // Verificación Honeypot en servidor
    if (body.website_hp && String(body.website_hp).trim() !== '') {
      return res.status(400).json({ ok: false, error: 'Solicitud rechazada por filtro anti-spam.' });
    }

    const name = cleanText(body.name, 100);
    const email = cleanText(body.email, 120);
    const subject = cleanText(body.subject, 150);
    const message = cleanText(body.message, 2500);

    if (name.length < 2) {
      return res.status(400).json({ ok: false, error: 'El nombre debe tener al menos 2 caracteres.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: 'El correo electrónico proporcionado no es válido.' });
    }
    if (subject.length < 4) {
      return res.status(400).json({ ok: false, error: 'El asunto debe tener al menos 4 caracteres.' });
    }
    if (message.length < 12) {
      return res.status(400).json({ ok: false, error: 'El mensaje debe contener al menos 12 caracteres.' });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'jahirarana06@gmail.com';

    if (!smtpUser || !smtpPass) {
      logger.error('Faltan credenciales SMTP_USER o SMTP_PASS en variables de entorno.');
      return res.status(503).json({
        ok: false,
        error: 'El servicio de correo aún no ha sido configurado en el servidor.'
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 465),
        secure: String(process.env.SMTP_SECURE || 'true') === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"JAZIEL.DEV Portafolio" <${smtpUser}>`,
        to: receiverEmail,
        replyTo: email,
        subject: `[JAZIEL.DEV] ${subject}`,
        text: [
          `Nuevo mensaje desde JAZIEL.DEV`,
          `----------------------------------------`,
          `Nombre: ${name}`,
          `Correo: ${email}`,
          `Asunto: ${subject}`,
          `Origen: ${body.source || origin}`,
          `----------------------------------------`,
          ``,
          message
        ].join('\n')
      });

      return res.status(200).json({
        ok: true,
        message: 'Mensaje procesado y enviado correctamente.'
      });
    } catch (error) {
      logger.error('Error al enviar correo desde Cloud Function:', error);
      return res.status(500).json({
        ok: false,
        error: 'Error interno al procesar el envío del correo.'
      });
    }
  }
);
