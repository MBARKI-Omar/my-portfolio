(function(){
  const { qs, create, formatDate } = window.utils || {};

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async function loadJSON(path) {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
  }

  async function init() {
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug');
    const container = qs('#projectDetail');
    if (!container) return;

    try {
      const projects = await loadJSON('data/projects.json');
      const project = projects.find(p => slugify(p.title) === slug) || projects[0];
      if (!project) {
        container.textContent = 'Project not found.';
        return;
      }

      const tags = (project.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

      container.innerHTML = `
        <h2 style="margin-top:0;">${project.title}</h2>
        <div class="meta">${formatDate(project.date)}${project.domain ? ' • ' + project.domain : ''}</div>
        <div class="project-media" style="margin:12px 0; aspect-ratio:16/9; border-radius:12px; background: linear-gradient(135deg, color-mix(in oklab, var(--accent) 28%, transparent), color-mix(in oklab, var(--primary) 28%, transparent)); opacity:.6;"></div>
        <p>${project.description}</p>
        <div class="tags" style="margin:10px 0;">${tags}</div>
        <div class="row gap-sm">
          ${project.github ? `<a class="btn-tertiary" href="${project.github}" target="_blank" rel="noopener">Code</a>` : ''}
          ${project.demo ? `<a class="btn-primary" href="${project.demo}" target="_blank" rel="noopener">Live Demo</a>` : ''}
        </div>
      `;
    } catch (e) {
      container.textContent = 'Failed to load project.';
      console.error(e);
    }
  }

  window.addEventListener('DOMContentLoaded', init);
})();


