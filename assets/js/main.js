(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const themeToggle = document.querySelector('.theme-toggle');

  /* ---------- Thème clair / sombre ---------- */

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');

  const updateThemeLabel = () => {
    const next = currentTheme() === 'dark' ? 'clair' : 'sombre';
    themeToggle.setAttribute('aria-label', `Activer le thème ${next}`);
  };

  themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* stockage indisponible : le choix vaut pour cette visite */
    }
    updateThemeLabel();
  });

  prefersDark.addEventListener('change', updateThemeLabel);
  updateThemeLabel();

  /* ---------- Menu mobile ---------- */

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };

  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      navToggle.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
  });

  /* ---------- En-tête au défilement ---------- */

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Apparition des blocs ---------- */

  const revealed = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealed.forEach((el) => revealObserver.observe(el));
  } else {
    revealed.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Lien actif dans la navigation ---------- */

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  // L'accueil est observé aussi, pour désactiver tous les liens en haut de page
  const sections = [document.getElementById('accueil')]
    .concat(links.map((link) => document.querySelector(link.getAttribute('href'))))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) =>
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- Année du pied de page ---------- */

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
