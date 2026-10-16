# JAZIEL.DEV — Portafolio Profesional de Alto Impacto Visual

Portafolio profesional de **Jahir Jaziel Serrano Arana** — Estudiante de Ingeniería en Tecnologías de la Información (Desarrollo de Software Multiplataforma) en la **Universidad Tecnológica de Puebla**, con enfoque en **Desarrollo Frontend Jr. & QA Tester**.

Construido con **HTML5 semántico**, **CSS3 modular**, **JavaScript ES Modules**, gestión de proyectos basada en datos JSON sobre **GitHub Pages** y backend seguro de contacto para **Firebase Cloud Functions**.

---

## Estructura del Proyecto

```text
jaziel-dev/
├── index.html                        # Página principal (Hero, Proyectos, Perfil, Tecnologías, Contacto)
├── project.html                      # Vista dedicada de detalle por proyecto (?slug=...)
├── 404.html                          # Página 404 compatible con GitHub Pages
├── robots.txt                        # Reglas de indexación para buscadores
├── sitemap.xml                       # Mapa del sitio XML
├── manifest.webmanifest              # Metadatos de aplicación web
├── favicon.svg                       # Monograma vectorial propio JAZIEL.DEV
├── data/
│   ├── projects.json                 # Catálogo de proyectos (publicados y borradores)
│   ├── profile.json                  # Datos de perfil, enlaces, formación y endpoint Firebase
│   └── skills.json                   # Grupos visuales de tecnologías y habilidades
├── assets/
│   ├── images/
│   │   ├── jaziel-profile.webp       # Fotografía profesional optimizada en WebP
│   │   └── projects/                 # Portadas técnicas en formato WebP
│   └── cv/
│       └── cv-jahir-jaziel.pdf       # Currículum Vitae real en PDF
├── css/
│   ├── variables.css                 # Tokens de color (#080B10, #65F5C4, #68A9FF, etc.) y escala fluida
│   ├── reset.css                     # Normalización moderna y foco accesible
│   ├── base.css                      # Escenario ambiental, canvas, retícula y utilidades
│   ├── layout.css                    # Contenedores, secciones y barra de progreso
│   ├── components.css                # Navegación, Hero HUD, tarjetas 3D, modal, formulario y footer
│   ├── animations.css                # Keyframes, entrada cinematográfica y prefers-reduced-motion
│   ├── pages.css                     # Estilos de project.html y 404.html
│   └── responsive.css                # Adaptación mobile-first para móviles, tablets y escritorio
├── js/
│   ├── main.js                       # Inicialización general y verificación del archivo CV
│   ├── data.js                       # Carga asíncrona de JSON con respaldo seguro integrado
│   ├── navigation.js                 # Menú móvil accesible, scroll spy y barra de progreso
│   ├── animations.js                 # Canvas de nodos interactivos, luz de cursor y perspectiva 3D
│   ├── projects.js                   # Filtros dinámicos por categoría y cuadrícula editorial
│   ├── project-detail.js             # Renderizador de ficha técnica (oculta campos vacíos)
│   ├── contact.js                    # Validación, copia de correo, honeypot y envío a Firebase
│   └── utils.js                      # Helpers e iconografía SVG integrada
├── firebase/
│   ├── functions/
│   │   ├── index.js                  # Cloud Function HTTP v2 segura (CORS, rate-limit, SMTP)
│   │   ├── package.json              # Dependencias del backend
│   │   └── .env.example              # Plantilla de variables de entorno privadas
│   └── README.md                     # Guía detallada de despliegue en Firebase
├── firebase.json                     # Configuración de Firebase Cloud Functions
├── .gitignore                        # Exclusión de node_modules y archivos .env privados
└── README.md                         # Documentación general y guía de mantenimiento
```

---

## 1. Cómo abrir el proyecto localmente

Dado que el proyecto utiliza **JavaScript ES Modules** (`<script type="module">`) y realiza peticiones `fetch()` a los archivos de la carpeta `data/`, debes abrirlo mediante un servidor HTTP local (no con doble clic sobre `file://`):

- **Opción A — Extensión Live Server en Visual Studio Code:**
  1. Abre la carpeta `jaziel-dev` en VS Code.
  2. Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.
- **Opción B — Con Python 3 desde la terminal:**
  ```bash
  cd jaziel-dev
  python3 -m http.server 5500
  ```
  Luego abre en tu navegador: `http://localhost:5500`

---

## 2. Cómo cambiar textos, estado de disponibilidad y habilidades

- **Perfil, frase del Hero, enlaces y formación académica:**
  Edita `data/profile.json`. Allí puedes modificar `heroHeadline`, `heroSubtext`, `about.lead`, `about.pillars` o `education`.
- **Tecnologías y habilidades:**
  Edita `data/skills.json`. Cada grupo (`Frontend`, `Backend y programación`, `Bases de datos`, `QA`, `Herramientas`) contiene un arreglo `items` con `name` y `tag`.

---

## 3. Cómo añadir, editar, ocultar o eliminar proyectos mediante GitHub

Toda la gestión de proyectos se realiza en `data/projects.json` sin tocar el código HTML ni JS:

1. **Añadir un nuevo proyecto:**
   Agrega un nuevo objeto al arreglo en `data/projects.json`:
   ```json
   {
     "id": "nuevo-proyecto",
     "title": "Nombre del Proyecto",
     "subtitle": "Subtítulo breve",
     "slug": "nuevo-proyecto",
     "shortDescription": "Resumen para la tarjeta principal.",
     "description": "Descripción completa para la vista de detalle.",
     "role": "Frontend",
     "category": "frontend",
     "categories": ["frontend", "web-apps"],
     "categoryLabel": "Frontend · Aplicación Web",
     "statusBadge": "En producción",
     "technologies": ["HTML5", "CSS3", "JavaScript"],
     "coverImage": "assets/images/projects/mi-portada.webp",
     "gallery": [],
     "repositoryUrl": "https://github.com/JazyelAe/mi-repo",
     "liveUrl": "",
     "featured": true,
     "published": true,
     "sortOrder": 3,
     "context": "Contexto del proyecto...",
     "objective": "Objetivo principal...",
     "problem": "",
     "solution": "",
     "contribution": ["Punto 1", "Punto 2"],
     "features": ["Funcionalidad 1"]
   }
   ```
2. **Publicar los borradores existentes:**
   Los proyectos 3 (*Aplicación web con Django y Bootstrap*) y 4 (*Sistema de gestión de usuarios*) están incluidos en `data/projects.json` con `"published": false`. Cuando completes sus datos, cambia `"published": true` y aparecerán automáticamente.
3. **Ocultar un proyecto temporalmente:**
   Cambia `"published": false`.
4. **Controlar el orden:**
   Modifica el número en `"sortOrder"` (`1`, `2`, `3`...).
5. **Secciones opcionales en el detalle:**
   Si dejas vacío `liveUrl`, `problem`, `solution` o `gallery`, la página de detalle ocultará automáticamente ese bloque sin mostrar espacios vacíos ni datos inventados.

---

## 4. Cómo incorporar o sustituir fotografías y capturas

- **Fotografía de perfil (`assets/images/jaziel-profile.webp`):**
  Tu fotografía profesional adjunta ya fue optimizada e integrada en `assets/images/jaziel-profile.webp`. Si deseas actualizarla en el futuro, reemplaza ese archivo manteniendo el mismo nombre `jaziel-profile.webp` (recomendado: proporción cercana a `1:1`, formato `.webp`, peso menor a 200 KB). Si el archivo se elimina, el Hero muestra automáticamente un emblema gráfico abstracto sin romper la página.
- **Portadas y capturas de proyectos (`assets/images/projects/`):**
  Coloca tus imágenes `.webp` en `assets/images/projects/` y actualiza la ruta en `coverImage` o dentro del arreglo `gallery` en `data/projects.json`.

---

## 5. Cómo actualizar el CV

- El archivo PDF real que adjuntaste ya se encuentra en:
  `assets/cv/cv-jahir-jaziel.pdf`
- Cuando actualices tu currículum, guarda el nuevo PDF con el nombre exacto `cv-jahir-jaziel.pdf` dentro de `assets/cv/`.
- El script `js/main.js` verifica automáticamente mediante una petición `HEAD` si `assets/cv/cv-jahir-jaziel.pdf` existe; si no existe, desactiva el botón de forma segura para evitar enlaces rotos.

---

## 6. Cómo publicar mediante GitHub Pages

1. Crea un repositorio en tu cuenta `https://github.com/JazyelAe` (por ejemplo, `jaziel-dev`).
2. Sube el contenido de esta carpeta a la rama `main`:
   ```bash
   git init
   git add .
   git commit -m "feat: lanzamiento inicial de JAZIEL.DEV"
   git branch -M main
   git remote add origin https://github.com/JazyelAe/jaziel-dev.git
   git push -u origin main
   ```
3. En GitHub, entra a **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**, elige la rama `main` y la carpeta `/ (root)` y guarda.
5. En unos segundos tu portafolio estará publicado en:
   `https://jazyelae.github.io/jaziel-dev/`
   *(Todas las rutas del proyecto usan referencias relativas `./` para funcionar tanto en subruta de repositorio como en un futuro dominio personalizado).*

---

## 7. Cómo configurar Firebase y desplegar el backend de contacto

Consulta la guía dedicada en [`firebase/README.md`](./firebase/README.md) para los comandos exactos de instalación, configuración de `.env` y despliegue de la Cloud Function `sendContactMessage`.

---

## 8. Solución de errores frecuentes

- **No se ven los cambios recientes en `projects.json`:** Realiza una recarga forzada en el navegador (`Ctrl + F5` o `Cmd + Shift + R`) para limpiar la caché local.
- **Error de CORS al abrir `index.html` directamente desde el explorador de archivos (`file://`):** Los navegadores bloquean `script type="module"` sobre `file://` por seguridad. Usa siempre Live Server o `python3 -m http.server`.
- **El botón de CV aparece deshabilitado:** Verifica que el archivo se llame exactamente `assets/cv/cv-jahir-jaziel.pdf` (respetando minúsculas).

---

## 9. Lista de Pruebas Manuales de Calidad (QA Checklist)

- [ ] **Navegación y Scroll:** Hacer clic en *Inicio, Proyectos, Perfil, Tecnologías y Contacto* desplaza suavemente a cada sección y actualiza el indicador activo y la barra superior de progreso.
- [ ] **Menú Móvil:** En resoluciones menores a `768px`, el botón hamburguesa abre/cierra el menú, actualiza `aria-expanded` y se cierra al pulsar un enlace o la tecla `Escape`.
- [ ] **Fotografía y Fallback:** La fotografía `assets/images/jaziel-profile.webp` se visualiza nítida dentro del marco HUD. Si se renombra temporalmente el archivo, aparece el gráfico abstracto `JZ` sin icono de imagen rota.
- [ ] **Filtros de Proyectos:** Los botones *Todos*, *Frontend*, *QA / Testing* y *Aplicaciones web* filtran las tarjetas en tiempo real; la categoría *Backend* no se muestra mientras no exista un proyecto publicado en ella, y los proyectos con `"published": false` permanecen ocultos.
- [ ] **Detalle de Proyecto (Modal y Página):** Al pulsar *"Ver ficha técnica"* se abre el modal accesible (cerrable con `ESC` o clic exterior), y el botón *"Página dedicada"* abre `project.html?slug=talenthub-mexico` ocultando cualquier campo vacío (por ejemplo, *Consultas Médicas* no muestra botón de Demo porque no tiene `liveUrl`).
- [ ] **Botón de CV:** Los botones *"Consultar CV"* y *"Descargar CV (PDF)"* abren el documento real `assets/cv/cv-jahir-jaziel.pdf`.
- [ ] **Contacto y Validación:** El botón *"Copiar correo"* copia `jahirarana06@gmail.com` al portapapeles mostrando confirmación; el formulario valida campos vacíos o inválidos con mensajes por campo y procesa el envío seguro.
- [ ] **Accesibilidad y Movimiento Reducido:** Navegar con la tecla `Tab` muestra el enlace *"Saltar al contenido principal"* y anillos de foco visibles (`#65F5C4`). Activar `prefers-reduced-motion: reduce` en el sistema operativo desactiva las animaciones continuas.
