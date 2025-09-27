// Simple hash router for in-page navigation and active link state
(function() {
  function setActive() {
    const hash = window.location.hash || '#home';
    document.querySelectorAll('.nav-list a').forEach(a => {
      if (a.getAttribute('href') === hash) a.classList.add('active');
      else a.classList.remove('active');
    });
  }
  window.addEventListener('hashchange', setActive);
  window.addEventListener('DOMContentLoaded', setActive);
})();




