(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const toTop = document.querySelector('.to-top');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---------- En-tête et flèche de retour au défilement ---------- */

  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    // La flèche apparaît une fois le début du parcours dépassé
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      // Le focus revient au début du parcours pour la navigation au clavier
      const start = document.getElementById('contenu') || document.querySelector('.brand');
      if (start) start.focus({ preventScroll: true });
    });
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
      if (label) label.textContent = 'Adresse copiée !';
      if (copyStatus) copyStatus.textContent = 'Adresse e-mail copiée dans le presse-papiers.';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        link.classList.remove('is-copied');
        if (label) label.innerHTML = initialLabel;
        if (copyStatus) copyStatus.textContent = '';
      }, 2500);
    });
  });

  /* ---------- Albums : la molette fait défiler les photos sur petit écran ---------- */

  document.querySelectorAll('.album__prints').forEach((track) => {
    track.addEventListener('wheel', (e) => {
      // Sur grand écran, l'album est une colonne qui défile avec la page
      if (track.scrollWidth - track.clientWidth <= 1) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? track.clientWidth : 1;
      const atStart = track.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY * unit;
    }, { passive: false });
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

    const open = (links, index) => {
      items = links;
      show(index);
      lightbox.showModal();
    };

    // La navigation reste dans l'album d'où la photo a été ouverte
    document.querySelectorAll('[data-gallery]').forEach((gallery) => {
      const links = [...gallery.querySelectorAll('a[data-caption]')];
      links.forEach((link, index) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          open(links, index);
        });
      });
    });

    const single = () => items.length < 2;
    lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
    lightbox.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1));
    lightbox.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('click', (e) => {
      // Un clic en dehors de la photo et des boutons ferme la visionneuse
      if (e.target === lightbox || e.target.classList.contains('lightbox__figure')) lightbox.close();
    });
    lightbox.addEventListener('keydown', (e) => {
      if (single()) return;
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    // Une seule photo (portrait) : pas de flèches
    new MutationObserver(() => {
      lightbox.classList.toggle('is-single', single());
    }).observe(lightbox, { attributes: true, attributeFilter: ['open'] });
  }

  /* ---------- Année du pied de page ---------- */

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ==========================================================================
     Le carnet de terrain
     ========================================================================== */

  const book = document.querySelector('.book');
  if (!book) return;

  const main = document.getElementById('contenu');
  const leaves = [...book.querySelectorAll('.leaf')];
  const tabs = [...book.querySelectorAll('.tab')];
  const steps = [...document.querySelectorAll('[data-step]')];
  const turnButton = book.querySelector('.turn');
  const openButton = book.querySelector('.book__open');
  const navLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
  const deskQuery = window.matchMedia('(min-width: 1180px) and (min-height: 600px)');
  const T_BOOK = reduceMotion ? 0 : 1150;
  const T_FLIP = reduceMotion ? 0 : 1100;

  let desk = deskQuery.matches;
  let state = root.dataset.book;
  let busy = false;
  let activeStep = null;
  let flippedCount = 0;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const setState = (next) => {
    state = next;
    root.dataset.book = next;
  };

  // Les transitions sont coupées le temps d'un changement immédiat
  const withoutAnimation = (fn) => {
    root.classList.add('no-anim');
    fn();
    // Lecture forcée de la mise en page pour appliquer les positions sans transition
    void book.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('no-anim')));
  };

  const lock = (ms) => {
    busy = true;
    setTimeout(() => { busy = false; }, ms);
  };

  /* ---------- Écriture à la main ---------- */

  // Chaque lettre devient un petit élément qui apparaîtra à son tour
  const prepareWriting = (el) => {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const visual = document.createElement('span');
    const walk = (source, target) => {
      source.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              target.appendChild(document.createTextNode(' '));
              return;
            }
            const word = document.createElement('span');
            word.className = 'w';
            for (const letter of part) {
              const ch = document.createElement('span');
              ch.className = 'ch';
              ch.textContent = letter;
              word.appendChild(ch);
            }
            target.appendChild(word);
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const copy = node.cloneNode(false);
          target.appendChild(copy);
          walk(node, copy);
        }
      });
    };
    walk(el, visual);
    el.textContent = '';
    // Hors des zones déjà masquées, le texte entier reste lisible par les lecteurs d'écran
    if (!el.closest('[aria-hidden="true"]')) {
      const spoken = document.createElement('span');
      spoken.className = 'sr-only';
      spoken.textContent = label;
      el.appendChild(spoken);
      visual.setAttribute('aria-hidden', 'true');
    }
    el.appendChild(visual);
  };

  document.querySelectorAll('[data-write]').forEach(prepareWriting);

  // Écrit une suite d'éléments l'un après l'autre ; renvoie l'instant où l'écriture se termine
  const write = (elements, start = 0, instant = false, pace = 1) => {
    let t = start;
    elements.forEach((el) => {
      if (el.classList.contains('is-written')) return;
      if (instant || reduceMotion) {
        el.classList.add('is-written', 'is-instant');
        return;
      }
      el.querySelectorAll('.ch').forEach((ch, i) => {
        ch.style.animationDelay = `${t}ms`;
        const letter = ch.textContent;
        // Un rythme un peu irrégulier, des pauses après la ponctuation et entre les mots
        t += (15 + ((i * 7) % 11)) * pace;
        if (/[,.;:!?]/.test(letter)) t += 90 * pace;
        if (!ch.nextElementSibling) t += 24 * pace;
      });
      el.classList.add('is-written');
      t += 100;
    });
    return t;
  };

  /* ---------- Feuillets qui tournent ---------- */

  // Les feuilles tournées s'empilent à gauche, les autres à droite
  const updateDepth = () => {
    const n = leaves.length;
    leaves.forEach((leaf, i) => {
      leaf.style.setProperty('--z', leaf.classList.contains('is-flipped') ? 10 + i : 10 + n - i);
    });
  };

  const flipTo = (count, { instant = false } = {}) => {
    const changing = leaves.filter((leaf, i) => leaf.classList.contains('is-flipped') !== i < count);
    if (count < flippedCount) changing.reverse();
    changing.forEach((leaf, n) => {
      const delay = instant || reduceMotion ? 0 : n * 140;
      leaf.style.transitionDelay = `${delay}ms, ${delay + T_FLIP / 2}ms`;
      leaf.style.setProperty('--turn-delay', `${delay}ms`);
      leaf.classList.toggle('is-flipped');
      if (!instant && !reduceMotion) {
        leaf.classList.add('is-turning');
        setTimeout(() => leaf.classList.remove('is-turning'), delay + T_FLIP + 60);
      }
    });
    flippedCount = count;
    updateDepth();
    return changing.length;
  };

  /* ---------- Mesures selon la taille de la fenêtre ---------- */

  const setVar = (name, value) => root.style.setProperty(name, `${value}px`);


  const layout = () => {
    const vw = root.clientWidth;
    const vh = window.innerHeight;
    desk = deskQuery.matches;

    // Largeur d'une page : la double page doit tenir à l'écran
    let pw = desk
      ? Math.min(vw * 0.36, (vh - 190) / 1.42, 560)
      : Math.min((vw - 28) / 2, (vh - (vh < 600 ? 70 : 300)) / 1.42, 420);
    pw = Math.max(pw, 110);
    const ph = pw * 1.42;
    const u = pw / 100;

    // Fermé, le carnet est un peu agrandi sur petit écran
    const sClosed = desk ? 1 : Math.max(1, Math.min(1.75, (vw - 90) / pw, (vh * 0.64) / ph));
    const xClosed = vw / 2 - (pw * sClosed) / 2;
    const yClosed = (vh - ph * sClosed) / 2 - (desk ? 24 : 28);
    const xOpen = vw / 2;
    const yOpen = (vh - ph) / 2 - (desk ? 24 : 0);

    // Pendant la lecture : la page de droite seule, à gauche de l'écran
    let sRead = 1;
    let xRead = -2.6 * pw;
    let yRead = yOpen;
    let column = 0;
    if (desk) {
      const pr = Math.min(vw * 0.26, (vh - 96) / 1.42, 470);
      sRead = pr / pw;
      xRead = 26;
      yRead = (vh - ph * sRead) / 2;
      column = xRead + pr + 40 * u * sRead + 44;
    }

    setVar('--pw', pw);
    setVar('--ph', ph);
    setVar('--u', u);
    setVar('--x-closed', xClosed);
    setVar('--y-closed', yClosed);
    root.style.setProperty('--s-closed', sClosed);
    setVar('--x-open', xOpen);
    setVar('--y-open', yOpen);
    setVar('--x-read', xRead);
    setVar('--y-read', yRead);
    root.style.setProperty('--s-read', sRead);
    setVar('--nb-col', column);
    setVar('--sf-x', xOpen - pw);
    setVar('--sf-y', yOpen);
    setVar('--sf-w', pw * 2);
    setVar('--sf-h', ph);
    setVar('--hint-closed-y', Math.min(vh - 44, yClosed + (ph + 10 * u) * sClosed + 14));
    // Petite double page : les autocollants se rangent au-dessus et au-dessous, s'il y a la place
    const outside = !desk && (vh - ph) / 2 >= 190;
    root.classList.toggle('stickers-out', outside);
    setVar('--hint-open-y', desk || !outside ? Math.min(vh - 48, yOpen + ph + 26) : vh - 56);

  };

  /* ---------- Étapes du parcours ---------- */

  const entries = [...book.querySelectorAll('[data-entry]')];
  const entryOf = (step) => book.querySelector(`[data-entry="${step.dataset.step}"]`);

  const pageCount = (step) => {
    if (state === 'closed') return 0;
    if (state === 'open') return 1;
    // Couverture et hypothèse, plus les pages déjà remplies
    return desk ? Number(step.dataset.page) + 1 : 2;
  };

  const setActive = (step, { instant = false } = {}) => {
    activeStep = step;
    const index = steps.indexOf(step);
    const page = Number(step.dataset.page);
    const turned = flipTo(pageCount(step), { instant });

    // Les notes s'écrivent jusqu'à l'étape lue ; celles des pages précédentes sont déjà là
    let t = instant ? 0 : turned ? T_FLIP * 0.6 : 150;
    const fresh = new Set();
    steps.slice(0, index + 1).forEach((s) => {
      const entry = entryOf(s);
      if (!entry || entry.classList.contains('is-written')) return;
      const leaf = entry.closest('.leaf');
      const parts = [...entry.querySelectorAll('[data-write]')];
      const title = leaf.querySelector('.page__title');
      if (title && !title.classList.contains('is-written')) parts.unshift(title);
      const now = instant || Number(s.dataset.page) < page || !desk;
      entry.style.setProperty('--entry-delay', `${now ? 0 : t}ms`);
      t = write(parts, t, now);
      entry.classList.add('is-written');
      fresh.add(entry);
    });

    const current = entryOf(step);
    if (current && !fresh.has(current)) current.style.setProperty('--entry-delay', '0ms');
    entries.forEach((entry) => entry.classList.toggle('is-current', entry === current));

    const chapter = step.closest('.chapter');
    const id = chapter ? chapter.id : '';
    tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.chapter === id));
    navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
  };

  const stepObserver = new IntersectionObserver((list) => {
    if (state !== 'reading') return;
    list.forEach((item) => {
      if (item.isIntersecting && item.target !== activeStep) setActive(item.target);
    });
  }, { rootMargin: '-48% 0px -50% 0px' });
  steps.forEach((step) => stepObserver.observe(step));

  /* ---------- Apparition des descriptions et des photos ---------- */

  document.querySelectorAll('.print').forEach((print) => print.classList.add('reveal'));
  const revealed = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((list) => {
    list.forEach((item) => {
      if (item.isIntersecting && state === 'reading') {
        item.target.classList.add('is-visible');
        revealObserver.unobserve(item.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  const watchReveal = () => revealed.forEach((el) => {
    if (!el.classList.contains('is-visible')) {
      revealObserver.unobserve(el);
      revealObserver.observe(el);
    }
  });

  /* ---------- Ouvrir, lire, refermer ---------- */

  const spread = {
    question: [...book.querySelectorAll('.leaf--cover [data-write]')],
    hypothesis: [...book.querySelectorAll('.leaf--hypo [data-write]')],
    passions: [...document.querySelectorAll('.stickers [data-write]')],
  };

  const writeSpread = (instant = false) => {
    const end = write(spread.question, instant ? 0 : 750, instant);
    const final = write(spread.hypothesis, instant ? 0 : end + 250, instant);
    // Les phrases des passions s'écrivent à côté de leur autocollant, juste après qu'il est collé
    spread.passions.forEach((el, i) => write([el], instant ? 0 : 1500 + i * 200, instant, 0.45));
    setTimeout(() => book.classList.add('is-drawn'), instant ? 0 : final);
  };

  const openBook = () => {
    if (state !== 'closed' || busy) return;
    lock(T_BOOK * 0.8);
    setState('open');
    flipTo(1);
    writeSpread();
    setTimeout(() => turnButton.focus({ preventScroll: true }), T_BOOK * 0.6);
  };

  // Le carnet glisse à gauche (ou s'efface sur petit écran) et le parcours apparaît
  const readBook = ({ instant = false, target = null, force = false } = {}) => {
    if ((state === 'reading' && !force) || (busy && !instant)) return;
    const go = () => {
      setState('reading');
      writeSpread(true);
      // Arrivée directe : on se place d'abord sur la partie demandée
      if (target && instant) target.scrollIntoView();
      setActive(target ? target.closest('[data-step]') || target.querySelector('[data-step]') || steps[0] : steps[0], { instant });
      watchReveal();
    };

    if (instant) {
      withoutAnimation(go);
    } else {
      window.scrollTo(0, 0);
      lock(T_BOOK + 80);
      root.classList.add('is-turning');
      setTimeout(() => root.classList.remove('is-turning'), T_BOOK);
      go();
    }
    topSince = Date.now() + T_BOOK;
    if (target && !instant) {
      setTimeout(() => target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), T_BOOK);
    }
    // Le contenu devient visible au milieu de la transition : il peut alors recevoir le focus
    setTimeout(() => main.focus({ preventScroll: true }), instant ? 0 : 650);
  };

  const backToSpread = () => {
    if (state !== 'reading' || busy) return;
    lock(T_BOOK + 80);
    window.scrollTo(0, 0);
    setState('open');
    flipTo(1);
    entries.forEach((entry) => entry.classList.remove('is-current'));
    tabs.forEach((tab) => tab.classList.remove('is-active'));
    turnButton.focus({ preventScroll: true });
  };

  const closeBook = () => {
    if (busy) return;
    lock(T_BOOK + 80);
    window.scrollTo(0, 0);
    setState('closed');
    flipTo(0);
    openButton.focus({ preventScroll: true });
  };

  openButton.addEventListener('click', openBook);

  // Un clic n'importe où sur la double page tourne la page
  book.addEventListener('click', (e) => {
    if (state === 'open' && !e.target.closest('.tab')) readBook();
  });

  // Les post-it mènent directement à une partie, même carnet fermé
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const target = document.querySelector(tab.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (state === 'reading') {
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        history.replaceState(null, '', tab.getAttribute('href'));
      } else {
        readBook({ target, instant: state === 'closed' });
      }
    });
  });

  // « Aller au contenu » : on passe directement à la lecture
  const skip = document.querySelector('.skip-link');
  if (skip) {
    skip.addEventListener('click', (e) => {
      if (state === 'reading') return;
      e.preventDefault();
      readBook({ instant: true });
    });
  }

  document.querySelectorAll('[data-close-book]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeBook();
    });
  });

  // Molette : tourner la page, et revenir à la double page tout en haut (grand écran)
  let topSince = 0;
  let upwards = 0;
  let upwardsTimer;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) topSince = 0;
    else if (!topSince) topSince = Date.now();
    // Tout en bas de la page, la dernière partie est celle qu'on lit
    const last = steps[steps.length - 1];
    const bottom = window.scrollY + window.innerHeight >= root.scrollHeight - 4;
    if (state === 'reading' && bottom && activeStep !== last) setActive(last);
  }, { passive: true });

  const nudge = () => {
    if (book.classList.contains('is-nudged')) return;
    book.classList.add('is-nudged');
    setTimeout(() => book.classList.remove('is-nudged'), 700);
  };

  window.addEventListener('wheel', (e) => {
    if (busy || (lightbox && lightbox.open)) return;
    if (state === 'closed' && Math.abs(e.deltaY) > 2) nudge();
    else if (state === 'open' && e.deltaY > 2) readBook();
    else if (state === 'reading' && desk && e.deltaY < 0 && window.scrollY <= 0 && topSince && Date.now() - topSince > 400) {
      upwards += -e.deltaY;
      clearTimeout(upwardsTimer);
      upwardsTimer = setTimeout(() => { upwards = 0; }, 300);
      if (upwards > 60) {
        upwards = 0;
        backToSpread();
      }
    }
  }, { passive: true });

  // Au clavier : flèche bas, page suivante ou espace
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const forward = ['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key);
    if (!forward || !e.target.closest || e.target.closest('input, textarea, select')) return;
    // Sur un lien ou un bouton, la barre d'espace garde son rôle habituel
    if ((e.key === ' ' || e.key === 'Spacebar') && e.target.closest('a, button')) return;
    if (state === 'closed') {
      e.preventDefault();
      openBook();
    } else if (state === 'open') {
      e.preventDefault();
      readBook();
    }
  });

  // Sur écran tactile : glisser vers le haut tourne la page
  let touchY = null;
  window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (touchY === null || state !== 'open') return;
    if (e.touches[0].clientY - touchY < -40) {
      touchY = null;
      readBook();
    }
  }, { passive: true });
  window.addEventListener('touchend', () => { touchY = null; }, { passive: true });

  // Textes adaptés aux écrans tactiles
  if (window.matchMedia('(hover: none)').matches) {
    const hintOpen = document.querySelector('[data-hint-open]');
    const hintTurn = document.querySelector('[data-hint-turn]');
    if (hintOpen) hintOpen.textContent = 'Touchez le carnet pour l’ouvrir';
    if (hintTurn) hintTurn.textContent = 'Touchez la page ou faites glisser vers le haut';
  }

  // La page de gauche est datée du jour de la visite
  const today = book.querySelector('[data-today]');
  if (today) {
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    today.textContent = `Lille, le ${date}`;
  }

  /* ---------- Redimensionnement ---------- */

  let resizeFrame;
  const onResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const wasDesk = desk;
      withoutAnimation(() => {
        layout();
        if (activeStep && state === 'reading') flipTo(pageCount(activeStep), { instant: true });
      });
      // En changeant de disposition, on garde sous les yeux la partie qu'on lisait
      if (wasDesk !== desk && activeStep && state === 'reading') activeStep.scrollIntoView();
    });
  };
  window.addEventListener('resize', onResize);


  /* ---------- Départ ---------- */

  // Première mise en place sans transition : le carnet apparaît directement fermé, à sa place
  withoutAnimation(() => {
    layout();
    updateDepth();
  });

  if (state === 'reading') {
    // Arrivée par un lien vers une section : carnet déjà ouvert à la bonne page
    let target = null;
    try {
      target = document.querySelector(decodeURIComponent(location.hash));
    } catch (err) {
      target = null;
    }
    readBook({ instant: true, target, force: true });
  }

  requestAnimationFrame(() => root.classList.add('is-ready'));
})();
