// Simple helper utilities (scoped; no globals leaked)
(function() {
  const qs = (selector, scope) => (scope || document).querySelector(selector);
  const qsa = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));
  const create = (tag, options) => Object.assign(document.createElement(tag), options || {});
  const formatDate = (iso) => {
    try { const d = new Date(iso); return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' }); } catch { return iso; }
  };
  window.utils = { qs, qsa, create, formatDate };
})();


