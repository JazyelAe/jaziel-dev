/**
 * JAZIEL.DEV — Gestión de contacto, botón de copia de correo y envío seguro mediante Firebase Cloud Functions
 */

import { copyTextToClipboard, escapeHtml } from './utils.js';

export function initContactSection(profileData) {
  const copyBtn = document.getElementById('copy-email-btn');
  const copyLabel = document.getElementById('copy-email-label');
  const emailAddress = profileData?.contact?.email || 'jahirarana06@gmail.com';

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const ok = await copyTextToClipboard(emailAddress);
      if (ok && copyLabel) {
        const original = copyLabel.textContent;
        copyLabel.textContent = '¡Correo copiado!';
        copyBtn.classList.add('btn--primary');
        copyBtn.classList.remove('btn--secondary');
        setTimeout(() => {
          copyLabel.textContent = original;
          copyBtn.classList.remove('btn--primary');
          copyBtn.classList.add('btn--secondary');
        }, 2400);
      }
    });
  }

  const form = document.getElementById('contact-form');
  if (!form) return;

  const formLoadedAt = Date.now();
  const statusBox = document.getElementById('contact-form-status');
  const submitBtn = document.getElementById('contact-submit-btn');
  const submitLabel = document.getElementById('contact-submit-label');

  function setFieldError(fieldName, message) {
    const input = form.elements[fieldName];
    const errEl = document.getElementById(`error-${fieldName}`);
    if (input) input.classList.toggle('is-invalid', Boolean(message));
    if (errEl) errEl.textContent = message || '';
  }

  function clearErrors() {
    ['name', 'email', 'subject', 'message'].forEach((f) => setFieldError(f, ''));
    if (statusBox) {
      statusBox.className = 'form-status';
      statusBox.innerHTML = '';
    }
  }

  function validateForm(data) {
    let valid = true;
    if (!data.name || data.name.length < 2) {
      setFieldError('name', 'Ingresa tu nombre (mínimo 2 caracteres).');
      valid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      setFieldError('email', 'Ingresa un correo electrónico válido.');
      valid = false;
    }
    if (!data.subject || data.subject.length < 4) {
      setFieldError('subject', 'Indica un asunto claro (mínimo 4 caracteres).');
      valid = false;
    }
    if (!data.message || data.message.length < 12) {
      setFieldError('message', 'Escribe un mensaje de al menos 12 caracteres.');
      valid = false;
    }
    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const honeypot = (form.elements['website_hp']?.value || '').trim();
    const elapsedMs = Date.now() - formLoadedAt;

    // Protección básica anti-bots (Honeypot + envío instantáneo artificial)
    if (honeypot !== '' || elapsedMs < 1200) {
      if (statusBox) {
        statusBox.className = 'form-status is-visible form-status--error';
        statusBox.textContent = 'Solicitud bloqueada por el filtro anti-spam.';
      }
      return;
    }

    const payload = {
      name: (form.elements['name']?.value || '').trim(),
      email: (form.elements['email']?.value || '').trim(),
      subject: (form.elements['subject']?.value || '').trim(),
      message: (form.elements['message']?.value || '').trim(),
      source: window.location.href,
      timestamp: new Date().toISOString()
    };

    if (!validateForm(payload)) {
      return;
    }

    // Endpoint configurado en data/profile.json o variable global
    const endpoint =
      window.JAZIEL_CONTACT_ENDPOINT ||
      profileData?.firebase?.contactEndpoint ||
      '';

    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Enviando mensaje...';

    try {
      if (!endpoint) {
        // Si aún no se ha desplegado la URL de Firebase Cloud Function,
        // informamos con transparencia y ofrecemos enlace directo mailto con el mensaje prellenado.
        const mailtoHref = `mailto:${encodeURIComponent(emailAddress)}?subject=${encodeURIComponent(
          `[JAZIEL.DEV] ${payload.subject}`
        )}&body=${encodeURIComponent(
          `Nombre: ${payload.name}
Correo: ${payload.email}

Mensaje:
${payload.message}`
        )}`;

        if (statusBox) {
          statusBox.className = 'form-status is-visible form-status--success';
          statusBox.innerHTML = `
            <strong>Datos validados correctamente.</strong><br/>
            El endpoint de Firebase Cloud Functions aún no tiene una URL asignada en <code>data/profile.json</code>.
            Puedes enviar este mensaje directamente con un clic:
            <div style="margin-top:0.75rem;">
              <a href="${mailtoHref}" class="btn btn--primary">Abrir cliente de correo con mi mensaje</a>
            </div>
          `;
        }
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok === false) {
        throw new Error(result.error || `Error del servidor (${response.status})`);
      }

      form.reset();
      if (statusBox) {
        statusBox.className = 'form-status is-visible form-status--success';
        statusBox.innerHTML = `
          <strong>¡Mensaje enviado con éxito!</strong><br/>
          Gracias por escribir, ${escapeHtml(payload.name)}. Responderé a <code>${escapeHtml(payload.email)}</code> a la brevedad.
        `;
      }
    } catch (err) {
      const mailtoFallback = `mailto:${encodeURIComponent(emailAddress)}?subject=${encodeURIComponent(
        `[JAZIEL.DEV] ${payload.subject}`
      )}&body=${encodeURIComponent(
        `Nombre: ${payload.name}
Correo: ${payload.email}

Mensaje:
${payload.message}`
      )}`;

      if (statusBox) {
        statusBox.className = 'form-status is-visible form-status--error';
        statusBox.innerHTML = `
          <strong>No fue posible conectar con el servidor de mensajes:</strong> ${escapeHtml(err.message)}.<br/>
          Puedes enviar tu mensaje directamente por correo electrónico:
          <div style="margin-top:0.65rem;">
            <a href="${mailtoFallback}" class="btn btn--secondary">Enviar vía ${escapeHtml(emailAddress)}</a>
          </div>
        `;
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Enviar mensaje';
    }
  });
}
