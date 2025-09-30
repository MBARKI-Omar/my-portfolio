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

      const tags = (project.tags || []).map(t => `<span class=\"tag\">${t}</span>`).join('');

      // Report button (right of title) if project.report exists
      const reportHref = typeof project.report === 'string' && project.report.trim() ? project.report : '';
      const reportButton = reportHref
        ? `<a class=\"btn-tertiary\" href=\"${reportHref}\" download target=\"_blank\" rel=\"noopener\">Download report</a>`
        : '';

      // Helper to render a section from string or string[]
      const renderSection = (title, value, { list = false } = {}) => {
        if (value == null) return '';
        if (Array.isArray(value)) {
          if (value.length === 0) return '';
          return `<div class=\"stack\" style=\"margin-top:14px;\">\n            <h3>${escapeHTML(title)}</h3>\n            <ul class=\"bulleted\">${value.map(v => `<li>${escapeHTML(String(v))}</li>`).join('')}</ul>\n          </div>`;
        }
        const str = String(value).trim();
        if (!str) return '';
        return `<div class=\"stack\" style=\"margin-top:14px;\">\n          <h3>${escapeHTML(title)}</h3>\n          ${list ? `<ul class=\\\"bulleted\\\"><li>${escapeHTML(str)}</li></ul>` : simpleMarkdown(str)}\n        </div>`;
      };

      const secContext = renderSection('Context', project.context);
      const secProjectDesc = renderSection('Project Description', project.projectDescription || project.details || project.description);
      const secRoleContrib = renderSection('Your Role & Contributions', project.roleContributions);
      const secTools = renderSection('Tools & Technologies', project.toolsTechnologies || (Array.isArray(project.tags) ? project.tags : undefined));
      const secChallenges = renderSection('Challenges & Solutions', project.challengesSolutions);
      const secResults = renderSection('Results & Impact', project.resultsImpact);
      const secLearnings = renderSection('Learnings & Takeaways', project.learningsTakeaways);

      // Media: show image if provided, else gradient placeholder
      const mediaHTML = (typeof project.img === 'string' && project.img.trim())
        ? `<img src=\"${escapeAttr(project.img)}\" alt=\"${escapeHTML(project.title)}\" style=\"margin:12px 0; width:100%; height:auto; aspect-ratio:16/9; border-radius:12px; object-fit:cover;\">`
        : `<div class=\"project-media\" style=\"margin:12px 0; aspect-ratio:16/9; border-radius:12px; background: linear-gradient(135deg, color-mix(in oklab, var(--accent) 28%, transparent), color-mix(in oklab, var(--primary) 28%, transparent)); opacity:.6;\"></div>`;

      container.innerHTML = `
        <div class=\"row space-between align-center\" style=\"margin-top:0; gap:12px;\">\n          <h2 style=\"margin:0;\">${project.title}</h2>\n          ${reportButton}\n        </div>
        <div class=\"meta\">${formatDate(project.date)}${project.domain ? ' • ' + project.domain : ''}</div>
        ${mediaHTML}
        <p>${project.description}</p>
        <div class=\"tags\" style=\"margin:10px 0;\">${tags}</div>
        ${secContext}
        ${secProjectDesc}
        ${secRoleContrib}
        ${secTools}
        ${secChallenges}
        ${secResults}
        ${secLearnings}
      `;
    } catch (e) {
      container.textContent = 'Failed to load project.';
      console.error(e);
    }
  }

  window.addEventListener('DOMContentLoaded', init);
})();

// Minimal helpers (local)
function simpleMarkdown(md) {
  try {
    let html = String(md)
      .replace(/^###\s?(.*)$/gim, '<h4>$1</h4>')
      .replace(/^##\s?(.*)$/gim, '<h3>$1</h3>')
      .replace(/^#\s?(.*)$/gim, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1<\/a>')
      .replace(/\n\n+/g, '</p><p>');
    return '<p>' + html + '</p>';
  } catch { return md; }
}

function escapeHTML(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(str) {
  return escapeHTML(String(str)).replace(/[\n\r\t]/g, ' ');
}


