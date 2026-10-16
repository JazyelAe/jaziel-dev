# Backend de Contacto en Firebase Cloud Functions — JAZIEL.DEV

## 1. Propósito de esta arquitectura
El sitio estático de **JAZIEL.DEV** se aloja gratuitamente en **GitHub Pages**, mientras que los proyectos se administran directamente mediante archivos JSON en el repositorio (`data/projects.json`).

Por ello:
- **No se utiliza Firestore ni Firebase Storage** (evitando bases de datos públicas innecesarias o duplicidad de contenido).
- **No se expone ninguna credencial privada en el frontend.**
- **Firebase Cloud Functions (2da Generación)** se utiliza exclusivamente como endpoint HTTP seguro (`sendContactMessage`) para validar datos en el servidor, aplicar control anti-spam (honeypot + límite de peticiones por IP + restricción de origen CORS) y enviar el correo a `jahirarana06@gmail.com`.

> **Nota importante sobre costos y requisitos externos de Firebase:**
> Para desplegar Cloud Functions en producción, Google Firebase exige activar el plan **Blaze (Pago por uso)** en la consola de Firebase. Este plan incluye una capa gratuita mensual de **2 millones de invocaciones**, por lo que un portafolio personal normalmente tiene costo **$0.00 USD**, pero requiere vincular un método de pago en Google Cloud.
> Si decides no activar el plan Blaze todavía, el formulario de `JAZIEL.DEV` valida todos los campos y ofrece automáticamente un botón de envío directo prellenado mediante el cliente de correo del visitante (`mailto:`) sin romper la experiencia.

---

## 2. Pasos de configuración y despliegue

1. Instala Firebase CLI globalmente en tu equipo:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Asocia tu proyecto de Firebase desde la raíz de `jaziel-dev/`:
   ```bash
   firebase use --add
   ```
3. Entra a `firebase/functions` e instala las dependencias:
   ```bash
   cd firebase/functions
   npm install
   ```
4. Crea el archivo `firebase/functions/.env` basándote en `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con:
   - `ALLOWED_ORIGINS=https://jazyelae.github.io`
   - `CONTACT_RECEIVER_EMAIL=jahirarana06@gmail.com`
   - `SMTP_USER=jahirarana06@gmail.com`
   - `SMTP_PASS=tu_contrasena_de_aplicacion_de_gmail` (generada en *Cuenta de Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones*).
5. Despliega únicamente la función desde la raíz del proyecto:
   ```bash
   cd ../..
   firebase deploy --only functions
   ```
6. Al finalizar el despliegue, la terminal mostrará una URL similar a:
   `https://sendcontactmessage-xxxxxx-uc.a.run.app`
7. Copia esa URL y pégala en `data/profile.json` dentro de la propiedad:
   ```json
   "firebase": {
     "contactEndpoint": "https://sendcontactmessage-xxxxxx-uc.a.run.app"
   }
   ```
8. Haz commit y push de `data/profile.json` a GitHub para que GitHub Pages utilice el endpoint en vivo.
