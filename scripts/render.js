const { qs, qsa, create, formatDate } = window.utils || {};

const DEFAULT_PROJECTS = [
  { title: 'Neural Style Transfer App', description: 'Real-time artistic style transfer using deep convolutional neural networks with a web interface.', tags: ['TensorFlow','React','Computer Vision','Deep Learning'], domain: 'Deep Learning', github: 'https://github.com/yourname/style-transfer', demo: 'https://demo.example.com/style-transfer', date: '2025-06-10' },
  { title: 'Sentiment Analysis Platform', description: 'Multi-language sentiment analysis using transformer models. Social media ingestion and real-time insights dashboard.', tags: ['BERT','NLP','Python','FastAPI','Docker'], domain: 'NLP', github: 'https://github.com/yourname/sentiment-platform', demo: 'https://demo.example.com/sentiment', date: '2025-05-20' },
  { title: 'Medical Imaging Classification', description: 'Chest X-ray pathology detection with Grad-CAM explanations and evaluation toolkit.', tags: ['PyTorch','Healthcare','Explainability'], domain: 'Healthcare', github: 'https://github.com/yourname/med-imaging', demo: '', date: '2025-04-14' },
  { title: 'Data Engineering Pipeline', description: 'Batch + streaming ETL with data quality checks, feature store, and analytics-ready warehouse.', tags: ['Data Engineering','ETL','MLflow'], domain: 'Data Science', github: 'https://github.com/yourname/data-pipeline', demo: '', date: '2024-12-01' }
];

const DEFAULT_EXPERIENCE = [
  { role: 'AI Research Engineer', org: 'MedVision Labs', start: '2025-03-01', end: null, description: 'Prototyped clinical imaging models and explainability dashboards.', tags: ['Computer Vision','PyTorch','MLOps'] },
  { role: 'Full‑Stack ML Project', org: 'Ensimag', start: '2024-09-01', end: '2025-01-31', description: 'End‑to‑end pipeline with feature store, training, and reporting.', tags: ['MLflow','Dashboards','ETL'] }
];

const DEFAULT_BLOG_INDEX = [{ slug: 'getting-started', title: 'Why AI in Healthcare?', date: '2025-08-01' }];
const FORCE_OFFLINE = new URLSearchParams(location.search).has('offline');

async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
  } catch (e) {
    if (FORCE_OFFLINE || path.includes('projects.json')) {
      return DEFAULT_PROJECTS;
    } else if (FORCE_OFFLINE || path.includes('experience.json')) {
      return DEFAULT_EXPERIENCE;
    } else if (FORCE_OFFLINE || path.includes('blog/index.json')) {
      return DEFAULT_BLOG_INDEX;
    }
    throw e;
  }
}

function applyReveal(el) { el.setAttribute('data-reveal', ''); }

// Timeline removed in redesign

// Experience
async function renderExperience() {
  const grid = qs('#experienceList'); if (!grid) return;
  const items = await loadJSON('data/experience.json');
  grid.innerHTML = '';
  items.forEach(exp => {
    const card = create('article', { className: 'card exp-card selectable' }); applyReveal(card);
    card.innerHTML = `<h4>${exp.role}</h4>
      <div class="exp-meta">${exp.org} • ${formatDate(exp.start)} – ${exp.end ? formatDate(exp.end) : 'Present'}</div>
      <p>${exp.description}</p>
      <div class="tags">${(exp.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>`;
    const slug = slugify(exp.role + '-' + (exp.org||''));
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      card.classList.add('selecting');
      setTimeout(() => {
        window.location.href = `experience.html?slug=${encodeURIComponent(slug)}`;
      }, 140);
    });
    grid.appendChild(card);
  });
}

// Projects
let allProjects = [];
let showAllProjects = false;
let currentProjectFilter = 'all';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function renderProjects() {
  const grid = qs('#projectsGrid'); if (!grid) return; grid.classList.add('projects-list');
  allProjects = await loadJSON('data/projects.json').catch(() => DEFAULT_PROJECTS);
  if (!Array.isArray(allProjects) || allProjects.length === 0) {
    allProjects = DEFAULT_PROJECTS;
  }

  // Ensure toggle control exists
  let toggle = qs('#projectsToggle');
  if (!toggle) {
    toggle = create('button', { id: 'projectsToggle', className: 'btn-tertiary' });
    const container = grid.parentElement; // .container
    container.appendChild(toggle);
    toggle.addEventListener('click', () => {
      showAllProjects = !showAllProjects;
      drawProjects(currentProjectFilter);
    });
  }

  drawProjects('all');
  if (window.revealObserveAll) window.revealObserveAll();
}

function drawProjects(filter) {
  currentProjectFilter = filter;
  const grid = qs('#projectsGrid');
  grid.innerHTML = '';
  const filtered = allProjects.filter(p => filter === 'all' || (p.tags || []).includes(filter));
  filtered.sort((a,b) => new Date(b.date) - new Date(a.date));

  const list = showAllProjects ? filtered : filtered.slice(0, 3);

  if (list.length === 0) {
    const empty = create('div', { className: 'meta' });
    empty.textContent = 'No projects found.';
    grid.appendChild(empty);
  } else {
    list.forEach(p => {
      const card = create('article', { className: 'card project selectable' }); applyReveal(card);
      const tags = (p.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
      const slug = slugify(p.title);
      card.innerHTML = `
        <div class="project-media"></div>
        <div>
          <h3>${p.title}</h3>
          <div class="meta">${formatDate(p.date)}${p.domain ? ' • ' + p.domain : ''}</div>
          <p>${p.description}</p>
          <div class="tags">${tags}</div>
        </div>`;
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        card.classList.add('selecting');
        setTimeout(() => {
          window.location.href = `project.html?slug=${encodeURIComponent(slug)}`;
        }, 140);
      });
      grid.appendChild(card);
    });
  }

  const toggle = qs('#projectsToggle');
  if (toggle) {
    const moreExists = filtered.length > 3;
    toggle.style.display = moreExists ? 'inline-flex' : 'none';
    toggle.textContent = showAllProjects ? 'Show less ▲' : 'Show more ▼';
  }

  if (window.revealObserveAll) window.revealObserveAll();
}

function setupProjectFilters() {
  qsa('#projects .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('#projects .chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showAllProjects = false; // reset to collapsed when filter changes
      drawProjects(btn.dataset.filter);
    });
  });
}

// Blog removed

// Very tiny markdown converter (headings, bold, italics, links, paragraphs)
function simpleMarkdown(md) {
  let html = md
    .replace(/^###\s?(.*)$/gim, '<h4>$1</h4>')
    .replace(/^##\s?(.*)$/gim, '<h3>$1</h3>')
    .replace(/^#\s?(.*)$/gim, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1<\/a>')
    .replace(/\n\n+/g, '</p><p>');
  return '<p>' + html + '</p>';
}

// Boot
window.addEventListener('DOMContentLoaded', async () => {
  try {
    setupProjectFilters();
    await Promise.all([
      renderExperience(),
      renderProjects()
    ]);
  } catch (e) { console.error(e); }
});


