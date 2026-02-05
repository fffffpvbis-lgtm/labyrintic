const VIEWS = Array.from(document.querySelectorAll('.view'));
const NAV_BUTTONS = Array.from(document.querySelectorAll('.nav-button'));
const HOME_PREVIEW = document.getElementById('home-preview');
const GENERATOR_FORM = document.getElementById('generator-form');
const GENERATOR_PREVIEW = document.getElementById('generator-preview');
const GENERATOR_NOTE = document.getElementById('generator-note');
const GENERATOR_REFRESH = document.getElementById('generator-refresh');
const FILES_LIST = document.getElementById('files-list');
const FILES_DETAIL = document.getElementById('files-detail');
const EXPLORER_SELECT = document.getElementById('explorer-select');
const EXPLORER_LOAD = document.getElementById('explorer-load');
const EXPLORER_STATS = document.getElementById('explorer-stats');
const EXPLORER_STATUS = document.getElementById('explorer-status');
const FIRST_PERSON = document.getElementById('first-person');
const SOLVER_SELECT = document.getElementById('solver-select');
const SOLVER_CANVAS = document.getElementById('solver-canvas');
const SOLVER_STATUS = document.getElementById('solver-status');
const SOLVER_START = document.getElementById('solver-start');
const SOLVER_STOP = document.getElementById('solver-stop');
const SOLVER_ALGORITHM = document.getElementById('solver-algorithm');
const SOLVER_SPEED = document.getElementById('solver-speed');
const STAT_SAVED = document.getElementById('stat-saved');
const DOCUMENTATION_LIST = document.getElementById('documentation-list');

const ALGORITHMS = [
  { id: 'recursive-backtracker', label: 'Recursive Backtracker' },
  { id: 'binary-tree', label: 'Binary Tree' },
  { id: 'sidewinder', label: 'Sidewinder' },
  { id: 'aldous-broder', label: 'Aldous-Broder' },
  { id: 'wilson', label: 'Wilson' },
  { id: 'eller', label: 'Eller' },
  { id: 'hunt-kill', label: 'Hunt & Kill' },
  { id: 'recursive-division', label: 'Recursive Division' },
  { id: 'kruskal', label: 'Kruskal' },
  { id: 'prim', label: 'Prim' },
  { id: 'growing-tree', label: 'Growing Tree' },
  { id: 'braid', label: 'Braid Maze' },
];

const DOCS = {
  generation: [
    ['Recursive Backtracker', 'Parcourt en profondeur et revient en arrière.', 'Rapide, produit des couloirs longs et organiques.'],
    ['Binary Tree', 'Creuse selon une règle locale simple (nord/est).', 'Ultra simple mais biaisé, utile pour comparaison historique.'],
    ['Sidewinder', 'Crée des runs horizontaux puis ouvre des montées.', 'Bon compromis vitesse/qualité, mais directionnel.'],
    ['Aldous-Broder', 'Marche aléatoire couvrant toutes les cellules.', 'Très ancien, exact mais souvent lent.'],
    ['Wilson', 'Boucles effacées avec random walk.', 'Uniforme, élégant mathématiquement, parfois coûteux.'],
    ['Recursive Division', 'Ajoute des murs récursivement.', 'Très visuel, crée un style “architectural”.'],
  ],
  solving: [
    ['BFS', 'Explore couche par couche; garantit le plus court chemin.', 'Fiable mais peut visiter beaucoup de cases.'],
    ['DFS', 'Va au fond puis remonte.', 'Simple et rapide à coder, pas optimal.'],
    ['A*', 'BFS guidé par une heuristique vers la sortie.', 'Souvent le meilleur rapport qualité/vitesse.'],
    ['Dijkstra', 'Expansion par coût minimal sans heuristique.', 'Très robuste mais plus lourd que A* ici.'],
    ['Greedy Best-First', 'Suit l’heuristique la plus prometteuse.', 'Peut sembler rapide, mais se trompe facilement.'],
    ['Wall Follower', 'Garde une main sur le mur.', 'Méthode ancienne, marche mal sur certains labyrinthes.'],
    ['Random Mouse', 'Choix aléatoire à chaque intersection.', 'Très inefficace mais pédagogique pour comparer.'],
    ['Depth-Limited DFS', 'DFS avec limite de profondeur puis reprise.', 'Approche historique peu efficace si limite mal réglée.'],
  ],
};

const STORAGE_KEY = 'labyrintic.files';
let activeMaze = null;
let explorerState = null;
let solverAnimation = null;

const directions = [
  { name: 'N', dx: 0, dy: -1, opposite: 'S' },
  { name: 'E', dx: 1, dy: 0, opposite: 'W' },
  { name: 'S', dx: 0, dy: 1, opposite: 'N' },
  { name: 'W', dx: -1, dy: 0, opposite: 'E' },
];

function setView(viewId) {
  VIEWS.forEach((view) => view.classList.toggle('active', view.id === `view-${viewId}`));
  NAV_BUTTONS.forEach((button) => button.classList.toggle('active', button.dataset.view === viewId));
}

NAV_BUTTONS.forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.nav)));

function defaultCell() {
  return { N: true, E: true, S: true, W: true, visited: false };
}

function createGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, defaultCell));
}

function carve(grid, x, y, direction) {
  const nextX = x + direction.dx;
  const nextY = y + direction.dy;
  if (!grid[nextY] || !grid[nextY][nextX]) return;
  grid[y][x][direction.name] = false;
  grid[nextY][nextX][direction.opposite] = false;
}

function generateRecursiveBacktracker(rows, cols) {
  const grid = createGrid(rows, cols);
  const stack = [{ x: 0, y: 0 }];
  grid[0][0].visited = true;

  while (stack.length) {
    const current = stack[stack.length - 1];
    const neighbors = directions
      .map((dir) => ({ dir, x: current.x + dir.dx, y: current.y + dir.dy }))
      .filter(({ x, y }) => grid[y] && grid[y][x] && !grid[y][x].visited);

    if (!neighbors.length) {
      stack.pop();
      continue;
    }

    const { dir, x, y } = neighbors[Math.floor(Math.random() * neighbors.length)];
    carve(grid, current.x, current.y, dir);
    grid[y][x].visited = true;
    stack.push({ x, y });
  }

  return grid;
}

function generateBinaryTree(rows, cols, bias = 'balanced') {
  const grid = createGrid(rows, cols);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const candidates = [];
      if (y > 0) candidates.push(directions[0]);
      if (x < cols - 1) candidates.push(directions[1]);
      if (!candidates.length) continue;
      let dir = candidates[Math.floor(Math.random() * candidates.length)];
      if (bias === 'vertical' && y > 0) dir = directions[0];
      if (bias === 'horizontal' && x < cols - 1) dir = directions[1];
      carve(grid, x, y, dir);
    }
  }
  return grid;
}

function clearVisited(grid) {
  return grid.map((row) => row.map(({ visited, ...cell }) => ({ ...cell })));
}

function generateMaze(config) {
  const { rows, cols, algorithm, bias } = config;
  let grid = generateRecursiveBacktracker(rows, cols);
  if (algorithm === 'binary-tree') grid = generateBinaryTree(rows, cols, bias);
  if (!['binary-tree', 'recursive-backtracker'].includes(algorithm)) {
    GENERATOR_NOTE.textContent = "Cet algorithme est listé pour comparaison; génération backtracker utilisée actuellement.";
  }
  return clearVisited(grid);
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawMaze(canvas, grid, options = {}) {
  const ctx = canvas.getContext('2d');
  const rows = grid.length;
  const cols = grid[0].length;
  const cellSize = Math.min(canvas.width / cols, canvas.height / rows);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0c0f14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = options.stroke || '#7c5cff';
  ctx.lineWidth = 2;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const cell = grid[y][x];
      const px = x * cellSize;
      const py = y * cellSize;
      if (cell.N) drawLine(ctx, px, py, px + cellSize, py);
      if (cell.E) drawLine(ctx, px + cellSize, py, px + cellSize, py + cellSize);
      if (cell.S) drawLine(ctx, px, py + cellSize, px + cellSize, py + cellSize);
      if (cell.W) drawLine(ctx, px, py, px, py + cellSize);
    }
  }

  if (options.trace?.length) {
    ctx.strokeStyle = '#f4b942';
    ctx.lineWidth = 2;
    ctx.beginPath();
    options.trace.forEach((node, index) => {
      const px = node.x * cellSize + cellSize / 2;
      const py = node.y * cellSize + cellSize / 2;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  if (options.path?.length) {
    ctx.strokeStyle = '#37d0c8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    options.path.forEach((node, index) => {
      const px = node.x * cellSize + cellSize / 2;
      const py = node.y * cellSize + cellSize / 2;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }
}

function loadFiles() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveFiles(files) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  STAT_SAVED.textContent = String(files.length);
}

function updateFileList() {
  const files = loadFiles();
  FILES_LIST.innerHTML = '';
  EXPLORER_SELECT.innerHTML = '<option value="">Choisir un labyrinthe</option>';
  SOLVER_SELECT.innerHTML = '<option value="">Choisir un labyrinthe</option>';

  if (!files.length) {
    FILES_LIST.innerHTML = '<p class="hint">Aucun labyrinthe enregistré.</p>';
    STAT_SAVED.textContent = '0';
    return;
  }

  files.forEach((file) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'file-item';
    item.innerHTML = `<strong>${file.name}</strong><span>${file.algorithm}</span><span>${file.rows}x${file.cols} • ${file.floors} étage(s)</span>`;
    item.addEventListener('click', () => showFileDetail(file, item));
    FILES_LIST.appendChild(item);

    const option = document.createElement('option');
    option.value = file.id;
    option.textContent = file.name;
    EXPLORER_SELECT.appendChild(option);

    const solverOption = option.cloneNode(true);
    SOLVER_SELECT.appendChild(solverOption);
  });

  STAT_SAVED.textContent = String(files.length);
}

function showFileDetail(file, item) {
  document.querySelectorAll('.file-item').forEach((el) => el.classList.remove('active'));
  item.classList.add('active');
  FILES_DETAIL.innerHTML = `
    <h3>Détails</h3>
    <p><strong>Nom :</strong> ${file.name}</p>
    <p><strong>Algorithme :</strong> ${file.algorithm}</p>
    <p><strong>Taille :</strong> ${file.rows} x ${file.cols}</p>
    <p><strong>Étages :</strong> ${file.floors}</p>
    <p><strong>Paramètres :</strong> densité ${file.density}% • biais ${file.bias}</p>
    <div class="card-footer">
      <button class="primary" data-open="explorer">Explorer</button>
      <button class="ghost" data-open="solver">Résoudre</button>
      <button class="ghost" data-open="delete">Supprimer</button>
    </div>`;

  FILES_DETAIL.querySelector('[data-open="explorer"]').addEventListener('click', () => {
    setView('explorer');
    EXPLORER_SELECT.value = file.id;
  });
  FILES_DETAIL.querySelector('[data-open="solver"]').addEventListener('click', () => {
    setView('solver');
    SOLVER_SELECT.value = file.id;
  });
  FILES_DETAIL.querySelector('[data-open="delete"]').addEventListener('click', () => deleteFile(file.id));
}

function deleteFile(id) {
  saveFiles(loadFiles().filter((file) => file.id !== id));
  updateFileList();
  FILES_DETAIL.innerHTML = '<h3>Détails</h3><p>Labyrinthe supprimé.</p>';
}

function serializeMaze(config, grid) {
  return { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...config, grid };
}

function parseForm() {
  const data = new FormData(GENERATOR_FORM);
  return {
    name: data.get('name'),
    algorithm: data.get('algorithm'),
    rows: Number(data.get('rows')),
    cols: Number(data.get('cols')),
    floors: Number(data.get('floors')),
    density: Number(data.get('density')),
    bias: data.get('bias'),
    loops: Number(data.get('loops')),
  };
}

function renderGeneratorPreview(config) {
  const grid = generateMaze(config);
  activeMaze = { grid, config };
  drawMaze(GENERATOR_PREVIEW, grid);
  GENERATOR_NOTE.textContent = `Aperçu ${config.rows}x${config.cols} • ${config.algorithm}`;
}

GENERATOR_FORM.addEventListener('submit', (event) => {
  event.preventDefault();
  const config = parseForm();
  renderGeneratorPreview(config);
  const files = loadFiles();
  files.unshift(serializeMaze(config, activeMaze.grid));
  saveFiles(files);
  updateFileList();
  GENERATOR_NOTE.textContent = 'Labyrinthe sauvegardé.';
});

GENERATOR_REFRESH.addEventListener('click', () => renderGeneratorPreview(parseForm()));

function initAlgorithmSelect() {
  const select = GENERATOR_FORM.querySelector('select[name="algorithm"]');
  ALGORITHMS.forEach((algo) => {
    const option = document.createElement('option');
    option.value = algo.id;
    option.textContent = algo.label;
    select.appendChild(option);
  });
  select.value = ALGORITHMS[0].id;
}

function initHomePreview() {
  drawMaze(HOME_PREVIEW, generateRecursiveBacktracker(12, 12), { stroke: '#37d0c8' });
}

function loadExplorerMaze() {
  const file = loadFiles().find((entry) => entry.id === EXPLORER_SELECT.value);
  if (!file) {
    EXPLORER_STATUS.textContent = 'Aucun labyrinthe chargé.';
    return;
  }

  EXPLORER_STATS.innerHTML = `<p><strong>${file.name}</strong></p><p>${file.rows}x${file.cols} • ${file.floors} étage(s)</p><p>Algorithme: ${file.algorithm}</p>`;
  explorerState = { file, position: { x: 0, y: 0 }, directionIndex: 1 };
  updateFirstPerson();
  EXPLORER_STATUS.textContent = 'Vous êtes prêt à explorer.';
}

function getCell(grid, x, y) {
  if (!grid[y] || !grid[y][x]) return null;
  return grid[y][x];
}

function canMove(grid, x, y, direction) {
  const cell = getCell(grid, x, y);
  return cell ? !cell[direction.name] : false;
}

function updateFirstPerson() {
  if (!explorerState) return;
  const { grid } = explorerState.file;
  const { position, directionIndex } = explorerState;
  const forward = directions[directionIndex];
  const left = directions[(directionIndex + 3) % 4];
  const right = directions[(directionIndex + 1) % 4];

  FIRST_PERSON.querySelector('.wall-front').style.opacity = canMove(grid, position.x, position.y, forward) ? '0.1' : '1';
  FIRST_PERSON.querySelector('.wall-left').style.opacity = canMove(grid, position.x, position.y, left) ? '0.1' : '1';
  FIRST_PERSON.querySelector('.wall-right').style.opacity = canMove(grid, position.x, position.y, right) ? '0.1' : '1';
}

function moveExplorer(step) {
  if (!explorerState) return;
  const { grid } = explorerState.file;
  const { position, directionIndex } = explorerState;

  if (step.turn) explorerState.directionIndex = (directionIndex + step.turn + 4) % 4;
  if (step.forward !== undefined) {
    const dir = step.forward ? directions[explorerState.directionIndex] : directions[(explorerState.directionIndex + 2) % 4];
    if (canMove(grid, position.x, position.y, dir)) {
      position.x += dir.dx;
      position.y += dir.dy;
    }
  }
  updateFirstPerson();
}

EXPLORER_LOAD.addEventListener('click', loadExplorerMaze);

function bindExplorerControls() {
  document.getElementById('move-forward').addEventListener('click', () => moveExplorer({ forward: true }));
  document.getElementById('move-back').addEventListener('click', () => moveExplorer({ forward: false }));
  document.getElementById('turn-left').addEventListener('click', () => moveExplorer({ turn: -1 }));
  document.getElementById('turn-right').addEventListener('click', () => moveExplorer({ turn: 1 }));

  window.addEventListener('keydown', (event) => {
    if (!explorerState) return;
    if (['ArrowUp', 'z', 'Z'].includes(event.key)) moveExplorer({ forward: true });
    if (['ArrowDown', 's', 'S'].includes(event.key)) moveExplorer({ forward: false });
    if (['ArrowLeft', 'q', 'Q'].includes(event.key)) moveExplorer({ turn: -1 });
    if (['ArrowRight', 'd', 'D'].includes(event.key)) moveExplorer({ turn: 1 });
  });
}

function key(node) {
  return `${node.x},${node.y}`;
}

function getNeighbors(grid, node) {
  return directions
    .filter((dir) => !grid[node.y][node.x][dir.name])
    .map((dir) => ({ x: node.x + dir.dx, y: node.y + dir.dy, dir }));
}

function reconstructPath(cameFrom, start, goal) {
  const path = [];
  let current = goal;
  while (current && key(current) !== key(start)) {
    path.push(current);
    current = cameFrom.get(key(current));
  }
  if (!current) return [];
  path.push(start);
  return path.reverse();
}

function solveWithQueue(grid, strategy) {
  const start = { x: 0, y: 0 };
  const goal = { x: grid[0].length - 1, y: grid.length - 1 };
  const frontier = [start];
  const cameFrom = new Map();
  const cost = new Map([[key(start), 0]]);
  const trace = [];

  while (frontier.length) {
    let current;
    if (strategy === 'astar') {
      frontier.sort((a, b) => cost.get(key(a)) - cost.get(key(b)));
      current = frontier.shift();
    } else if (strategy === 'greedy') {
      frontier.sort((a, b) => heuristic(a, goal) - heuristic(b, goal));
      current = frontier.shift();
    } else if (strategy === 'dfs') {
      current = frontier.pop();
    } else {
      current = frontier.shift();
    }

    trace.push(current);
    if (key(current) === key(goal)) break;

    getNeighbors(grid, current).forEach((next) => {
      const nextKey = key(next);
      const newCost = (cost.get(key(current)) ?? 0) + 1;
      if (!cost.has(nextKey) || newCost < cost.get(nextKey)) {
        cameFrom.set(nextKey, current);
        const heuristicCost = strategy === 'astar' ? heuristic(next, goal) : 0;
        cost.set(nextKey, newCost + heuristicCost);
        frontier.push({ x: next.x, y: next.y });
      }
    });
  }

  return { trace, path: reconstructPath(cameFrom, start, goal) };
}

function solveWallFollower(grid, maxSteps = 8000) {
  const goal = { x: grid[0].length - 1, y: grid.length - 1 };
  const pos = { x: 0, y: 0 };
  let dirIndex = 1;
  const trace = [{ ...pos }];

  for (let i = 0; i < maxSteps; i += 1) {
    if (pos.x === goal.x && pos.y === goal.y) return { trace, path: trace };
    const right = directions[(dirIndex + 1) % 4];
    const front = directions[dirIndex];
    const left = directions[(dirIndex + 3) % 4];

    if (canMove(grid, pos.x, pos.y, right)) {
      dirIndex = (dirIndex + 1) % 4;
    } else if (!canMove(grid, pos.x, pos.y, front) && canMove(grid, pos.x, pos.y, left)) {
      dirIndex = (dirIndex + 3) % 4;
    } else if (!canMove(grid, pos.x, pos.y, front)) {
      dirIndex = (dirIndex + 2) % 4;
    }

    const move = directions[dirIndex];
    if (!canMove(grid, pos.x, pos.y, move)) continue;
    pos.x += move.dx;
    pos.y += move.dy;
    trace.push({ ...pos });
  }

  return { trace, path: [] };
}

function solveRandomWalk(grid, maxSteps = 14000) {
  const goal = { x: grid[0].length - 1, y: grid.length - 1 };
  const current = { x: 0, y: 0 };
  const trace = [{ ...current }];

  for (let i = 0; i < maxSteps; i += 1) {
    if (current.x === goal.x && current.y === goal.y) return { trace, path: trace };
    const neighbors = getNeighbors(grid, current);
    if (!neighbors.length) break;
    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    current.x = next.x;
    current.y = next.y;
    trace.push({ ...current });
  }
  return { trace, path: [] };
}

function solveDepthLimited(grid, depthLimit = 28) {
  const start = { x: 0, y: 0 };
  const goal = { x: grid[0].length - 1, y: grid.length - 1 };
  const trace = [];

  function dfs(node, depth, seen) {
    trace.push({ ...node });
    if (key(node) === key(goal)) return [node];
    if (depth >= depthLimit) return null;

    const nextSeen = new Set(seen);
    nextSeen.add(key(node));
    for (const next of getNeighbors(grid, node)) {
      if (nextSeen.has(key(next))) continue;
      const sub = dfs({ x: next.x, y: next.y }, depth + 1, nextSeen);
      if (sub) return [node, ...sub];
    }
    return null;
  }

  const path = dfs(start, 0, new Set()) || [];
  return { trace, path };
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function solveMaze(grid, algorithm) {
  if (algorithm === 'wallfollower') return solveWallFollower(grid);
  if (algorithm === 'random-walk') return solveRandomWalk(grid);
  if (algorithm === 'depth-limited') return solveDepthLimited(grid);
  if (algorithm === 'dijkstra') return solveWithQueue(grid, 'dijkstra');
  if (algorithm === 'greedy') return solveWithQueue(grid, 'greedy');
  if (algorithm === 'dfs') return solveWithQueue(grid, 'dfs');
  if (algorithm === 'astar') return solveWithQueue(grid, 'astar');
  return solveWithQueue(grid, 'bfs');
}

function animateSolver(result, grid) {
  clearInterval(solverAnimation);
  let index = 1;
  const trace = result.trace.length ? result.trace : result.path;

  solverAnimation = setInterval(() => {
    const partialTrace = trace.slice(0, index);
    const done = index >= trace.length;
    drawMaze(SOLVER_CANVAS, grid, {
      stroke: '#5b6171',
      trace: partialTrace,
      path: done ? result.path : [],
    });
    index += 1;

    if (done) {
      clearInterval(solverAnimation);
      SOLVER_STATUS.textContent = result.path.length ? 'Résolution terminée.' : 'Résolution terminée sans chemin complet (algorithme inefficace ou limite atteinte).';
    }
  }, Number(SOLVER_SPEED.value));
}

SOLVER_START.addEventListener('click', () => {
  const file = loadFiles().find((entry) => entry.id === SOLVER_SELECT.value);
  if (!file) {
    SOLVER_STATUS.textContent = 'Sélectionnez un labyrinthe.';
    return;
  }
  const algo = SOLVER_ALGORITHM.value;
  const result = solveMaze(file.grid, algo);
  SOLVER_STATUS.textContent = `Résolution en cours (${algo}).`;
  animateSolver(result, file.grid);
});

SOLVER_STOP.addEventListener('click', () => {
  clearInterval(solverAnimation);
  SOLVER_STATUS.textContent = 'Animation stoppée.';
});

function renderDocumentation() {
  DOCUMENTATION_LIST.innerHTML = '';

  const sections = [
    { title: 'Algorithmes de génération', entries: DOCS.generation },
    { title: 'Algorithmes de résolution', entries: DOCS.solving },
  ];

  sections.forEach((section) => {
    const block = document.createElement('article');
    block.className = 'card';
    block.innerHTML = `<h3>${section.title}</h3>`;

    section.entries.forEach(([name, detail, simple]) => {
      const item = document.createElement('div');
      item.className = 'doc-item';
      item.innerHTML = `
        <p><strong>${name}</strong></p>
        <p><span class="doc-label">Détaillé :</span> ${detail}</p>
        <p><span class="doc-label">Vulgarisé :</span> ${simple}</p>`;
      block.appendChild(item);
    });

    DOCUMENTATION_LIST.appendChild(block);
  });
}

function boot() {
  initAlgorithmSelect();
  initHomePreview();
  updateFileList();
  bindExplorerControls();
  renderDocumentation();
}

boot();
