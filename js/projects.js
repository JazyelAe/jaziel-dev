/**
 * JAZIEL.DEV — Catálogo editorial de proyectos, filtros generados dinámicamente y modal accesible
 */

import { escapeHtml, renderIcon } from './utils.js';
import { buildProjectDetailMarkup } from './project-detail.js';
import { init3DTiltCards, refreshRevealElements } from './animations.js';

const CATEGORY_CATALOG = [
  { id: 'all', label: 'Todos' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'qa', label: 'QA / Testing' },
  { id: 'web-apps', label: 'Aplicaciones web' },
  { id: 'backend', label: 'Backend' }
];

export function initProjectsSection(publishedProjects) {
  const filterContainer = document.getElementById('project-filters');
  const gridContainer = document.getElementById('projects-grid');
  const countBadge = document.getElementById('projects-count');

  if (!filterContainer || !gridContainer) return;

  // Determinar qué categorías tienen al menos 1 proyecto publicado para no mostrar categorías vacías
  const availableCategories = new Set(['all']);
  publishedProjects.forEach((proj) => {
    if (proj.category) availableCategories.add(proj.category.toLowerCase());
    if (Array.isArray(proj.categories)) {
      proj.categories.forEach((c) => availableCategories.add(String(c).toLowerCase()));
    }
  });

  const activeFilters = CATEGORY_CATALOG.filter((cat) => availableCategories.has(cat.id));

  let currentFilter = 'all';

  function renderFilters() {
    filterContainer.innerHTML = activeFilters
      .map(
        (cat) => `
        <button
          type="button"
          class="filter-btn ${cat.id === currentFilter ? 'is-active' : ''}"
          data-filter="${escapeHtml(cat.id)}"
          aria-pressed="${cat.id === currentFilter ? 'true' : 'false'}"
        >
          ${escapeHtml(cat.label)}
        </button>
      `
      )
      .join('');

    filterContainer.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFilter = btn.getAttribute('data-filter') || 'all';
        renderFilters();
        renderProjectsGrid();
      });
    });
  }

  function matchesCategory(project, filterId) {
    if (filterId === 'all') return true;
    const primary = (project.category || '').toLowerCase();
    const list = Array.isArray(project.categories) ? project.categories.map((c) => String(c).toLowerCase()) : [];
    return primary === filterId || list.includes(filterId);
  }

  function renderProjectsGrid() {
    const filtered = publishedProjects.filter((p) => matchesCategory(p, currentFilter));

    if (countBadge) {
      countBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'PROYECTO PUBLICADO' : 'PROYECTOS PUBLICADOS'}`;
    }

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="detail-block detail-block--full" style="grid-column: span 12; text-align:center;">
          <p class="mono-label">SIN RESULTADOS EN ESTA CATEGORÍA</p>
          <p style="color:var(--text-secondary);margin-top:0.5rem;">Selecciona otra categoría para explorar los proyectos disponibles.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filtered
      .map((project, index) => {
        const num = String(index + 1).padStart(2, '0');
        const techMarkup = Array.isArray(project.technologies)
          ? project.technologies
              .map((tech) => `<span class="tech-pill">${escapeHtml(tech)}</span>`)
              .join('')
          : '';

        const demoButton = project.liveUrl
          ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary">
              <span>Demo en vivo</span>
              ${renderIcon('external-link', 16)}
            </a>`
          : '';

        const repoButton = project.repositoryUrl
          ? `<a href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary">
              ${renderIcon('github', 16)}
              <span>Repositorio</span>
            </a>`
          : '';

        return `
          <article class="project-card" data-reveal data-tilt data-project-slug="${escapeHtml(project.slug)}">
            <div class="project-card__media">
              <img
                src="${escapeHtml(project.coverImage || 'assets/images/projects/abstract-placeholder.webp')}"
                alt="Vista de portada del proyecto ${escapeHtml(project.title)}"
                class="project-card__img"
                loading="lazy"
                onerror="this.src='assets/images/projects/abstract-placeholder.webp'"
              />
              <span class="project-card__badge-overlay">
                <span>${num} // ${escapeHtml(project.statusBadge || 'PROYECTO')}</span>
              </span>
            </div>

            <div class="project-card__body">
              <div>
                <div class="project-card__meta">
                  <span class="mono-label">${escapeHtml(project.categoryLabel || project.category)}</span>
                  <span class="project-card__role">Rol: ${escapeHtml(project.role)}</span>
                </div>
                <h3 class="project-card__title">${escapeHtml(project.title)}</h3>
                ${project.subtitle ? `<p class="project-card__subtitle">${escapeHtml(project.subtitle)}</p>` : ''}
                <p class="project-card__desc" style="margin-top:0.85rem;">
                  ${escapeHtml(project.shortDescription)}
                </p>
              </div>

              <div>
                <div class="tech-stack-list" aria-label="Tecnologías empleadas">
                  ${techMarkup}
                </div>

                <div class="project-card__actions">
                  <button
                    type="button"
                    class="btn btn--ghost js-open-project-detail"
                    data-slug="${escapeHtml(project.slug)}"
                  >
                    ${renderIcon('eye', 15)}
                    <span>Ver ficha técnica</span>
                  </button>
                  ${demoButton}
                  ${repoButton}
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    gridContainer.querySelectorAll('.js-open-project-detail').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-slug');
        const proj = publishedProjects.find((p) => p.slug === slug);
        if (proj) openProjectModal(proj);
      });
    });

    refreshRevealElements(gridContainer);
    init3DTiltCards(gridContainer);
  }

  renderFilters();
  renderProjectsGrid();
  setupModalControls();
}

function setupModalControls() {
  const backdrop = document.getElementById('project-modal-backdrop');
  const closeBtn = document.getElementById('project-modal-close');
  if (!backdrop) return;

  function closeModal() {
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
      closeModal();
    }
  });
}

export function openProjectModal(project) {
  const backdrop = document.getElementById('project-modal-backdrop');
  const modalBody = document.getElementById('project-modal-body');
  const modalTitle = document.getElementById('project-modal-title');
  if (!backdrop || !modalBody) return;

  if (modalTitle) {
    modalTitle.textContent = `FICHA TÉCNICA // ${project.title.toUpperCase()}`;
  }

  modalBody.innerHTML = buildProjectDetailMarkup(project, { isStandalonePage: false });
  backdrop.classList.add('is-open');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
