/**
 * JAZIEL.DEV — Navegación minimalista, estados activos en scroll y menú móvil accesible
 */

export function initNavigation() {
  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const progressBar = document.getElementById('scroll-progress-bar');

  function closeMobileMenu() {
    if (!navMenu || !menuToggle) return;
    navMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
  }

  function toggleMobileMenu() {
    if (!navMenu || !menuToggle) return;
    const isOpen = navMenu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // Scroll Progress + Header Elevated State + Active Section Spy
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href').slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  let ticking = false;

  function onScrollUpdate() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 24);
    }

    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    }

    if (sections.length > 0) {
      const triggerLine = scrollY + window.innerHeight * 0.32;
      let currentId = sections[0].id;
      for (const sec of sections) {
        if (sec.offsetTop <= triggerLine) {
          currentId = sec.id;
        }
      }
      navLinks.forEach((link) => {
        const match = link.getAttribute('href') === `#${currentId}`;
        link.classList.toggle('is-active', match);
      });
    }

    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScrollUpdate);
        ticking = true;
      }
    },
    { passive: true }
  );

  onScrollUpdate();
}
