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

      // Compute duration
      const duration = computeDuration(exp.start, exp.end);

      // Helper to render a section from string or string[]
      const renderSection = (title, value, { list = false } = {}) => {
        if (value == null) return '';
        if (Array.isArray(value)) {
          if (value.length === 0) return '';
          return `<div class="stack" style="margin-top:14px;">
            <h3>${escapeHTML(title)}</h3>
            <ul class="bulleted">${value.map(v => `<li>${escapeHTML(String(v))}</li>`).join('')}</ul>
          </div>`;
        }
        const str = String(value).trim();
        if (!str) return '';
        return `<div class="stack" style="margin-top:14px;">
          <h3>${escapeHTML(title)}</h3>
          ${list ? `<ul class=\"bulleted\"><li>${escapeHTML(str)}</li></ul>` : simpleMarkdown(str)}
        </div>`;
      };

      // Map to requested sections (all optional, backward compatible)
      const secProjectName = renderSection('Project name', exp.projectName);
      const secContext = renderSection('Context', exp.context);
      const secProjectDesc = renderSection('Project Description', exp.projectDescription || exp.details);
      const secRoleContrib = renderSection('Your Role & Contributions', exp.roleContributions || exp.responsibilities);
      const secTools = renderSection('Tools & Technologies', exp.toolsTechnologies || (Array.isArray(exp.tags) ? exp.tags : undefined));
      const secChallenges = renderSection('Challenges & Solutions', exp.challengesSolutions || exp.highlights);
      const secResults = renderSection('Results & Impact', exp.resultsImpact);
      const secLearnings = renderSection('Learnings & Takeaways', exp.learningsTakeaways);

      // Optional report download button (appears to the right of the title)
      const reportHref = typeof exp.report === 'string' && exp.report.trim() ? escapeAttr(exp.report) : '';
      const reportButton = reportHref
        ? `<a class="btn-tertiary" href="${reportHref}" download target="_blank" rel="noopener">Download report</a>`
        : '';

      container.innerHTML = `
        <div class="row space-between align-center" style="margin-top:0; gap:12px;">
          <h2 style="margin:0;">${exp.role}</h2>
          ${reportButton}
        </div>
        <div class="meta">${exp.org} • ${formatDate(exp.start)} – ${exp.end ? formatDate(exp.end) : 'Present'}${duration ? ` • ${duration}` : ''}</div>
        <p>${exp.description}</p>
        <div class="tags" style="margin:10px 0;">${tags}</div>
        ${secProjectName}
        ${secContext}
        ${secProjectDesc}
        ${secRoleContrib}
        ${secTools}
        ${secChallenges}
        ${secResults}
        ${secLearnings}
      `;
    } catch (e) {
      container.textContent = 'Failed to load experience.';
      console.error(e);
    }
  }

  window.addEventListener('DOMContentLoaded', init);
})();

// Minimal helpers local to this module
function computeDuration(startIso, endIso) {
  try {
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : new Date();
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    months = Math.max(0, months);
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    const parts = [];
    if (years) parts.push(`${years} yr${years>1?'s':''}`);
    if (remMonths) parts.push(`${remMonths} mo${remMonths>1?'s':''}`);
    return parts.join(' ');
  } catch { return ''; }
}

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
  // Conservative attribute escaping (no newlines)
  return escapeHTML(str).replace(/[\n\r\t]/g, ' ');
}


