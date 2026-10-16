(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const toTop = document.querySelector('.to-top');
  const lightbox = document.querySelector('.lightbox');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Saut immédiat, même si le défilement doux est activé dans la feuille de style
  const jumpTo = (top) => window.scrollTo({ top, left: 0, behavior: 'instant' });

  /* ---------- Menu mobile ---------- */

  const setMenu = (open) => {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };

  if (nav && navToggle) {
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
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
      if (label) label.textContent = 'Adresse copiée !';
      if (copyStatus) copyStatus.textContent = 'Adresse e-mail copiée dans le presse-papiers.';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        link.classList.remove('is-copied');
        if (label) label.innerHTML = initialLabel;
        if (copyStatus) copyStatus.textContent = '';
      }, 2500);
    });
  });

  /* ---------- Visionneuse plein écran ---------- */

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

    // La navigation reste dans l'album d'où la photo a été ouverte
    document.querySelectorAll('[data-gallery]').forEach((gallery) => {
      const links = [...gallery.querySelectorAll('a[data-caption]')];
      links.forEach((link, index) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          items = links;
          show(index);
          lightbox.showModal();
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
      // Les flèches restent dans la visionneuse, sans tourner les pages du livre en dessous
      e.stopPropagation();
      if (single()) return;
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    // Une seule photo (portrait) : pas de flèches
    new MutationObserver(() => {
      lightbox.classList.toggle('is-single', single());
    }).observe(lightbox, { attributes: true, attributeFilter: ['open'] });
  }

  const lightboxOpen = () => Boolean(lightbox && lightbox.open);

  /* ---------- Année du pied de page ---------- */

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Page sans carnet (mentions légales) ---------- */

  const carnetEl = document.querySelector('[data-carnet]');

  if (!carnetEl) {
    if (toTop) {
      toTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        const start = document.getElementById('contenu') || document.querySelector('.brand');
        if (start) start.focus({ preventScroll: true });
      });
    }
    return;
  }

  /* ==========================================================================
     Les livres : des feuillets recto verso qui tournent autour de la reliure
     ========================================================================== */

  const T_BOOK = reduceMotion ? 0 : 1150;
  const T_FLIP = reduceMotion ? 0 : 1100;
  const T_TOME_FLIP = reduceMotion ? 0 : 950;
  const T_SHIFT = reduceMotion ? 0 : 800;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Tant que la page charge, l'adresse attend : sinon le navigateur défilerait jusqu'à l'ancre
  let loaded = document.readyState === 'complete';
  let pendingUrl = null;
  const setUrl = (url) => {
    if (loaded) history.replaceState(null, '', url);
    else pendingUrl = url;
  };

  // Applique un changement sans transition (arrivée directe, redimensionnement)
  const instantly = (el, fn) => {
    el.classList.add('no-anim');
    fn();
    void el.offsetWidth;
    el.classList.remove('no-anim');
  };

  /* ---------- Pages souples : la feuille se plie depuis le coin du bas ----------
     Vue de dessus, une page qui tourne est une feuille pliée : la partie déjà soulevée
     est le reflet du verso par rapport à la ligne de pli. Le coin du bas mène le
     mouvement, en décrivant un arc, et la ligne de pli balaie la page jusqu'à la reliure. */

  const canFold = !reduceMotion && window.CSS && CSS.supports('clip-path', 'polygon(0 0, 1px 0, 0 1px)');
  const FOLD_LIFT = 0.3;   // hauteur à laquelle le coin se soulève, en largeur de page
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

  // Garde la partie d'un polygone où keep(point) >= 0
  const clipHalf = (pts, keep) => {
    const out = [];
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const va = keep(a);
      const vb = keep(b);
      if (va >= 0) out.push(a);
      if ((va >= 0) !== (vb >= 0)) {
        const t = va / (va - vb);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    });
    return out;
  };

  const polygon = (pts) => (pts.length > 2
    ? `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(', ')})`
    : 'polygon(0 0, 0 0, 0 0)');

  // Dégradé dont le bord (pos0) suit la ligne de pli ; direction (gx, gy) vers l'intérieur
  const shade = (W, H, gx, gy, sCenter, stops) => {
    const angle = Math.atan2(gx, -gy);
    const length = Math.abs(W * Math.sin(angle)) + Math.abs(H * Math.cos(angle));
    const pos0 = length / 2 - sCenter;
    const list = stops.map(([color, at]) => `${color} ${(pos0 + at).toFixed(1)}px`).join(', ');
    return `linear-gradient(${((angle * 180) / Math.PI).toFixed(2)}deg, ${list})`;
  };

  const drawFold = (fold, theta) => {
    const { W, H, front, back } = fold;
    // Ordre d'empilement : avant la mi-course, la première feuille partie reste au-dessus des suivantes ;
    // une fois passée de l'autre côté, elle se pose dessous (les suivantes atterrissent sur elle)
    const crossed = fold.target ? theta > Math.PI / 2 : theta < Math.PI / 2;
    const z = String(fold.base + (crossed ? fold.k : 2 * fold.len - fold.k));
    if (fold.leaf.style.zIndex !== z) fold.leaf.style.zIndex = z;
    const cx = W * Math.cos(theta);
    const cy = H - FOLD_LIFT * W * Math.sin(theta);
    let nx = W - cx;
    let ny = H - cy;
    const len = Math.hypot(nx, ny) || 1e-6;
    nx /= len;
    ny /= len;
    const mx = (W + cx) / 2;
    const my = (H + cy) / 2;
    // > 0 : partie de la feuille déjà repliée
    const side = (x, y) => (x - mx) * nx + (y - my) * ny;
    const rect = [[0, 0], [W, 0], [W, H], [0, H]];
    front.style.clipPath = polygon(clipHalf(rect, (p) => -side(p[0], p[1])));
    back.style.clipPath = polygon(clipHalf(rect, (p) => side(W - p[0], p[1])));
    // Le verso (u, y) s'affiche au reflet, par le pli, du point (W - u, y) de la feuille
    const nm = nx * mx + ny * my;
    back.style.transform = `matrix(${2 * nx * nx - 1}, ${2 * nx * ny}, ${-2 * nx * ny}, ${1 - 2 * ny * ny}, ${W * (1 - 2 * nx * nx) + 2 * nm * nx}, ${-2 * nx * ny * W + 2 * nm * ny})`;
    // Ombre au creux du pli, reflet plus clair vers le bord libre ; ombre portée sur la partie restée à plat
    const k = Math.sin(theta).toFixed(3);
    back.style.setProperty('--shade', shade(W, H, -nx, ny, side(W / 2, H / 2), [
      [`rgba(60, 40, 20, ${0.3 * k})`, 0],
      [`rgba(60, 40, 20, ${0.07 * k})`, W * 0.1],
      [`rgba(255, 255, 255, ${0.2 * k})`, W * 0.32],
      ['rgba(255, 255, 255, 0)', W * 0.62],
    ]));
    front.style.setProperty('--shade', shade(W, H, -nx, -ny, -side(W / 2, H / 2), [
      [`rgba(60, 40, 20, ${0.24 * k})`, 0],
      ['rgba(60, 40, 20, 0)', W * 0.14],
    ]));
  };

  class Book {
    constructor(el, flipMs) {
      this.el = el;
      this.flipMs = flipMs;
      this.leaves = [...el.children].filter((child) => child.classList.contains('leaf'));
      this.count = 0;
      this.depth();
    }

    // Les feuilles tournées s'empilent à gauche, les autres à droite
    depth() {
      const n = this.leaves.length;
      this.leaves.forEach((leaf, i) => {
        leaf.style.setProperty('--z', leaf.classList.contains('is-flipped') ? 10 + i : 10 + n - i);
      });
    }

    // Feuille en train de se plier : on la pose tout de suite là où elle allait
    settle(leaf) {
      const fold = leaf.fold;
      if (!fold) return;
      cancelAnimationFrame(fold.frame);
      leaf.fold = null;
      instantly(leaf, () => {
        leaf.classList.toggle('is-flipped', fold.target);
        leaf.classList.remove('is-folding');
        leaf.style.zIndex = '';
        [fold.front, fold.back].forEach((face) => {
          face.style.clipPath = '';
          face.style.transform = '';
          face.style.transformOrigin = '';
          face.style.removeProperty('--shade');
        });
        this.depth();
      });
    }

    // Une feuille de papier qui tourne en se pliant
    fold(leaf, target, delay, order) {
      const fold = {
        leaf,
        target,
        ...order,
        W: leaf.offsetWidth,
        H: leaf.offsetHeight,
        front: leaf.querySelector(':scope > .leaf__front'),
        back: leaf.querySelector(':scope > .leaf__back'),
        frame: 0,
      };
      leaf.fold = fold;
      const from = target ? 0.002 : Math.PI - 0.002;
      const to = target ? Math.PI - 0.002 : 0.002;
      instantly(leaf, () => {
        leaf.classList.add('is-folding');
        fold.back.style.transformOrigin = '0 0';
        drawFold(fold, from);
      });
      let start = null;
      const step = (now) => {
        if (leaf.fold !== fold) return;
        if (start === null) start = now + delay;
        const t = Math.min(1, Math.max(0, (now - start) / this.flipMs));
        drawFold(fold, from + (to - from) * easeInOut(t));
        if (t < 1) fold.frame = requestAnimationFrame(step);
        else this.settle(leaf);
      };
      fold.frame = requestAnimationFrame(step);
    }

    // Tourne les feuilles pour en laisser `count` à gauche ; renvoie la durée du mouvement
    flipTo(count, { instant = false, stagger = 140 } = {}) {
      const quick = instant || reduceMotion;
      if (quick) this.leaves.forEach((leaf) => this.settle(leaf));
      // Une feuille en train de se plier compte déjà comme tournée (ou non) ; si elle doit repartir, elle se pose d'abord
      const state = (leaf) => (leaf.fold ? leaf.fold.target : leaf.classList.contains('is-flipped'));
      const changing = this.leaves.filter((leaf, i) => state(leaf) !== i < count);
      changing.forEach((leaf) => this.settle(leaf));
      if (count < this.count) changing.reverse();
      // Plusieurs feuilles d'un coup : elles partent l'une après l'autre, en moins d'une demi-seconde
      const step = quick ? 0 : Math.min(stagger, 480 / Math.max(1, changing.length - 1));
      const n = this.leaves.length;
      changing.forEach((leaf, k) => {
        const delay = k * step;
        const target = !leaf.classList.contains('is-flipped');
        // Les couvertures sont rigides : elles pivotent ; les pages, souples, se plient
        if (!quick && canFold && !leaf.classList.contains('leaf--cover')) {
          this.fold(leaf, target, delay, { k, len: changing.length, base: 20 + 2 * n });
          return;
        }
        // Couverture qui s'ouvre : au-dessus de tout pendant la première moitié du mouvement
        if (!quick && target) instantly(leaf, () => leaf.style.setProperty('--z', '300'));
        leaf.style.transitionDelay = `${delay}ms, ${delay + this.flipMs / 2}ms`;
        leaf.style.setProperty('--turn-delay', `${delay}ms`);
        leaf.classList.toggle('is-flipped');
        if (!quick) {
          leaf.classList.add('is-turning');
          clearTimeout(leaf.turnTimer);
          leaf.turnTimer = setTimeout(() => leaf.classList.remove('is-turning'), delay + this.flipMs + 60);
        }
      });
      this.count = count;
      this.depth();
      return changing.length && !quick ? (changing.length - 1) * step + this.flipMs : 0;
    }

    front(i) {
      return this.leaves[i] ? this.leaves[i].querySelector(':scope > .leaf__front') : null;
    }

    back(i) {
      return this.leaves[i] ? this.leaves[i].querySelector(':scope > .leaf__back') : null;
    }

    // Seules les pages visibles restent accessibles au clavier et aux lecteurs d'écran
    showOnly(faces) {
      this.leaves.forEach((leaf) => {
        leaf.querySelectorAll(':scope > .leaf__face').forEach((face) => {
          face.inert = !faces.includes(face);
        });
      });
    }
  }

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
    // Le texte entier reste lisible par les lecteurs d'écran
    const spoken = document.createElement('span');
    spoken.className = 'sr-only';
    spoken.textContent = label;
    el.appendChild(spoken);
    visual.setAttribute('aria-hidden', 'true');
    el.appendChild(visual);
  };

  document.querySelectorAll('[data-write]').forEach(prepareWriting);

  // Écrit une suite d'éléments l'un après l'autre ; renvoie l'instant où l'écriture se termine
  const write = (elements, start = 0, instant = false) => {
    let t = start;
    elements.forEach((el) => {
      if (el.classList.contains('is-written')) return;
      if (instant || reduceMotion) {
        el.classList.add('is-written', 'is-instant');
        return;
      }
      el.querySelectorAll('.ch').forEach((ch, i) => {
        ch.style.animationDelay = `${t}ms`;
        // Un rythme un peu irrégulier, des pauses après la ponctuation et entre les mots
        t += 15 + ((i * 7) % 11);
        if (/[,.;:!?]/.test(ch.textContent)) t += 90;
        if (!ch.nextElementSibling) t += 24;
      });
      el.classList.add('is-written');
      t += 100;
    });
    return t;
  };

  /* ==========================================================================
     Mesures selon la taille de la fenêtre
     ========================================================================== */

  const carnet = new Book(carnetEl, T_FLIP);
  const openButton = carnetEl.querySelector('.book__open');
  const pileWrap = document.querySelector('.pile-wrap');
  const spines = [...document.querySelectorAll('.spine')];
  const deskMore = document.querySelector('.desk__more');
  const chapters = [...document.querySelectorAll('.chapter')];
  const skip = document.querySelector('.skip-link');
  const profil = document.getElementById('a-propos');
  const portrait = carnetEl.querySelector('.page__content--portrait');
  const turnButtons = [...carnetEl.querySelectorAll('[data-next]')];

  const reader = document.querySelector('[data-reader]');
  const readerBooks = reader ? [...reader.querySelectorAll('.reader__books [data-open]')] : [];
  const prevButton = reader ? reader.querySelector('.reader__prev') : null;
  const nextButton = reader ? reader.querySelector('.reader__next') : null;
  const counter = reader ? reader.querySelector('.reader__count') : null;

  const setPx = (el, name, value) => el.style.setProperty(name, `${Math.round(value * 100) / 100}px`);

  let narrow = false;
  let M = null;

  const layout = () => {
    const vw = root.clientWidth;
    const vh = window.innerHeight;
    // Petit écran, ou écran en hauteur (téléphone, tablette, moniteur vertical) : une page à la fois
    narrow = vw < 880 || vh < 520 || vh > vw * 1.3;
    root.dataset.mode = narrow ? 'single' : 'double';

    // Le carnet : la double page doit tenir à l'écran ; sur petit écran, une page à la fois
    const pw = narrow
      ? Math.max(200, Math.min(vw - 24, (vh - 110) / 1.42, 640))
      : Math.min(vw * 0.44, (vh - 120) / 1.42, 560);
    const ph = pw * 1.42;
    const u = pw / 100;
    setPx(root, '--pw', pw);
    setPx(root, '--ph', ph);
    setPx(root, '--u', u);

    const cy = vh / 2 - 16;
    // Position du bas de la reliure (origine des transformations) pour un livre centré en cy
    const at = (spineX, s) => ({ x: spineX, y: cy + (s * ph) / 2 - ph, s, rx: 0, rz: 0 });
    const sClosed = narrow ? Math.min(1, (vw - 48) / pw, (vh * 0.78) / ph) : 0.8;
    const sDouble = Math.min(1, (vw - 20) / (2 * pw));
    const views = {
      closed: at(vw / 2 - (sClosed * pw) / 2, sClosed),
      question: at(vw / 2, sDouble),
      portrait: at(vw / 2 + pw / 2, 1),
      profil: narrow ? at(vw / 2 - pw / 2, 1) : at(vw / 2, sDouble),
    };

    // Sur le bureau : le carnet ouvert, couché sur la pile de livres
    const headerH = header ? header.offsetHeight || 64 : 64;
    const top = headerH + 14;
    const bottom = vh - 62;
    // Le carnet est relevé (presque de face) ; sa tranche (5,6 u d'épaisseur) repose sur le livre du dessus
    const tilt = 28;
    const P = 1800;
    const piece = (w) => {
      const s = (0.9 * w) / (2 * pw);
      const sh = s * ph;
      const rad = (tilt * Math.PI) / 180;
      const lying = (sh * Math.cos(rad) * P) / (P + sh * Math.sin(rad));
      const edge = s * 5.6 * u * Math.cos(rad);
      return { s, lying, edge, h: lying + edge + 0.252 * w + 46 };
    };
    let pileW = Math.min(narrow ? vw - 40 : vw * 0.5, 760);
    let c = piece(pileW);
    if (c.h > bottom - top) {
      pileW *= (bottom - top) / c.h;
      c = piece(pileW);
    }
    const pileTop = top + (bottom - top - c.h) / 2 + c.lying + c.edge;
    views.desk = { x: vw / 2, y: pileTop - c.edge + 1 - ph, s: c.s, rx: tilt, rz: -2 };
    setPx(root, '--pile-w', pileW);
    setPx(root, '--pile-x', vw / 2 - pileW / 2);
    setPx(root, '--pile-y', pileTop);

    // Indications sous le carnet
    setPx(root, '--hint-closed-y', Math.min(vh - 44, cy + (sClosed * ph) / 2 + 2 * u * sClosed + 16));
    const openBottom = narrow ? cy + ph / 2 : cy + (sDouble * ph) / 2;
    setPx(root, '--hint-open-y', Math.min(vh - 44, openBottom + 18));

    // Les livres de la pile, ouverts dans la liseuse
    const topBar = 64;
    const bottomBar = narrow ? 70 : 54;
    const availH = vh - topBar - bottomBar;
    let tpw;
    let tph;
    if (narrow) {
      tpw = Math.max(220, Math.min(vw - 24, 680));
      tph = Math.min(availH, tpw * 1.9);
    } else {
      tpw = Math.min((vw - 160) / 2, availH / 1.3, 620);
      tph = tpw * 1.3;
    }
    const tfs = narrow
      ? Math.max(14, Math.min(18, tpw * 0.037))
      : Math.max(12.5, Math.min(17.5, tpw * 0.0285));
    setPx(root, '--tpw', tpw);
    setPx(root, '--tph', tph);
    setPx(root, '--tu', tpw / 100);
    setPx(root, '--tfs', tfs);
    setPx(root, '--ty', topBar + (availH - tph) / 2);

    M = { vw, vh, views };
  };

  /* ---------- Ajustement des pages : le texte se resserre un peu s'il manque de place ---------- */

  const fitPage = (content, min) => {
    content.style.setProperty('--fit', '1');
    content.classList.remove('is-overflow');
    let f = 1;
    while (content.scrollHeight > content.clientHeight + 1 && f > min) {
      f = Math.round((f - 0.03) * 100) / 100;
      content.style.setProperty('--fit', String(f));
    }
    content.classList.toggle('is-overflow', content.scrollHeight > content.clientHeight + 1);
  };

  // Planches photos : le nombre de colonnes dépend de la place, la dernière ligne est centrée
  const layoutGrid = (grid) => {
    const items = [...grid.children];
    const n = items.length;
    const w = grid.clientWidth;
    const h = grid.clientHeight;
    if (!n || !w || !h) return;
    let cols = 1;
    let best = Infinity;
    for (let c = 1; c <= Math.min(4, n); c += 1) {
      const r = Math.ceil(n / c);
      const ratio = w / c / (h / r);
      const score = Math.abs(Math.log(ratio / 1.15)) + (c * r - n) * 0.06;
      if (score < best) {
        best = score;
        cols = c;
      }
    }
    const rows = Math.ceil(n / cols);
    grid.style.setProperty('--cols2', String(cols * 2));
    grid.style.setProperty('--rows', String(rows));
    grid.toggleAttribute('data-dense', h / rows < 150);
    items.forEach((item) => { item.style.gridColumnStart = ''; });
    const last = n - (rows - 1) * cols;
    if (last < cols) items[n - last].style.gridColumnStart = String(cols - last + 1);
  };

  const fitAll = () => {
    document.querySelectorAll('.album-grid').forEach(layoutGrid);
    document.querySelectorAll('.tome .page__content').forEach((content) => {
      if (!content.classList.contains('page__content--photos')) fitPage(content, narrow ? 0.9 : 0.82);
    });
    if (profil) fitPage(profil, 0.84);
  };

  /* ==========================================================================
     Le carnet : fermé, question et hypothèse, (portrait,) profil, puis posé sur la pile
     ========================================================================== */

  const FLIPS = { closed: 0, question: 1, portrait: 2, profil: 2, desk: 2 };
  // Sur petit écran, le portrait et le profil sont deux étapes : une page à la fois
  const order = () => (narrow
    ? ['closed', 'question', 'portrait', 'profil', 'desk']
    : ['closed', 'question', 'profil', 'desk']);

  let scene = root.dataset.scene || 'closed';
  let busy = false;
  let busyTimer;
  let readerOpen = false;

  const lock = (ms) => {
    busy = true;
    clearTimeout(busyTimer);
    busyTimer = setTimeout(() => { busy = false; }, ms);
  };

  const placeCarnet = () => {
    const v = M.views[scene] || M.views.profil;
    setPx(carnetEl, '--bx', v.x);
    setPx(carnetEl, '--by', v.y);
    carnetEl.style.setProperty('--bs', String(Math.round(v.s * 10000) / 10000));
    carnetEl.style.setProperty('--brx', `${v.rx}deg`);
    carnetEl.style.setProperty('--brz', `${v.rz}deg`);
  };

  const carnetFaces = () => {
    switch (scene) {
      case 'closed': return [carnet.front(0)];
      case 'question': return [carnet.back(0), carnet.front(1)];
      case 'portrait': return [carnet.back(1)];
      case 'profil': return narrow ? [carnet.front(2)] : [carnet.back(1), carnet.front(2)];
      default: return [];
    }
  };

  // Ce qui n'est pas à l'écran sort du parcours au clavier et des lecteurs d'écran
  const syncInert = () => {
    const beforeDesk = scene !== 'desk';
    [header, toTop, ...chapters, pileWrap, deskMore].forEach((el) => {
      if (el) el.inert = readerOpen || beforeDesk;
    });
    if (skip) skip.inert = readerOpen;
    carnetEl.inert = readerOpen;
    if (reader) reader.inert = !readerOpen;
    carnet.showOnly(carnetFaces());
    if (openButton) {
      openButton.setAttribute('aria-label', scene === 'desk'
        ? 'Reprendre le carnet de terrain et relire le profil'
        : 'Ouvrir le carnet de terrain');
    }
  };

  const spread = {
    question: [...carnetEl.querySelectorAll('.leaf--cover [data-write]')],
    hypothesis: carnet.leaves[1] ? [...carnet.leaves[1].querySelectorAll('.leaf__front [data-write]')] : [],
  };

  const writeSpread = (instant) => {
    const end = write(spread.question, instant ? 0 : 750, instant);
    const final = write(spread.hypothesis, instant ? 0 : end + 250, instant);
    setTimeout(() => carnetEl.classList.add('is-drawn'), instant ? 0 : final);
  };

  const sceneUrl = (name) => {
    if (name === 'profil' || name === 'portrait') return '#a-propos';
    if (name === 'desk') return '#bibliotheque';
    return location.pathname + location.search;
  };

  const focusScene = () => {
    const targets = {
      closed: openButton,
      question: turnButtons[0],
      portrait,
      profil,
      desk: spines[0],
    };
    if (targets[scene]) targets[scene].focus({ preventScroll: true });
  };

  const setScene = (name, { instant = false, focus = true, url = true } = {}) => {
    if (!order().includes(name)) name = 'profil';
    if (!instant && (busy || name === scene)) return;
    const before = scene;
    if (name !== 'desk' && window.scrollY > 0) jumpTo(0);
    scene = name;
    root.dataset.scene = name;

    const go = () => {
      carnet.flipTo(FLIPS[name], { instant });
      placeCarnet();
      syncInert();
    };
    if (instant) {
      instantly(root, go);
    } else {
      go();
      lock(T_BOOK + 60);
    }
    if (FLIPS[name] >= 1) writeSpread(instant || before !== 'closed');
    if (url) setUrl(sceneUrl(name));
    if (focus) setTimeout(focusScene, instant ? 0 : T_BOOK * 0.6);
  };

  const forward = () => {
    const list = order();
    const i = list.indexOf(scene);
    if (i >= 0 && i < list.length - 1) setScene(list[i + 1]);
  };

  const backward = () => {
    const list = order();
    const i = list.indexOf(scene);
    if (i > 0) setScene(list[i - 1]);
  };

  const nudge = () => {
    if (carnetEl.classList.contains('is-nudged')) return;
    carnetEl.classList.add('is-nudged');
    setTimeout(() => carnetEl.classList.remove('is-nudged'), 700);
  };

  // Ouvrir le carnet, ou le reprendre une fois posé sur la pile
  if (openButton) {
    openButton.addEventListener('click', () => {
      if (scene === 'closed') setScene('question');
      else if (scene === 'desk') setScene('profil');
    });
  }

  // Un clic sur la double page tourne la page (sauf sur un lien ou une photo)
  carnetEl.addEventListener('click', (e) => {
    if (!['question', 'portrait', 'profil'].includes(scene)) return;
    if (e.target.closest('a, button')) return;
    if (String(window.getSelection ? window.getSelection() : '').trim()) return;
    forward();
  });

  turnButtons.forEach((button) => button.addEventListener('click', forward));

  /* ==========================================================================
     La liseuse : Formation, Expériences et Passions
     ========================================================================== */

  const tomes = new Map();
  document.querySelectorAll('[data-tome]').forEach((el) => {
    const book = new Book(el, T_TOME_FLIP);
    el.setAttribute('tabindex', '-1');
    tomes.set(el.id, { el, book, spreads: book.leaves.length - 1 });
  });
  const tomeOrder = [...tomes.keys()];

  // Numéros de page, de la page de titre à la dernière page écrite
  tomes.forEach((tome) => {
    let n = 0;
    tome.book.leaves.forEach((leaf, i) => {
      [i > 0 ? tome.book.front(i) : null, tome.book.back(i)].forEach((face) => {
        const page = face && face.querySelector(':scope > .page');
        if (!page || page.classList.contains('page--blank')) return;
        n += 1;
        page.dataset.num = String(n);
        const num = document.createElement('span');
        num.className = 'page__num';
        num.setAttribute('aria-hidden', 'true');
        num.textContent = String(n);
        page.appendChild(num);
      });
    });
  });

  // Le sommaire indique la page de chaque partie
  document.querySelectorAll('.toc a[data-goto]').forEach((link) => {
    const target = document.getElementById(link.dataset.goto);
    const page = target && target.closest('.page');
    if (page && page.dataset.num) link.dataset.page = page.dataset.num;
  });

  const tomeOf = (el) => {
    const host = el && el.closest('[data-tome]');
    return host ? tomes.get(host.id) : null;
  };

  // Double page (et côté, en page seule) où se trouve un élément
  const locate = (tome, el) => {
    const face = el && el !== tome.el ? el.closest('.leaf__face') : null;
    if (!face) return { spread: 1, side: 0 };
    const index = tome.book.leaves.indexOf(face.parentElement);
    const isFront = face.classList.contains('leaf__front');
    if (index <= 0 && isFront) return { spread: 1, side: 0 };
    const at = isFront ? index : index + 1;
    return { spread: Math.max(1, Math.min(tome.spreads, at)), side: isFront ? 1 : 0 };
  };

  let current = null;
  let view = { spread: 1, side: 0 };
  let opener = null;
  let savedScroll = 0;
  let readerBusy = false;
  let readerTimer;

  const readerLock = (ms) => {
    readerBusy = true;
    clearTimeout(readerTimer);
    readerTimer = setTimeout(() => { readerBusy = false; }, ms);
  };

  const nextTomeId = () => (current ? tomeOrder[tomeOrder.indexOf(current.el.id) + 1] : null);

  const updateControls = () => {
    if (!current || !counter) return;
    const { spread: s, side } = view;
    const atStart = s === 1 && (!narrow || side === 0);
    const atEnd = s === current.spreads && (!narrow || side === 1);
    const following = nextTomeId();
    const focused = document.activeElement;
    prevButton.disabled = atStart;
    nextButton.disabled = atEnd && !following;
    // Un bouton désactivé perd le focus : il passe à l'autre bouton
    if (focused === prevButton && prevButton.disabled) nextButton.focus();
    if (focused === nextButton && nextButton.disabled) prevButton.focus();
    nextButton.setAttribute('aria-label', atEnd && following
      ? `Livre suivant : ${tomes.get(following).el.getAttribute('aria-label').replace('Livre : ', '')}`
      : 'Page suivante');
    counter.innerHTML = narrow
      ? `<span class="sr-only">Page </span>${(s - 1) * 2 + side + 1} / ${current.spreads * 2}`
      : `<span class="sr-only">Double page </span>${s} / ${current.spreads}`;
    readerBooks.forEach((link) => link.setAttribute('aria-current', String(link.dataset.open === current.el.id)));
  };

  // Place le livre ouvert (reliure au centre, ou la page lue au centre) ; seules ses pages visibles restent accessibles
  const setView = (tome, s, side) => {
    view = { spread: s, side: narrow ? side : 0 };
    tome.el.style.setProperty('--shift', narrow ? (view.side === 0 ? '0.5' : '-0.5') : '0');
    tome.el.classList.remove('is-shut');
    const left = tome.book.back(s - 1);
    const right = tome.book.front(s);
    const shown = narrow ? [view.side === 0 ? left : right] : [left, right];
    tome.book.showOnly(shown.filter(Boolean));
    updateControls();
    // L'adresse suit la lecture : une année, un stage…
    const idOf = (face) => {
      const content = face && face.querySelector('.page__content[id]');
      return content ? content.id : null;
    };
    const id = s === 1 ? tome.el.id : shown.map(idOf).find(Boolean) || idOf(left) || idOf(right) || tome.el.id;
    setUrl(`#${id}`);
  };

  // Livre refermé et rangé, prêt à être rouvert depuis sa couverture
  const shut = (tome) => {
    instantly(tome.el, () => {
      tome.el.classList.remove('is-open');
      tome.el.classList.add('is-shut');
      tome.book.flipTo(0, { instant: true });
      tome.book.showOnly([tome.book.front(0)]);
      tome.el.style.setProperty('--shift', '-0.5');
      tome.el.style.setProperty('--ts', '0.9');
    });
  };

  const goTo = (s, side = 0) => {
    if (!current) return;
    const duration = current.book.flipTo(s, { stagger: 110 });
    setView(current, s, side);
    readerLock(Math.max(duration, T_SHIFT, 200) + 40);
  };

  const openTome = (id, { target = null, instant = false } = {}) => {
    const tome = tomes.get(id);
    if (!tome || readerBusy) return;
    const place = locate(tome, target);

    if (current === tome) {
      goTo(place.spread, place.side);
      return;
    }

    const previous = current;
    current = tome;
    if (!readerOpen) {
      opener = document.activeElement;
      savedScroll = window.scrollY;
    }
    readerOpen = true;
    root.classList.add('reader-open');
    if (scene !== 'desk') setScene('desk', { instant: true, focus: false, url: false });
    syncInert();

    if (previous) {
      previous.el.classList.remove('is-open');
      previous.el.style.setProperty('--ts', '0.92');
      setTimeout(() => { if (current !== previous) shut(previous); }, 360);
    }

    if (instant || reduceMotion) {
      instantly(tome.el, () => {
        tome.el.style.setProperty('--ts', '1');
        tome.el.classList.add('is-open');
        tome.book.flipTo(place.spread, { instant: true });
        setView(tome, place.spread, place.side);
      });
      tome.el.focus({ preventScroll: true });
      return;
    }

    // Le livre arrive fermé au milieu de l'écran, puis s'ouvre à la bonne page
    shut(tome);
    updateControls();
    readerLock(2000);
    setTimeout(() => {
      tome.el.classList.add('is-open');
      tome.el.style.setProperty('--ts', '1');
      tome.el.focus({ preventScroll: true });
      setTimeout(() => {
        if (current !== tome) return;
        readerBusy = false;
        goTo(place.spread, place.side);
      }, 420);
    }, previous ? 300 : 60);
  };

  const closeReader = () => {
    if (!readerOpen || !current) return;
    const tome = current;
    tome.el.classList.remove('is-open');
    tome.el.style.setProperty('--ts', '0.92');
    root.classList.remove('reader-open');
    readerOpen = false;
    current = null;
    readerBusy = false;
    syncInert();
    if (window.scrollY !== savedScroll) jumpTo(savedScroll);
    setTimeout(() => { if (current !== tome) shut(tome); }, 460);
    setUrl('#bibliotheque');
    const spine = spines.find((s) => s.dataset.open === tome.el.id);
    const back = opener && opener !== document.body && document.contains(opener) ? opener : spine;
    if (back) back.focus({ preventScroll: true });
    opener = null;
  };

  const next = () => {
    if (!current || readerBusy) return;
    const { spread: s, side } = view;
    if (narrow && side === 0) goTo(s, 1);
    else if (s < current.spreads) goTo(s + 1, 0);
    else if (nextTomeId()) openTome(nextTomeId());
  };

  const prev = () => {
    if (!current || readerBusy) return;
    const { spread: s, side } = view;
    if (narrow && side === 1) goTo(s, 0);
    else if (s > 1) goTo(s - 1, 1);
  };

  if (reader) {
    prevButton.addEventListener('click', prev);
    nextButton.addEventListener('click', next);
    reader.querySelectorAll('[data-close-reader]').forEach((el) => el.addEventListener('click', closeReader));

    // Molette : une page à la fois, sauf dans une page qui défile
    let hold = false;
    let quiet;
    let sum = 0;
    reader.addEventListener('wheel', (e) => {
      if (!readerOpen || lightboxOpen()) return;
      const dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const scroller = e.target.closest('.page__content.is-overflow');
      if (scroller) {
        const canDown = scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1;
        const canUp = scroller.scrollTop > 0;
        if ((dy > 0 && canDown) || (dy < 0 && canUp)) return;
      }
      e.preventDefault();
      // Tant que la molette (ou son élan) continue, une seule page tourne
      clearTimeout(quiet);
      quiet = setTimeout(() => { hold = false; sum = 0; }, 220);
      if (hold || readerBusy) return;
      sum += dy;
      if (Math.abs(sum) < 24) return;
      hold = true;
      if (sum > 0) next();
      else prev();
      sum = 0;
    }, { passive: false });

    // Glisser du doigt vers la gauche ou vers la droite
    let touch = null;
    reader.addEventListener('touchstart', (e) => {
      touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    reader.addEventListener('touchend', (e) => {
      if (!touch || !readerOpen) return;
      const dx = e.changedTouches[0].clientX - touch.x;
      const dy = e.changedTouches[0].clientY - touch.y;
      touch = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      if (dx < 0) next();
      else prev();
    }, { passive: true });
  }

  /* ==========================================================================
     Liens, adresse de la page et navigation
     ========================================================================== */

  // Ouvrir un livre : dos de la pile, menu, onglets de la liseuse
  document.querySelectorAll('[data-open]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openTome(link.dataset.open);
    });
  });

  // Sommaires et fiches : aller à une année, à un stage (éventuellement dans l'autre livre)
  document.querySelectorAll('[data-goto]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.getElementById(link.dataset.goto);
      const tome = tomeOf(target);
      if (!tome) return;
      e.preventDefault();
      openTome(tome.el.id, { target });
    });
  });

  // Profil : le carnet se relève, ouvert à cette page
  document.querySelectorAll('a[href="#a-propos"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (readerOpen) closeReader();
      setScene('profil');
    });
  });

  // Compétences, contact : le carnet est posé, puis la page défile jusqu'à la partie
  document.querySelectorAll('a[href="#competences"], a[href="#contact"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (readerOpen) closeReader();
      const wasDesk = scene === 'desk';
      if (!wasDesk) setScene('desk', { instant: true, focus: false });
      target.scrollIntoView({ behavior: wasDesk && !reduceMotion ? 'smooth' : 'instant' });
      setUrl(link.getAttribute('href'));
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  // « Aller au contenu » et flèche de retour : la pile de livres
  const toDesk = (e) => {
    e.preventDefault();
    if (readerOpen) closeReader();
    if (scene !== 'desk') {
      setScene('desk', { instant: true });
      return;
    }
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    setUrl('#bibliotheque');
    if (spines[0]) spines[0].focus({ preventScroll: true });
  };
  if (skip) skip.addEventListener('click', toDesk);
  if (toTop) toTop.addEventListener('click', toDesk);

  // « Refermer le carnet »
  document.querySelectorAll('[data-close-book]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (readerOpen) closeReader();
      jumpTo(0);
      setScene('closed');
    });
  });

  // Arrivée par une adresse (ou changement d'adresse) : la bonne étape, le bon livre, la bonne page
  const route = (hash, { instant = true } = {}) => {
    let id = '';
    try {
      id = decodeURIComponent((hash || '').replace(/^#/, ''));
    } catch (err) {
      id = '';
    }
    const target = id ? document.getElementById(id) : null;
    if (!target || id === 'accueil') {
      setScene('closed', { instant, focus: false, url: false });
      setUrl(location.pathname + location.search);
      jumpTo(0);
      return;
    }
    if (id === 'a-propos') {
      setScene('profil', { instant, focus: false });
      jumpTo(0);
      return;
    }
    setScene('desk', { instant, focus: false, url: false });
    const tome = tomeOf(target);
    if (tome) openTome(tome.el.id, { target, instant });
    else setUrl(`#${id}`);
    settleScroll(target);
  };

  // Le navigateur fait défiler la page jusqu'à l'ancre : seules les parties sous le bureau le demandent
  const settleScroll = (target) => {
    if (target && target.closest('.chapter') && scene === 'desk' && !readerOpen) target.scrollIntoView({ behavior: 'instant' });
    else jumpTo(0);
  };

  // L'adresse d'arrivée, mise de côté avant l'affichage (voir l'en-tête de index.html)
  const arrival = root.dataset.hash || location.hash;
  root.removeAttribute('data-hash');

  window.addEventListener('load', () => {
    let target = null;
    try {
      target = arrival.length > 1 ? document.getElementById(decodeURIComponent(arrival.slice(1))) : null;
    } catch (err) {
      target = null;
    }
    settleScroll(target);
    setTimeout(() => {
      loaded = true;
      if (pendingUrl !== null) history.replaceState(null, '', pendingUrl);
      pendingUrl = null;
    }, 0);
  });

  window.addEventListener('hashchange', () => {
    const hash = location.hash;
    if (readerOpen) closeReader();
    route(hash, { instant: true });
  });

  /* ---------- Molette, clavier et doigt sur le carnet ---------- */

  let hold = false;
  let quiet;
  let sum = 0;
  let upwards = 0;
  let topSince = Date.now();

  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) topSince = 0;
    else if (!topSince) topSince = Date.now();
  }, { passive: true });

  window.addEventListener('wheel', (e) => {
    if (readerOpen || lightboxOpen()) return;
    clearTimeout(quiet);
    quiet = setTimeout(() => { hold = false; sum = 0; upwards = 0; }, 220);

    if (scene === 'desk') {
      // Tout en haut du bureau, remonter encore relève le carnet
      if (e.deltaY < 0 && window.scrollY <= 0 && topSince && Date.now() - topSince > 400 && !busy && !hold) {
        upwards += -e.deltaY;
        if (upwards > 80) {
          hold = true;
          upwards = 0;
          setScene('profil');
        }
      }
      return;
    }

    if (hold || busy) return;
    sum += e.deltaY;
    if (Math.abs(sum) < 24) return;
    hold = true;
    if (sum > 0) forward();
    else if (scene === 'closed') nudge();
    else backward();
    sum = 0;
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || lightboxOpen()) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;

    if (readerOpen) {
      const keys = {
        Escape: closeReader,
        ArrowRight: next,
        PageDown: next,
        ArrowLeft: prev,
        PageUp: prev,
        Home: () => { if (!readerBusy && current) goTo(1, 0); },
        End: () => { if (!readerBusy && current) goTo(current.spreads, 1); },
      };
      if (keys[e.key]) {
        e.preventDefault();
        keys[e.key]();
      }
      return;
    }

    if (scene === 'desk') return;
    const onControl = e.target.closest && e.target.closest('a, button');
    const space = e.key === ' ' || e.key === 'Spacebar';
    if (['ArrowDown', 'PageDown', 'ArrowRight'].includes(e.key) || (space && !onControl)) {
      e.preventDefault();
      forward();
    } else if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) {
      e.preventDefault();
      backward();
    }
  });

  // Sur écran tactile : glisser vers le haut avance, vers le bas revient
  let touchY = null;
  window.addEventListener('touchstart', (e) => {
    touchY = readerOpen || scene === 'desk' ? null : e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (touchY === null || busy) return;
    const dy = e.changedTouches[0].clientY - touchY;
    touchY = null;
    if (dy < -45) forward();
    else if (dy > 45) backward();
  }, { passive: true });

  // Textes adaptés aux écrans tactiles
  if (window.matchMedia('(hover: none)').matches) {
    const hints = {
      '[data-hint-open]': 'Touchez le carnet pour l’ouvrir',
      '[data-hint-turn]': 'Touchez la page ou faites glisser vers le haut',
      '[data-hint-pile]': 'Touchez un livre pour l’ouvrir',
    };
    Object.entries(hints).forEach(([selector, text]) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = text;
    });
  }

  // La page de gauche est datée du jour de la visite
  const today = carnetEl.querySelector('[data-today]');
  if (today) {
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    today.textContent = `Lille, le ${date}`;
  }

  if (portrait) portrait.setAttribute('tabindex', '-1');
  if (profil) profil.setAttribute('tabindex', '-1');

  /* ---------- Redimensionnement ---------- */

  let resizeFrame;
  let fitTimer;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const wasNarrow = narrow;
      instantly(root, () => {
        layout();
        // Le portrait n'est une étape à part que sur petit écran
        if (!order().includes(scene)) {
          scene = 'profil';
          root.dataset.scene = scene;
        }
        carnet.flipTo(FLIPS[scene], { instant: true });
        placeCarnet();
        syncInert();
        if (current) setView(current, view.spread, wasNarrow !== narrow ? 0 : view.side);
      });
      clearTimeout(fitTimer);
      fitTimer = setTimeout(fitAll, 120);
    });
  });

  /* ---------- Départ ---------- */

  instantly(root, () => {
    layout();
    tomes.forEach(shut);
    syncInert();
  });
  fitAll();
  route(arrival, { instant: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  requestAnimationFrame(() => root.classList.add('is-ready'));
})();
