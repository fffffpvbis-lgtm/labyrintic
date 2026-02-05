# Labyrintic

Prototype d'application de labyrinthe (génération, gestion, exploration et résolution) pensé pour évoluer avec de nouveaux modules.

## Lancer le logiciel

```bash
./run_local.sh
```

Puis ouvrez `http://localhost:5001`.

Option alternative :

```bash
python -m http.server 5001
```

## Fonctionnalités actuelles

- Menu central : Accueil, Générateur, Fichiers, Exploration, Résolution, Documentation.
- Générateur avec paramètres, aperçu et sauvegarde locale.
- Gestionnaire de fichiers (stockage local du navigateur).
- Exploration en pseudo-vue à la première personne.
- Solveurs variés : BFS, DFS, A*, Dijkstra, Greedy, Wall Follower, Random Mouse, DFS limitée.
- Section Documentation : chaque algorithme est expliqué en mode détaillé + vulgarisé.

## Test manuel conseillé

1. Créer un labyrinthe dans **Générateur** puis l'enregistrer.
2. Ouvrir **Résolution** et comparer un solveur efficace (A*) et un solveur inefficace (Random Mouse).
3. Ouvrir **Documentation** pour lire les explications algorithmiques.
