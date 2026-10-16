/**
 * JAZIEL.DEV — Sistema de animaciones:
 * 1. Red tecnológica de nodos en Canvas (requestAnimationFrame)
 * 2. Iluminación ambiental de cursor
 * 3. Revelado de elementos al hacer scroll (IntersectionObserver + GSAP opcional)
 * 4. Perspectiva 3D sutil en tarjetas e interfaz HUD
 */

import { prefersReducedMotion, isMobileViewport } from './utils.js';

export function initAnimations() {
  document.documentElement.classList.add('js-ready');

  initRevealOnScroll();

  if (prefersReducedMotion()) {
    return;
  }

  initCursorSpotlight();
  initNeuralGridCanvas();
  init3DTiltCards();
}

function initRevealOnScroll() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    elements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-reveal-delay');
          if (delay) {
            entry.target.style.transitionDelay = `${delay}ms`;
          }
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

export function refreshRevealElements(container = document) {
  const elements = container.querySelectorAll('[data-reveal]:not(.is-revealed)');
  elements.forEach((el, idx) => {
    setTimeout(() => {
      el.classList.add('is-revealed');
    }, idx * 70);
  });
}

function initCursorSpotlight() {
  if (isMobileViewport()) return;

  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.35;
  let rafPending = false;

  window.addEventListener(
    'pointermove',
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        window.requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--cursor-x', `${mouseX}px`);
          document.documentElement.style.setProperty('--cursor-y', `${mouseY}px`);
          rafPending = false;
        });
      }
    },
    { passive: true }
  );
}

export function init3DTiltCards(root = document) {
  if (prefersReducedMotion() || isMobileViewport()) return;

  const tiltElements = root.querySelectorAll('[data-tilt]');
  tiltElements.forEach((card) => {
    if (card.dataset.tiltBound === 'true') return;
    card.dataset.tiltBound = 'true';

    let frameId = null;

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-relY * 5.5).toFixed(2);
      const rotateY = (relX * 5.5).toFixed(2);

      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
      });
    });

    card.addEventListener('pointerleave', () => {
      if (frameId) cancelAnimationFrame(frameId);
      card.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });
}

function initNeuralGridCanvas() {
  const canvas = document.getElementById('neural-grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let animId = null;
  const pointer = { x: -9999, y: -9999 };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const count = isMobileViewport() ? 18 : Math.min(Math.floor((width * height) / 28000), 48);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.6 + 1,
      mint: Math.random() > 0.35
    }));
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    },
    { passive: true }
  );

  resize();

  function step() {
    ctx.clearRect(0, 0, width, height);

    const maxDist = isMobileViewport() ? 110 : 155;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.mint ? 'rgba(101, 245, 196, 0.55)' : 'rgba(104, 169, 255, 0.5)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.16;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(101, 245, 196, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Conexión sutil con el cursor
      const cdx = p.x - pointer.x;
      const cdy = p.y - pointer.y;
      const cdist = Math.hypot(cdx, cdy);
      if (cdist < 180) {
        const calpha = (1 - cdist / 180) * 0.25;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.strokeStyle = `rgba(104, 169, 255, ${calpha.toFixed(3)})`;
        ctx.stroke();
      }
    }

    animId = window.requestAnimationFrame(step);
  }

  step();
}
