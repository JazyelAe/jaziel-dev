/**
 * JAZIEL.DEV — Renderizado de detalle de proyecto (tanto para Modal accesible como para project.html)
 * Oculta automáticamente cualquier apartado que no tenga datos para no inventar información.
 */

import { escapeHtml, renderIcon } from './utils.js';

export function buildProjectDetailMarkup(project, { isStandalonePage = false } = {}) {
  if (!project) {
    return `
      <div class="detail-block detail-block--full">
        <p class="mono-tag">PROYECTO NO ENCONTRADO</p>
        <h2 style="margin-top:0.75rem;">El proyecto solicitado no existe o no está publicado.</h2>
        <p style="color:var(--text-secondary);margin-top:0.5rem;">Verifica el identificador en la URL o explora el catálogo principal.</p>
        <div style="margin-top:1.5rem;">
          <a href="./index.html#proyectos" class="btn btn--primary">Volver a proyectos</a>
        </div>
      </div>
    `;
  }

  const techBadges = Array.isArray(project.technologies) && project.technologies.length > 0
    ? `<div class="tech-stack-list" style="margin-top:1rem;">
        ${project.technologies.map((t) => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
      </div>`
    : '';

  const repoBtn = project.repositoryUrl
    ? `<a href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary">
        ${renderIcon('github', 17)}
        <span>Repositorio GitHub</span>
      </a>`
    : '';

  const liveBtn = project.liveUrl
    ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary">
        <span>Abrir Demo en Producción</span>
        ${renderIcon('external-link', 17)}
      </a>`
    : '';

  const standaloneLink = !isStandalonePage
    ? `<a href="./project.html?slug=${encodeURIComponent(project.slug)}" class="btn btn--ghost">
        <span>Página dedicada</span>
        ${renderIcon('arrow-up-right', 15)}
      </a>`
    : '';

  const infoBlocks = [];

  if (project.context) {
    infoBlocks.push(`
      <article class="detail-block">
        <p class="detail-block__label">01 // Contexto</p>
        <p>${escapeHtml(project.context)}</p>
      </article>
    `);
  }

  if (project.objective) {
    infoBlocks.push(`
      <article class="detail-block">
        <p class="detail-block__label">02 // Objetivo</p>
        <p>${escapeHtml(project.objective)}</p>
      </article>
    `);
  }

  if (project.problem) {
    infoBlocks.push(`
      <article class="detail-block">
        <p class="detail-block__label">03 // Problema abordado</p>
        <p>${escapeHtml(project.problem)}</p>
      </article>
    `);
  }

  if (project.solution) {
    infoBlocks.push(`
      <article class="detail-block">
        <p class="detail-block__label">04 // Solución desarrollada</p>
        <p>${escapeHtml(project.solution)}</p>
      </article>
    `);
  }

  if (Array.isArray(project.contribution) && project.contribution.length > 0) {
    infoBlocks.push(`
      <article class="detail-block detail-block--full">
        <p class="detail-block__label">05 // Mi contribución (${escapeHtml(project.role || 'Colaborador')})</p>
        <ul class="detail-list">
          ${project.contribution.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </article>
    `);
  }

  if (Array.isArray(project.features) && project.features.length > 0) {
    infoBlocks.push(`
      <article class="detail-block detail-block--full">
        <p class="detail-block__label">06 // Funcionalidades y alcance verificado</p>
        <ul class="detail-list">
          ${project.features.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </article>
    `);
  }

  const gallerySection = Array.isArray(project.gallery) && project.gallery.length > 0
    ? `<div class="detail-block detail-block--full">
        <p class="detail-block__label">Capturas del proyecto</p>
        <div class="detail-grid" style="margin-block:1rem 0;">
          ${project.gallery
            .map(
              (imgUrl, idx) => `
              <figure class="detail-cover-wrap" style="margin:0;">
                <img src="${escapeHtml(imgUrl)}" alt="Captura ${idx + 1} de ${escapeHtml(project.title)}" loading="lazy" />
              </figure>
            `
            )
            .join('')}
        </div>
      </div>`
    : '';

  const coverCaption = project.coverCaption
    ? `<figcaption class="detail-cover-caption">${escapeHtml(project.coverCaption)}</figcaption>`
    : '';

  return `
    <div class="project-detail-content">
      <div class="project-card__meta">
        <span class="mono-tag">${escapeHtml(project.categoryLabel || project.category)}</span>
        <span class="project-card__role">Rol: ${escapeHtml(project.role)}</span>
      </div>
      <h2 class="section-title" style="margin-top:0.65rem;">${escapeHtml(project.title)}</h2>
      ${project.subtitle ? `<p class="project-card__subtitle" style="font-size:var(--text-sm);">${escapeHtml(project.subtitle)}</p>` : ''}
      <p class="section-Lead" style="margin-top:1rem;">${escapeHtml(project.description || project.shortDescription)}</p>
      ${techBadges}

      <div class="project-card__actions" style="margin-top:1.5rem;">
        ${liveBtn}
        ${repoBtn}
        ${standaloneLink}
      </div>

      ${project.coverImage ? `
        <figure class="detail-cover-wrap">
          <img src="${escapeHtml(project.coverImage)}" alt="Representación visual de ${escapeHtml(project.title)}" loading="lazy" />
          ${coverCaption}
        </figure>
      ` : ''}

      ${infoBlocks.length > 0 ? `<div class="detail-grid">${infoBlocks.join('')}</div>` : ''}
      ${gallerySection}
    </div>
  `;
}
