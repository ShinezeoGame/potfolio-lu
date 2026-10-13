# Portfolio — parcours en écologie

Site vitrine présentant mon parcours universitaire et mes stages de recherche :

- **Licence SVTE**, parcours Biologie des Organismes et des Populations (BOP) — Université de Lille
- **Master Biodiversité, Écologie, Évolution (BEE)**, spécialité Fonctionnement et Gestion des Écosystèmes Marins (FOGEM)
- **Stage L3** — attraction des pollinisateurs par les traits morphologiques de *Silene dioica* (laboratoire EEP)
- **Stage M1** — écologie comportementale des moules en période de reproduction
- **Stage M2** — corrélation entre diversité spécifique et diversité génétique des communautés végétales dunaires (Nouvelle-Aquitaine)

Le site est entièrement statique (HTML, CSS, JavaScript), sans dépendance ni étape de compilation. Il s'adapte aux mobiles et propose un thème clair et un thème sombre.

## Structure

```
index.html            Contenu de la page (toutes les sections)
assets/css/style.css  Mise en forme (couleurs en haut du fichier)
assets/js/main.js     Menu mobile, thème clair/sombre, animations
assets/img/           Favicon
assets/cv.pdf         Votre CV (à ajouter)
```

## À personnaliser

Les endroits à compléter sont signalés dans `index.html` par le commentaire `À PERSONNALISER` :

1. **Nom** : remplacez `Prénom Nom` (titre de l'onglet, en-tête, accueil, pied de page).
2. **Contact** : adresse e-mail (`votre.email@exemple.fr`, à modifier dans le `href="mailto:…"` et dans le texte affiché) et lien LinkedIn.
3. **CV** : déposez votre CV au format PDF sous `assets/cv.pdf`.
4. **Dates** : ajoutez les années de formation et la durée des stages.
5. **Stages M1 et M2** : ajoutez le nom des structures d'accueil.
6. **Compétences** : ajustez la liste (méthodes statistiques, logiciels comme R, langues) à votre expérience réelle.

Les couleurs se modifient en haut de `assets/css/style.css` (variables `--sea`, `--leaf`, `--campion`, etc.).

## Aperçu en local

Ouvrez simplement `index.html` dans un navigateur, ou lancez un petit serveur :

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

## Mise en ligne avec GitHub Pages

1. Sur GitHub, ouvrez **Settings → Pages**.
2. Dans **Build and deployment**, choisissez **Deploy from a branch**.
3. Sélectionnez la branche qui contient le site (par exemple `main`) et le dossier `/ (root)`, puis enregistrez.
4. Après une ou deux minutes, le site est accessible à l'adresse `https://<votre-compte>.github.io/potfolio-lu/`.
