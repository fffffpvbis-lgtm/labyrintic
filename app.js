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

NAV_BUTTONS.forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

document.querySelectorAll('[data-nav]').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.nav));
});

function defaultCell() {
  return { N: true, E: true, S: true, W: true, visited: false };
}

function createGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, defaultCell));
}

function carve(grid, x, y, direction) {
  const cell = grid[y][x];
  const nextX = x + direction.dx;
  const nextY = y + direction.dy;
  if (!grid[nextY] || !grid[nextY][nextX]) return;
  cell[direction.name] = false;
  grid[nextY][nextX][direction.opposite] = false;
}

function generateRecursiveBacktracker(rows, cols) {
  const grid = createGrid(rows, cols);
  const stack = [{ x: 0, y: 0 }];
  grid[0][0].visited = true;

  while (stack.length) {
    const current = stack[stack.length - 1];
    const neighbors = directions
      .map((dir) => ({
        dir,
        x: current.x + dir.dx,
        y: current.y + dir.dy,
      }))
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
      if (bias === 'vertical' && y > 0) {
        dir = directions[0];
      }
      if (bias === 'horizontal' && x < cols - 1) {
        dir = directions[1];
      }
      carve(grid, x, y, dir);
    }
  }
  return grid;
}

function generateMaze(config) {
  const { rows, cols, algorithm, bias } = config;
  switch (algorithm) {
    case 'binary-tree':
      return generateBinaryTree(rows, cols, bias);
    case 'recursive-backtracker':
      return generateRecursiveBacktracker(rows, cols);
    default:
      GENERATOR_NOTE.textContent = "Cet algorithme utilisera le backtracker pour l'instant.";
      return generateRecursiveBacktracker(rows, cols);
  }
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

  if (options.path) {
    ctx.strokeStyle = options.pathColor || '#37d0c8';
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

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function loadFiles() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function saveFiles(files) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  STAT_SAVED.textContent = String(files.length);
}

function updateFileList() {
  const files = loadFiles();
  FILES_LIST.innerHTML = '';
  if (!files.length) {
    FILES_LIST.innerHTML = '<p class="hint">Aucun labyrinthe enregistré.</p>';
    EXPLORER_SELECT.innerHTML = '<option value="">Aucun labyrinthe</option>';
    SOLVER_SELECT.innerHTML = '<option value="">Aucun labyrinthe</option>';
    STAT_SAVED.textContent = '0';
    return;
  }

  EXPLORER_SELECT.innerHTML = '<option value="">Choisir un labyrinthe</option>';
  SOLVER_SELECT.innerHTML = '<option value="">Choisir un labyrinthe</option>';

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

    const solverOption = document.createElement('option');
    solverOption.value = file.id;
    solverOption.textContent = file.name;
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
    </div>
  `;
  FILES_DETAIL.querySelector('[data-open="explorer"]').addEventListener('click', () => {
    setView('explorer');
    EXPLORER_SELECT.value = file.id;
  });
  FILES_DETAIL.querySelector('[data-open="solver"]').addEventListener('click', () => {
    setView('solver');
    SOLVER_SELECT.value = file.id;
  });
  FILES_DETAIL.querySelector('[data-open="delete"]').addEventListener('click', () => {
    deleteFile(file.id);
  });
}

function deleteFile(id) {
  const files = loadFiles();
  const next = files.filter((file) => file.id !== id);
  saveFiles(next);
  updateFileList();
  FILES_DETAIL.innerHTML = '<h3>Détails</h3><p>Labyrinthe supprimé.</p>';
}

function serializeMaze(config, grid) {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...config,
    grid,
  };
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
  GENERATOR_FORM.reset();
  GENERATOR_NOTE.textContent = 'Labyrinthe sauvegardé. Vous pouvez en générer un autre.';
});

GENERATOR_REFRESH.addEventListener('click', () => {
  const config = parseForm();
  renderGeneratorPreview(config);
});

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
  const grid = generateRecursiveBacktracker(12, 12);
  drawMaze(HOME_PREVIEW, grid, { stroke: '#37d0c8' });
}

function buildExplorerStats(file) {
  EXPLORER_STATS.innerHTML = `
    <p><strong>${file.name}</strong></p>
    <p>${file.rows}x${file.cols} • ${file.floors} étage(s)</p>
    <p>Algorithme: ${file.algorithm}</p>
  `;
}

function loadExplorerMaze() {
  const id = EXPLORER_SELECT.value;
  const file = loadFiles().find((entry) => entry.id === id);
  if (!file) {
    EXPLORER_STATUS.textContent = "Aucun labyrinthe chargé.";
    return;
  }
  buildExplorerStats(file);
  explorerState = {
    file,
    position: { x: 0, y: 0 },
    directionIndex: 1,
  };
  updateFirstPerson();
  EXPLORER_STATUS.textContent = 'Vous êtes prêt à explorer.';
}

function getCell(grid, x, y) {
  if (!grid[y] || !grid[y][x]) return null;
  return grid[y][x];
}

function canMove(grid, x, y, direction) {
  const cell = getCell(grid, x, y);
  if (!cell) return false;
  return !cell[direction.name];
}

function updateFirstPerson() {
  if (!explorerState) return;
  const { grid } = explorerState.file;
  const { position, directionIndex } = explorerState;
  const forward = directions[directionIndex];
  const left = directions[(directionIndex + 3) % 4];
  const right = directions[(directionIndex + 1) % 4];
  const frontWall = !canMove(grid, position.x, position.y, forward);
  const leftWall = !canMove(grid, position.x, position.y, left);
  const rightWall = !canMove(grid, position.x, position.y, right);

  FIRST_PERSON.querySelector('.wall-front').style.opacity = frontWall ? '1' : '0.1';
  FIRST_PERSON.querySelector('.wall-left').style.opacity = leftWall ? '1' : '0.1';
  FIRST_PERSON.querySelector('.wall-right').style.opacity = rightWall ? '1' : '0.1';
}

function moveExplorer(step) {
  if (!explorerState) return;
  const { grid } = explorerState.file;
  const { position, directionIndex } = explorerState;
  const dir = directions[(directionIndex + step.turn) % 4];
  const targetDir = step.forward ? dir : directions[(directionIndex + 2) % 4];
  if (step.forward !== undefined) {
    if (canMove(grid, position.x, position.y, targetDir)) {
      position.x += targetDir.dx;
      position.y += targetDir.dy;
    }
  }
  if (step.turn) {
    explorerState.directionIndex = (directionIndex + step.turn + 4) % 4;
  }
  updateFirstPerson();
}

EXPLORER_LOAD.addEventListener('click', loadExplorerMaze);

function bindExplorerControls() {
  document.getElementById('move-forward').addEventListener('click', () => moveExplorer({ forward: true, turn: 0 }));
  document.getElementById('move-back').addEventListener('click', () => moveExplorer({ forward: false, turn: 0 }));
  document.getElementById('turn-left').addEventListener('click', () => moveExplorer({ turn: -1 }));
  document.getElementById('turn-right').addEventListener('click', () => moveExplorer({ turn: 1 }));

  window.addEventListener('keydown', (event) => {
    if (!explorerState) return;
    switch (event.key) {
      case 'ArrowUp':
      case 'z':
      case 'Z':
        moveExplorer({ forward: true, turn: 0 });
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        moveExplorer({ forward: false, turn: 0 });
        break;
      case 'ArrowLeft':
      case 'q':
      case 'Q':
        moveExplorer({ turn: -1 });
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        moveExplorer({ turn: 1 });
        break;
      default:
        break;
    }
  });
}

function getNeighbors(grid, node) {
  const cell = grid[node.y][node.x];
  return directions
    .filter((dir) => !cell[dir.name])
    .map((dir) => ({ x: node.x + dir.dx, y: node.y + dir.dy }));
}

function solveMaze(grid, algorithm) {
  const start = { x: 0, y: 0 };
  const goal = { x: grid[0].length - 1, y: grid.length - 1 };
  const frontier = [start];
  const cameFrom = new Map();
  const cost = new Map();
  cost.set(key(start), 0);

  while (frontier.length) {
    const current = algorithm === 'astar' ? frontier.sort((a, b) => cost.get(key(a)) - cost.get(key(b))).shift() : frontier.shift();
    if (current.x === goal.x && current.y === goal.y) break;
    getNeighbors(grid, current).forEach((next) => {
      const nextKey = key(next);
      const newCost = cost.get(key(current)) + 1;
      if (!cost.has(nextKey) || newCost < cost.get(nextKey)) {
        cost.set(nextKey, newCost + (algorithm === 'astar' ? heuristic(next, goal) : 0));
        cameFrom.set(nextKey, current);
        frontier.push(next);
      }
    });
  }

  const path = [];
  let current = goal;
  while (current && !(current.x === start.x && current.y === start.y)) {
    path.push(current);
    current = cameFrom.get(key(current));
  }
  path.push(start);
  return path.reverse();
}

function key(node) {
  return `${node.x},${node.y}`;
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function animateSolver(path, grid) {
  let index = 0;
  clearInterval(solverAnimation);
  solverAnimation = setInterval(() => {
    const partial = path.slice(0, index + 1);
    drawMaze(SOLVER_CANVAS, grid, { path: partial, stroke: '#5b6171', pathColor: '#37d0c8' });
    index += 1;
    if (index >= path.length) {
      clearInterval(solverAnimation);
      SOLVER_STATUS.textContent = 'Résolution terminée.';
    }
  }, Number(SOLVER_SPEED.value));
}

SOLVER_START.addEventListener('click', () => {
  const id = SOLVER_SELECT.value;
  const file = loadFiles().find((entry) => entry.id === id);
  if (!file) {
    SOLVER_STATUS.textContent = 'Sélectionnez un labyrinthe.';
    return;
  }
  const algo = SOLVER_ALGORITHM.value;
  const supported = ['bfs', 'dfs', 'astar'];
  if (!supported.includes(algo)) {
    SOLVER_STATUS.textContent = 'Algorithme en préparation, BFS utilisé.';
  }
  const path = solveMaze(file.grid, algo === 'astar' ? 'astar' : 'bfs');
  SOLVER_STATUS.textContent = `Résolution en cours (${algo}).`;
  animateSolver(path, file.grid);
});

SOLVER_STOP.addEventListener('click', () => {
  clearInterval(solverAnimation);
  SOLVER_STATUS.textContent = 'Animation stoppée.';
});

function boot() {
  initAlgorithmSelect();
  initHomePreview();
  updateFileList();
  bindExplorerControls();
}

boot();
