(() => {
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('nav');
  const navToggle = document.querySelector('.nav-toggle');

  /* ---------- Menu mobile ---------- */

  if (nav && navToggle) {
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
  }

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

  const links = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
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

  /* ---------- Copie de l'adresse e-mail au clic ---------- */

  const copyStatus = document.querySelector('[data-copy-status]');

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    if (!copied) throw new Error('Copie impossible');
  };

  document.querySelectorAll('[data-copy]').forEach((link) => {
    const label = link.querySelector('[data-copy-label]');
    const initialLabel = label ? label.innerHTML : '';
    let resetTimer;

    link.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await copyText(link.dataset.copy);
      } catch (err) {
        // Copie refusée par le navigateur : on ouvre la messagerie à la place
        window.location.href = link.href;
        return;
      }
      link.classList.add('is-copied');
      if (label) label.textContent = 'Adresse copiée\u00a0!';
      if (copyStatus) copyStatus.textContent = 'Adresse e-mail copiée dans le presse-papiers.';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        link.classList.remove('is-copied');
        if (label) label.innerHTML = initialLabel;
        if (copyStatus) copyStatus.textContent = '';
      }, 2500);
    });
  });

  /* ---------- Visionneuse des photos de terrain ---------- */

  const lightbox = document.querySelector('.lightbox');
  const galleryLinks = [...document.querySelectorAll('[data-gallery] a')];

  // Sans <dialog> (navigateur ancien), les liens ouvrent simplement la photo
  if (lightbox && typeof lightbox.showModal === 'function' && galleryLinks.length) {
    const image = lightbox.querySelector('.lightbox__img');
    const caption = lightbox.querySelector('.lightbox__caption');
    let current = 0;

    const show = (index) => {
      current = (index + galleryLinks.length) % galleryLinks.length;
      const link = galleryLinks[current];
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      caption.textContent = link.dataset.caption || '';
    };

    galleryLinks.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        show(index);
        lightbox.showModal();
      });
    });

    lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
    lightbox.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1));
    lightbox.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('click', (e) => {
      // Un clic en dehors de la photo et des boutons ferme la visionneuse
      if (e.target === lightbox || e.target.classList.contains('lightbox__figure')) lightbox.close();
    });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- Année du pied de page ---------- */

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
