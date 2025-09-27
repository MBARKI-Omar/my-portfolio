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
    const container = qs('#experienceDetail');
    if (!container) return;

    try {
      const experiences = await loadJSON('data/experience.json');
      const exp = experiences.find(e => slugify(e.role + '-' + (e.org||'')) === slug) || experiences[0];
      if (!exp) { container.textContent = 'Experience not found.'; return; }

      const tags = (exp.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
      container.innerHTML = `
        <h2 style="margin-top:0;">${exp.role}</h2>
        <div class="meta">${exp.org} • ${formatDate(exp.start)} – ${exp.end ? formatDate(exp.end) : 'Present'}</div>
        <p>${exp.description}</p>
        <div class="tags" style="margin:10px 0;">${tags}</div>
      `;
    } catch (e) {
      container.textContent = 'Failed to load experience.';
      console.error(e);
    }
  }

  window.addEventListener('DOMContentLoaded', init);
})();


