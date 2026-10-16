/**
 * JAZIEL.DEV — Punto de entrada principal (ES Module)
 */

import { loadAllPortfolioData, getPublishedProjectBySlug } from './data.js';
import { initNavigation } from './navigation.js';
import { initAnimations, refreshRevealElements } from './animations.js';
import { initProjectsSection } from './projects.js';
import { buildProjectDetailMarkup } from './project-detail.js';
import { initContactSection } from './contact.js';
import { checkAssetExists, escapeHtml, renderIcon } from './utils.js';

async function bootstrap() {
  initNavigation();
  initAnimations();

  // Actualizar año del footer automáticamente
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const { publishedProjects, profile, skills } = await loadAllPortfolioData();

  // Verificar existencia del CV PDF antes de activar botones de descarga/consulta
  await verifyCvButtons(profile?.cvPath || 'assets/cv/cv-jahir-jaziel.pdf');

  // Si estamos en la página dedicada project.html
  const detailPageContainer = document.querySelector('[data-standalone-project-detail]');
  if (detailPageContainer) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const project = await getPublishedProjectBySlug(slug);
    if (project) {
      document.title = `${project.title} — JAZIEL.DEV`;
    }
    detailPageContainer.innerHTML = buildProjectDetailMarkup(project, { isStandalonePage: true });
    return;
  }

  // Renderizar secciones dinámicas en index.html
  renderProfilePillars(profile);
  renderEducationList(profile);
  renderSkillsMatrix(skills);
  initProjectsSection(publishedProjects);
  initContactSection(profile);
}

async function verifyCvButtons(cvPath) {
  const cvButtons = document.querySelectorAll('.js-cv-button');
  if (cvButtons.length === 0) return;

  const exists = await checkAssetExists(cvPath);
  cvButtons.forEach((btn) => {
    if (exists) {
      btn.setAttribute('href', cvPath);
      btn.removeAttribute('aria-disabled');
    } else {
      btn.removeAttribute('href');
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('title', 'Archivo CV pendiente de incorporar en assets/cv/cv-jahir-jaziel.pdf');
    }
  });
}

function renderProfilePillars(profile) {
  const container = document.getElementById('profile-pillars-grid');
  const leadEl = document.getElementById('profile-lead-text');
  if (leadEl && profile?.about?.lead) {
    leadEl.textContent = profile.about.lead;
  }
  if (!container || !Array.isArray(profile?.about?.pillars)) return;

  container.innerHTML = profile.about.pillars
    .map(
      (pillar) => `
      <article class="pillar-card" data-reveal>
        <div class="pillar-card__header">
          <span class="pillar-card__code">${escapeHtml(pillar.code)}</span>
          <span style="color:var(--accent-mint);">${renderIcon(pillar.icon, 18)}</span>
        </div>
        <h3 class="pillar-card__title">${escapeHtml(pillar.title)}</h3>
        <p class="pillar-card__desc">${escapeHtml(pillar.description)}</p>
      </article>
    `
    )
    .join('');

  refreshRevealElements(container);
}

function renderEducationList(profile) {
  const container = document.getElementById('education-list');
  if (!container || !Array.isArray(profile?.education)) return;

  container.innerHTML = profile.education
    .map(
      (item) => `
      <article class="education-item ${item.highlight ? 'is-current' : ''}">
        <div class="education-item__meta">
          <span class="mono-label">${escapeHtml(item.period || '')}</span>
          <span class="education-item__status">${escapeHtml(item.status)}</span>
        </div>
        <h4 class="education-item__program">${escapeHtml(item.program)}</h4>
        <p class="education-item__inst">${escapeHtml(item.institution)}</p>
      </article>
    `
    )
    .join('');
}

function renderSkillsMatrix(skillsData) {
  const container = document.getElementById('skills-matrix-grid');
  if (!container || !Array.isArray(skillsData?.groups)) return;

  container.innerHTML = skillsData.groups
    .map(
      (group) => `
      <article class="skill-group-card" data-reveal>
        <div class="skill-group-card__top">
          <div>
            <span class="skill-group-card__code">${escapeHtml(group.code)}</span>
            <h3 class="skill-group-card__title">${escapeHtml(group.title)}</h3>
            <p class="skill-group-card__subtitle">${escapeHtml(group.subtitle)}</p>
          </div>
          <span style="color:var(${group.accent === 'blue' ? '--accent-blue' : '--accent-mint'});">
            ${renderIcon(group.icon, 22)}
          </span>
        </div>

        <ul class="skill-nodes" aria-label="Tecnologías de ${escapeHtml(group.title)}">
          ${group.items
            .map(
              (item) => `
              <li class="skill-node">
                <span class="skill-node__name">${escapeHtml(item.name)}</span>
                <span class="skill-node__tag">${escapeHtml(item.tag)}</span>
              </li>
            `
            )
            .join('')}
        </ul>
      </article>
    `
    )
    .join('');

  refreshRevealElements(container);
}

document.addEventListener('DOMContentLoaded', bootstrap);
