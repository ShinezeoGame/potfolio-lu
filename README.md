# Portfolio — Ludivine Codoner

Site vitrine de Ludivine Codoner, chargée d'études en écologie : parcours universitaire, stages et compétences.

- **Licence Sciences de la Vie (SV)**, parcours Biologie des Organismes et des Populations (BOP), après le portail SVTE — Université de Lille, 2021–2024
- **Master Biodiversité, Écologie, Évolution (BEE)**, parcours Fonctionnement et Gestion des Écosystèmes Marins (FOGEM) — Université de Lille, 2024–2026
- **Stage M2** (6 mois, 2026) — diversité spécifique et diversité génétique des communautés végétales dunaires, UMR BIOGECO (INRAE – Université de Bordeaux)
- **Stage M1** (2 mois, 2025) — comportement d'agrégation de *Mytilus edulis*, LOG UMR 8187, Station Marine de Wimereux
- **Stage L3** (2 mois, 2024) — attraction des pollinisateurs par les traits floraux de *Silene dioica*, laboratoire EEP (UMR 8198)
- **Stages L2/L3** (2 × 1 mois) — inventaire faune/flore et Atlas de la Biodiversité Communale, Service Nature en Ville d'Armentières
- **Bénévolat international** — chantier « Green Beats » (Corps européen de solidarité, Solidarités Jeunesses), Penàguila, province d'Alicante (Espagne)
- **Projet en cours** — écriture d'un livre de statistiques appliquées (contexte, méthode adaptée, code R)

Le site est entièrement statique (HTML, CSS, JavaScript), sans dépendance ni étape de compilation. Il s'adapte aux mobiles et utilise une palette sobre : fond crème et beige, texte brun, un accent vert et quelques touches de rose (celui du silène dioïque).

## Le carnet de terrain

L'accueil est un carnet de terrain fermé, au nom de Ludivine Codoner, avec des post-it qui dépassent, une feuille volante et un ruban marque-page.

1. **Un clic** sur le carnet l'ouvre sur une double page : « Question scientifique : Comment comprendre ce qui nous entoure ? » et « Hypothèse : étudier l'environnement permet de mieux le protéger. », qui s'écrivent à la main. Les autocollants des passions (INPN, jeux de société, photo macro, écriture) se collent autour.
2. **Un clic sur la page, la molette ou la flèche bas** tourne la page. Sur grand écran, le carnet glisse à gauche et ne montre plus que la page de droite, vierge.
3. **Pendant la lecture**, le carnet suit le défilement et se remplit : chaque description qui arrive au centre fait écrire sa note (dates, diplôme, lieu) et le carnet tourne ses pages d'une partie à l'autre. À droite, chaque description a son album photo, qui dépasse du bord de l'écran.
4. Les post-it servent de sommaire. Tout en haut, la molette vers le haut ramène à la double page ; le lien « Refermer le carnet » du pied de page referme le carnet.

Sur tablette et téléphone, le carnet s'ouvre de la même façon puis s'efface : les descriptions s'enchaînent et les albums deviennent des rangées de photos à faire glisser. Un lien direct vers une partie (par exemple `#contact`) ouvre le site directement à cet endroit. Sans JavaScript, ou si les animations sont réduites dans le système, tout le contenu reste accessible.

Le site ne dépose aucun cookie, n'enregistre rien dans le navigateur et ne fait appel à aucun service tiers (polices hébergées sur le site, pas de mesure d'audience) : aucun bandeau de consentement n'est donc nécessaire. Si un outil de statistiques ou un contenu externe (vidéo, carte…) est ajouté un jour, il faudra mettre à jour `mentions-legales.html` et, selon l'outil, demander le consentement des visiteurs.

## Structure

```
index.html                      Contenu de la page : le carnet, puis toutes les parties
mentions-legales.html           Mentions légales, cookies et données personnelles
assets/css/style.css            Mise en forme (couleurs en haut du fichier)
assets/js/main.js               Carnet (ouverture, pages, écriture), menu mobile, copie de l'e-mail, visionneuse
assets/img/ludivine-codoner.jpg Photo de l'accueil
assets/img/favicon.svg          Icône de l'onglet
assets/img/og-image.jpg         Image d'aperçu pour les réseaux sociaux (1200 × 630 px)
assets/img/terrain/             Photos des stages et du bénévolat (grand format + miniatures « -min » de 440 px de haut)
assets/docs/                    Documents consultables (attestation, poster de L3)
assets/fonts/                   Polices Fraunces, Inter et Caveat, l'écriture manuscrite (licence SIL OFL 1.1)
```

## Modifier le contenu

Tout le texte se trouve dans `index.html`, partie par partie (`ACCUEIL : LE CARNET DE TERRAIN`, `PROFIL`, `FORMATION`, `STAGES DE RECHERCHE`, `TERRITOIRES & ENGAGEMENT`, `COMPÉTENCES`, `CONTACT`).

- **Descriptions** : chaque description est un bloc `<article class="step" data-step="…">` qui contient le texte (`step__text`) puis son album (`album`).
- **Notes du carnet** : elles sont dans l'accueil, sur les pages `data-page="1"` à `data-page="4"`. Chaque note `<li class="entry" data-entry="…">` correspond à la description qui porte le même nom dans `data-step` ; elle s'écrit quand cette description arrive au centre de l'écran. Gardez des notes courtes (trois lignes) pour qu'elles tiennent sur la page. Si une description change de page du carnet, mettez à jour son `data-page`.
- **Ajouter une photo à un album** : préparez une grande image et une miniature de 440 px de haut (voir ci-dessous), puis copiez un bloc `<li class="print …">` de l'album. La classe indique la forme de la photo : `print--wide` (paysage), `print--portrait` (portrait) ou `print--tall` (très allongée). Sur grand écran, au-delà de cinq photos, les suivantes sont rangées dans une pile « + N photos » qui ouvre la visionneuse.

  ```bash
  convert photo.jpg -auto-orient -strip -resize '1600x1600>' -quality 80 assets/img/terrain/nom.webp
  convert photo.jpg -auto-orient -strip -resize 'x440' -quality 76 assets/img/terrain/nom-min.webp
  ```

  L'option `-strip` retire les métadonnées (dont la position GPS) des photos.
- **Photo de profil** : remplacez `assets/img/ludivine-codoner.jpg` par une autre image au format portrait (3:4) en gardant le même nom.
- **Couleurs** : variables en haut de `assets/css/style.css` (`--bg`, `--bg-alt`, `--surface`, `--text`, `--primary`…).
- **Ajouter un CV téléchargeable** : déposez le fichier sous `assets/cv.pdf`, puis ajoutez dans la liste `contact__links` de `index.html` :

  ```html
  <li>
    <a class="contact__link" href="assets/cv.pdf" download>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/></svg>
      <span>Télécharger mon CV</span>
    </a>
  </li>
  ```

  Attention : le site est public, tout ce qui figure dans le CV (téléphone, adresse…) sera visible par tous.

## Aperçu en local

Lancez un petit serveur local (en ouvrant directement `index.html`, le navigateur bloque les polices) :

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

## Aperçu sur les réseaux sociaux

Lorsqu'un lien vers le site est partagé, LinkedIn, Facebook, WhatsApp ou Discord affichent `assets/img/og-image.jpg` : le carnet fermé entouré des autocollants des passions. Les balises `og:url` et `og:image` en haut de `index.html` contiennent l'adresse complète du site (`https://ludivinecodoner.github.io/`) : si l'adresse change, il faut les mettre à jour. Après une modification, l'outil [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) permet de rafraîchir l'aperçu mis en cache.

## Mise en ligne avec GitHub Pages

1. Sur GitHub, ouvrez **Settings → Pages**.
2. Dans **Build and deployment**, choisissez **Deploy from a branch**.
3. Sélectionnez la branche qui contient le site et le dossier `/ (root)`, puis enregistrez.
4. Après une ou deux minutes, le site est accessible à l'adresse `https://ludivinecodoner.github.io/` (le dépôt doit s'appeler exactement `ludivinecodoner.github.io`).

Chaque nouveau push sur cette branche met le site à jour automatiquement.
