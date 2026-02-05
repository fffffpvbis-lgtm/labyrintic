#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-5001}"

echo "Démarrage de Labyrintic sur http://localhost:${PORT}"
python -m http.server "${PORT}"
