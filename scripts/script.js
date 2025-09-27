// Theme
(function() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', current);
      localStorage.setItem('theme', current);
      toggle.textContent = current === 'light' ? '🌙' : '☀️';
    });
  }
})();

// Mobile nav
(function() {
  const button = document.querySelector('.nav-toggle');
  const list = document.querySelector('.nav-list');
  if (!button || !list) return;
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    list.style.display = expanded ? 'none' : 'flex';
  });
})();

// Reveal animations
(function() {
  let delay = 0;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.transitionDelay = (delay * 60) + 'ms';
        el.classList.add('visible');
        delay = (delay + 1) % 10;
      }
    });
  }, { threshold: 0.12 });
  function observeAll() {
    document.querySelectorAll('[data-reveal], .card, .project').forEach((el) => observer.observe(el));
  }
  observeAll();
  window.revealObserveAll = observeAll;
})();

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Contact form (EmailJS optional)
document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('formStatus');
  status.textContent = 'Sending…';
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));

  // Use EmailJS only (no mailto fallback)
  const EMAILJS_PUBLIC_KEY = window.EMAILJS_PUBLIC_KEY || '';
  const EMAILJS_SERVICE_ID = window.EMAILJS_SERVICE_ID || '';
  const EMAILJS_TEMPLATE_ID = window.EMAILJS_TEMPLATE_ID || '';
  const CONTACT_RECIPIENT = window.CONTACT_RECIPIENT || 'mbarki_omar@outlook.fr';

  // Validate fields
  if (!data.object || !data.email || !data.message) {
    status.textContent = 'Please fill out Object, Email, and Message.';
    return;
  }

  try {
    if (EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && window.emailjs) {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        object: data.object,
        email: data.email,
        message: data.message,
        to_email: CONTACT_RECIPIENT
      });
      status.textContent = 'Message sent! Thank you.';
      form.reset();
      return;
    } else {
      status.textContent = 'Sending unavailable: email service not configured.';
      return;
    }
  } catch (err) {
    console.error(err);
    status.textContent = 'Failed to send. Please try again later.';
    return;
  }
});

// Always land on Home on first load or reload
window.history.scrollRestoration = 'manual';
window.addEventListener('load', () => {
  const navEntries = performance.getEntriesByType ? performance.getEntriesByType('navigation') : [];
  const navEntry = navEntries && navEntries[0];
  const isReload = navEntry ? navEntry.type === 'reload' : (performance.navigation && performance.navigation.type === 1);

  if (isReload) {
    if (location.hash !== '#home') location.replace('#home');
    window.scrollTo(0, 0);
  } else if (!location.hash) {
    location.replace('#home');
    window.scrollTo(0, 0);
  }
});

// Scroll progress bar
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  const progress = document.getElementById('progress');
  if (progress) progress.style.width = (scrolled * 100) + '%';
});

// Parallax effect on elements with data-parallax
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const factor = parseFloat(el.getAttribute('data-parallax')) || 0.05;
    el.style.transform = `translateY(${y * factor}px)`;
  });
});


