# Portfolio — Ludivine Codoner

Site vitrine de Ludivine Codoner, chargée d'études en écologie : parcours universitaire, stages et compétences.

- **Licence SVTE**, parcours Biologie des Organismes et des Populations (BOP) — Université de Lille, 2021–2024
- **Master Biodiversité, Écologie, Évolution (BEE)**, parcours Fonctionnement et Gestion des Écosystèmes Marins (FOGEM) — Université de Lille, 2024–2026
- **Stage M2** (6 mois, 2026) — diversité spécifique et diversité génétique des communautés végétales dunaires, UMR BIOGECO (INRAE – Université de Bordeaux)
- **Stage M1** (2 mois, 2025) — comportement d'agrégation de *Mytilus edulis*, LOG UMR 8187, Station Marine de Wimereux
- **Stage L3** (2 mois, 2024) — attraction des pollinisateurs par les traits floraux de *Silene dioica*, laboratoire EEP (UMR 8198)
- **Stages L2/L3** (2 × 1 mois) — inventaire faune/flore et Atlas de la Biodiversité Communale, Service Nature en Ville d'Armentières
- **Bénévolat humanitaire** — Penàguila, province d'Alicante (Espagne)

Le site est entièrement statique (HTML, CSS, JavaScript), sans dépendance ni étape de compilation. Il s'adapte aux mobiles et propose un thème clair et un thème sombre.

## Structure

```
index.html                      Contenu de la page (toutes les sections)
assets/css/style.css            Mise en forme (couleurs en haut du fichier)
assets/js/main.js               Menu mobile, thème clair/sombre, animations
assets/img/ludivine-codoner.jpg Photo de l'accueil
assets/img/favicon.svg          Icône de l'onglet
```

## Modifier le contenu

Tout le texte se trouve dans `index.html`, section par section (`ACCUEIL`, `À PROPOS`, `PARCOURS`, `EXPÉRIENCES`, `COMPÉTENCES`, `CONTACT`).

- **Photo** : remplacez `assets/img/ludivine-codoner.jpg` par une autre image au format portrait (3:4) en gardant le même nom.
- **Couleurs** : variables en haut de `assets/css/style.css` (`--sea`, `--leaf`, `--campion`, `--ochre`…).
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

Ouvrez simplement `index.html` dans un navigateur, ou lancez un petit serveur :

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

## Mise en ligne avec GitHub Pages

1. Sur GitHub, ouvrez **Settings → Pages**.
2. Dans **Build and deployment**, choisissez **Deploy from a branch**.
3. Sélectionnez la branche qui contient le site et le dossier `/ (root)`, puis enregistrez.
4. Après une ou deux minutes, le site est accessible à l'adresse `https://shinezeogame.github.io/potfolio-lu/`.

Chaque nouveau push sur cette branche met le site à jour automatiquement.
