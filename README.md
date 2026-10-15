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

## Le carnet de terrain et les livres

L'accueil est un carnet de terrain fermé, au nom de Ludivine Codoner, avec des post-it qui dépassent, une feuille volante et un ruban marque-page.

1. **Un clic** sur le carnet l'ouvre sur une double page : « Question scientifique : Comment comprendre ce qui nous entoure ? » et « Hypothèse : étudier l'environnement permet de mieux le protéger. », qui s'écrivent à la main.
2. **Un clic sur la page, la molette ou la flèche bas** tourne la page : le portrait (photo et chiffres clés en post-it) et le profil.
3. La page suivante, le carnet **se pose, ouvert à sa dernière page, sur une pile de trois livres** : Formation, Expériences et, en bas, le livre des Passions, plus fin. L'en-tête apparaît alors, avec le menu.
4. **Un clic sur un livre** l'ouvre par-dessus le bureau, sur sa page de titre et son sommaire :
   - **Formation** : une double page par année (de la L1 au M2), la description d'un côté et, de l'autre, les stages de l'année avec un lien vers le livre Expériences ;
   - **Expériences** : une double page par stage ou engagement, la description d'un côté et les photos de l'autre (l'ordre alterne d'une double page à l'autre) ;
   - **Passions** : les quatre autocollants (INPN, jeux de société, photo macro, écriture) avec leur description.

   On tourne les pages avec les flèches à côté du livre, les flèches du clavier, la molette ou en faisant glisser le doigt. Les onglets en haut passent d'un livre à l'autre ; la croix, la touche Échap ou un clic à côté du livre le referment. Une photo s'agrandit d'un clic.
5. **Sous le bureau**, la page défile vers les compétences, le projet de livre de statistiques et le contact, qui se termine par la carte postale. Tout en haut du bureau, la molette vers le haut relève le carnet ; le lien « Refermer le carnet » du pied de page le referme.

Sur téléphone et tablette en hauteur, le carnet puis les livres se lisent une page à la fois. Un lien direct ouvre le site au bon endroit : `#a-propos` (profil), `#bibliotheque` (la pile), `#formation`, `#experiences`, `#passions`, une année (`#annee-2023`), un stage (`#exp-m1`), `#competences` ou `#contact`. Sans JavaScript, ou si les animations sont réduites dans le système, tout le contenu reste accessible : sans JavaScript, les pages des carnets s'affichent l'une sous l'autre.

Le site ne dépose aucun cookie, n'enregistre rien dans le navigateur et ne fait appel à aucun service tiers (polices hébergées sur le site, pas de mesure d'audience) : aucun bandeau de consentement n'est donc nécessaire. Si un outil de statistiques ou un contenu externe (vidéo, carte…) est ajouté un jour, il faudra mettre à jour `mentions-legales.html` et, selon l'outil, demander le consentement des visiteurs.

## Structure

```
index.html                      Contenu de la page : le carnet, la pile, les trois livres, compétences et contact
mentions-legales.html           Mentions légales, cookies et données personnelles
assets/css/style.css            Mise en forme (couleurs en haut du fichier)
assets/js/main.js               Carnet et livres (pages qui tournent, écriture, liseuse), menu mobile, copie de l'e-mail, visionneuse
assets/img/ludivine-codoner.jpg Photo de l'accueil
assets/img/favicon.svg          Icône de l'onglet
assets/img/og-image.jpg         Image d'aperçu pour les réseaux sociaux (1200 × 630 px)
assets/img/terrain/             Photos des stages et du bénévolat (grand format + miniatures « -min » de 440 px de haut)
assets/docs/                    Documents consultables (attestation, poster de L3)
assets/fonts/                   Polices Fraunces et Inter (licence SIL OFL 1.1), et la police manuscrite de Ludivine
```

## Modifier le contenu

Tout le texte se trouve dans `index.html`, partie par partie (`LE BUREAU : CARNET DE TERRAIN ET PILE DE LIVRES`, `LES LIVRES`, `COMPÉTENCES`, `CONTACT`).

- **Les pages d'un livre** : un livre (`<article class="book tome" id="formation">`, `id="experiences"` ou `id="passions"`) est une suite de feuilles `<div class="leaf">`. Chaque feuille a un recto (`leaf__front`, une page de droite) et un verso (`leaf__back`, la page de gauche de la double page suivante) ; le verso de la couverture (`leaf--cover`) porte la page de titre. Le texte d'une page est dans un bloc `<div class="page__content">`. Pour modifier une description, il suffit de changer le texte dans ce bloc : la taille du texte s'ajuste toute seule si la page est un peu pleine. Pour ajouter une double page, ajoutez une feuille dont le recto et le verso suivent le même modèle, et une ligne dans le sommaire (`<ol class="toc">`) ; les numéros de page se calculent automatiquement.
- **Liens entre les livres** : un lien `<a href="#exp-m1" data-goto="exp-m1">` ouvre la page qui porte cet `id` (une année `annee-…`, un stage `exp-…`), même dans un autre livre.
- **Le carnet** : la question et l'hypothèse, le portrait (photo et chiffres clés) et le profil (`id="a-propos"`) sont au début de `index.html`.
- **Ajouter une photo à un album** : préparez une grande image et une miniature de 440 px de haut (voir ci-dessous), puis copiez un bloc `<li class="print">` de l'album (`<ul class="album-grid">`). La planche se réorganise toute seule (nombre de colonnes, dernière ligne centrée) ; au-delà d'une douzaine de photos, elles deviennent petites.

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

Lorsqu'un lien vers le site est partagé, LinkedIn, Facebook, WhatsApp ou Discord affichent `assets/img/og-image.jpg` : le carnet fermé à côté de la pile de livres. Les balises `og:url` et `og:image` en haut de `index.html` contiennent l'adresse complète du site (`https://ludivinecodoner.github.io/`) : si l'adresse change, il faut les mettre à jour. Après une modification, l'outil [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) permet de rafraîchir l'aperçu mis en cache.

## Mise en ligne avec GitHub Pages

1. Sur GitHub, ouvrez **Settings → Pages**.
2. Dans **Build and deployment**, choisissez **Deploy from a branch**.
3. Sélectionnez la branche qui contient le site et le dossier `/ (root)`, puis enregistrez.
4. Après une ou deux minutes, le site est accessible à l'adresse `https://ludivinecodoner.github.io/` (le dépôt doit s'appeler exactement `ludivinecodoner.github.io`).

Chaque nouveau push sur cette branche met le site à jour automatiquement.

## La police manuscrite

Toutes les écritures « à la main » du site (carnet, double page, post-it, années, légendes des photos, notes dans les livres) utilisent **Ludivine Manuscrite**, une police créée à partir de l'alphabet écrit par Ludivine (`assets/fonts/ludivine-manuscrite.woff2` et sa version grasse `ludivine-manuscrite-gras.woff2`).

Les lettres ont été vectorisées depuis une photo : chaque lettre a été suivie le long de son trait, lissée, puis retracée avec une épaisseur régulière. Elles ont ensuite été harmonisées pour une écriture plus régulière : même ligne de base, hauteurs et largeurs rapprochées, inclinaison redressée, jambages de même profondeur, bas du D reconstitué (il avait disparu avec la ligne du cahier), O refermé, creux du M marqué, hampe du t un peu allongée et pied du l raccourci pour la lisibilité. Les majuscules A, L et N gardent la forme cursive de l'écriture de Ludivine. Les chiffres, la ponctuation et les accents, absents de l'échantillon, ont été dessinés dans le même style ; ils pourront être remplacés à partir d'une photo de l'écriture de Ludivine (chiffres, ponctuation et lettres accentuées).

