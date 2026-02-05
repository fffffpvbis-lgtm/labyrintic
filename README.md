# Labyrintic

Prototype d'application de labyrinthe (génération, gestion, exploration et résolution) pensé pour évoluer avec de nouveaux modules.

## Tester immédiatement (déjà exécuté)

Le projet a été lancé localement avec :

```bash
./run_local.sh
```

Puis accessible dans le navigateur à l'adresse `http://localhost:5001`.

## Lancer le logiciel vous-même

### Option recommandée

```bash
./run_local.sh
```

### Option alternative (sans script)

```bash
python -m http.server 5001
```

Ensuite :
1. Ouvrez votre navigateur.
2. Allez sur `http://localhost:5001`.
3. Testez les sections **Générateur**, **Fichiers**, **Exploration**, **Résolution**.

## Fonctionnalités actuelles

- Menu central enrichissable et identité graphique.
- Générateur avec paramètres, aperçu et sauvegarde locale.
- Gestionnaire de fichiers (stockage local du navigateur).
- Exploration en pseudo-vue à la première personne.
- Résolution animée avec BFS / A*.

## Prochaines étapes suggérées

- Ajouter d'autres algorithmes de génération et de résolution.
- Ajouter un format d'export/import (.maze).
- Construire une vraie vue 3D ou WebGL.
