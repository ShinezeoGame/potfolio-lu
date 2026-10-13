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

  const toTop = document.querySelector('.to-top');

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    // La flèche apparaît une fois l'écran titre dépassé
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', (e) => {
      e.preventDefault();
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
      // Le focus revient en haut de page pour la navigation au clavier
      const brand = document.querySelector('.brand');
      if (brand) brand.focus({ preventScroll: true });
    });
  }

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

  /* ---------- Bandeaux de photos (défilement en boucle) ---------- */

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-strip]').forEach((strip) => {
    const track = strip.querySelector('.strip__track');
    const originals = [...track.children];
    originals.forEach((item, index) => { item.querySelector('a').dataset.index = index; });

    // Pas de boucle si toutes les photos tiennent déjà à l'écran
    if (track.scrollWidth - track.clientWidth <= 1) return;
    strip.classList.add('is-scrollable');

    // Une copie des photos avant et après : arrivé au bout, on repart naturellement au début
    const makeClone = (item) => {
      const clone = item.cloneNode(true);
      clone.classList.add('strip__item--clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelector('a').tabIndex = -1;
      return clone;
    };
    track.prepend(...originals.map(makeClone));
    track.append(...originals.map(makeClone));

    // Largeur d'une série complète de photos (espacements compris)
    const setWidth = () => originals[0].offsetLeft - track.firstElementChild.offsetLeft;
    let animating = false;

    // Ramène discrètement la position dans la série du milieu
    const recenter = (towards = 0) => {
      const w = setWidth();
      if (towards > 0 && track.scrollLeft > w) track.scrollLeft -= w;
      else if (towards < 0 && track.scrollLeft < w) track.scrollLeft += w;
      else if (track.scrollLeft < w * 0.5) track.scrollLeft += w;
      else if (track.scrollLeft > w * 1.5) track.scrollLeft -= w;
    };

    track.scrollLeft = setWidth();

    track.addEventListener('scroll', () => { if (!animating) recenter(); }, { passive: true });

    const page = (direction) => {
      recenter(direction);
      animating = !reduceMotion;
      track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (animating) {
        const done = () => { animating = false; recenter(); };
        if ('onscrollend' in window) track.addEventListener('scrollend', done, { once: true });
        else setTimeout(done, 600);
      }
    };

    strip.querySelector('[data-strip-prev]').addEventListener('click', () => page(-1));
    strip.querySelector('[data-strip-next]').addEventListener('click', () => page(1));

    // Au-dessus de la ligne de photos, la molette la fait défiler, sans jamais faire bouger la page
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? track.clientWidth : 1;
      track.scrollLeft += e.deltaY * unit;
    }, { passive: false });

    window.addEventListener('resize', () => recenter());
  });

  /* ---------- Visionneuse plein écran ---------- */

  const lightbox = document.querySelector('.lightbox');

  // Sans <dialog> (navigateur ancien), les liens ouvrent simplement la photo
  if (lightbox && typeof lightbox.showModal === 'function') {
    const image = lightbox.querySelector('.lightbox__img');
    const caption = lightbox.querySelector('.lightbox__caption');
    let items = [];
    let current = 0;

    const show = (index) => {
      current = (index + items.length) % items.length;
      const link = items[current];
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      caption.textContent = link.dataset.caption || '';
    };

    // La navigation reste dans la ligne de photos d'où la photo a été ouverte
    document.querySelectorAll('[data-gallery]').forEach((gallery) => {
      const all = [...gallery.querySelectorAll('a[data-caption]')];
      const originals = all.filter((link) => !link.closest('.strip__item--clone'));
      all.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          items = originals;
          show(link.dataset.index !== undefined ? Number(link.dataset.index) : originals.indexOf(link));
          lightbox.showModal();
        });
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
