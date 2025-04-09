const canvas = document.getElementById("pacmanCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 32;
const rows = 14;
const cols = 28;
let pacman = {
  x: 1,
  y: 1,
  direction: null,
  nextDirection: null,
  mouthOpen: true,
};
let score = 0;
let moveInterval = 200; // Intervalle de déplacement en millisecondes
let lastMoveTime = 0;
let ghosts = [
  { x: 1, y: 2, target: null, color: "red" },
  { x: 8, y: 3, target: null, color: "pink" },
  { x: 15, y: 7, target: null, color: "cyan" },
  { x: 4, y: 9, target: null, color: "orange" },
];
let ghostMoveInterval = 450; // Intervalle de déplacement des fantômes en millisecondes
let lastGhostMoveTime = 0;
let attractionDistance = 5; // Distance à partir de laquelle les fantômes sont attirés
let animationInterval = 200; // Intervalle de changement d'animation en millisecondes
let lastAnimationTime = 0;

const initialMap = [
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1,
  ],
  [
    1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0,
    1, 1, 1,
  ],
  [
    1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0,
    1, 0, 1,
  ],
  [
    1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0,
    1, 0, 1,
  ],
  [
    1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1,
  ],
  [
    1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1,
  ],
  [
    1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0,
    1, 1, 1,
  ],
  [
    1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0,
    1, 0, 1,
  ],
  [
    1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0,
    1, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0,
    0, 0, 1,
  ],
  [
    1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1,
  ],
];

let map = JSON.parse(JSON.stringify(initialMap));

document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowUp":
      pacman.direction = "up";
      break;
    case "ArrowDown":
      pacman.direction = "down";
      break;
    case "ArrowLeft":
      pacman.direction = "left";
      break;
    case "ArrowRight":
      pacman.direction = "right";
      break;
  }
});

function drawMap() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (map[row][col] === 1) {
        ctx.fillStyle = "blue";
        ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
      } else if (map[row][col] === 0) {
        ctx.fillStyle = "black";
        ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
          col * gridSize + gridSize / 2,
          row * gridSize + gridSize / 2,
          4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else if (map[row][col] === 2) {
        ctx.fillStyle = "black";
        ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
      }
    }
  }
}

function movePacman() {
  const now = Date.now();
  if (now - lastMoveTime > moveInterval) {
    // Update direction only if nextDirection is set and is different from current direction
    if (pacman.nextDirection) {
      pacman.direction = pacman.nextDirection;
      pacman.nextDirection = null; // Clear nextDirection
    }

    let moved = false;
    switch (pacman.direction) {
      case "up":
        if (map[pacman.y - 1][pacman.x] !== 1) {
          pacman.y -= 1;
          moved = true;
        }
        break;
      case "down":
        if (map[pacman.y + 1][pacman.x] !== 1) {
          pacman.y += 1;
          moved = true;
        }
        break;
      case "left":
        if (map[pacman.y][pacman.x - 1] !== 1) {
          pacman.x -= 1;
          moved = true;
        }
        break;
      case "right":
        if (map[pacman.y][pacman.x + 1] !== 1) {
          pacman.x += 1;
          moved = true;
        }
        break;
    }
    if (moved) lastMoveTime = now;
    console.log(`Pac-Man position: (${pacman.x}, ${pacman.y})`);
  }
}

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function bfs(start, target) {
  let queue = [start];
  let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  let parent = Array.from({ length: rows }, () => Array(cols).fill(null));

  visited[start.y][start.x] = true;

  while (queue.length > 0) {
    let { x, y } = queue.shift();

    if (x === target.x && y === target.y) {
      let path = [];
      while (parent[y][x]) {
        path.push({ x, y });
        ({ x, y } = parent[y][x]);
      }
      return path.reverse();
    }

    for (let { dx, dy } of [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
    ]) {
      let nx = x + dx,
        ny = y + dy;

      if (
        nx >= 0 &&
        nx < cols &&
        ny >= 0 &&
        ny < rows &&
        !visited[ny][nx] &&
        map[ny][nx] !== 1
      ) {
        visited[ny][nx] = true;
        parent[ny][nx] = { x, y };
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return null;
}

function chooseRandomTarget() {
  let targets = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (map[row][col] === 0) {
        targets.push({ x: col, y: row });
      }
    }
  }
  return targets[Math.floor(Math.random() * targets.length)];
}

function moveGhosts() {
  const now = Date.now();
  if (now - lastGhostMoveTime > ghostMoveInterval) {
    ghosts.forEach((ghost) => {
      let distance = getDistance(ghost.x, ghost.y, pacman.x, pacman.y);
      if (distance < attractionDistance) {
        // Move towards Pac-Man
        let path = bfs(
          { x: ghost.x, y: ghost.y },
          { x: pacman.x, y: pacman.y }
        );
        if (path && path.length > 0) {
          let { x, y } = path[0];
          ghost.x = x;
          ghost.y = y;
        }
      } else {
        // Move randomly towards a target
        if (
          !ghost.target ||
          (ghost.x === ghost.target.x && ghost.y === ghost.target.y)
        ) {
          ghost.target = chooseRandomTarget();
        }
        let path = bfs({ x: ghost.x, y: ghost.y }, ghost.target);
        if (path && path.length > 0) {
          let { x, y } = path[0];
          ghost.x = x;
          ghost.y = y;
        }
      }
    });
    lastGhostMoveTime = now;
  }
}

function drawPacman() {
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  let startAngle, endAngle;
  if (pacman.mouthOpen) {
    switch (pacman.direction) {
      case "up":
        startAngle = 1.75 * Math.PI;
        endAngle = 1.25 * Math.PI;
        break;
      case "down":
        startAngle = 0.75 * Math.PI;
        endAngle = 0.25 * Math.PI;
        break;
      case "left":
        startAngle = 1.25 * Math.PI;
        endAngle = 0.75 * Math.PI;
        break;
      case "right":
        startAngle = 0.25 * Math.PI;
        endAngle = 1.75 * Math.PI;
        break;
      default:
        startAngle = 0.25 * Math.PI;
        endAngle = 1.75 * Math.PI;
    }
  } else {
    startAngle = 0;
    endAngle = Math.PI * 2;
  }
  ctx.arc(
    pacman.x * gridSize + gridSize / 2,
    pacman.y * gridSize + gridSize / 2,
    gridSize / 2,
    startAngle,
    endAngle
  );
  ctx.lineTo(
    pacman.x * gridSize + gridSize / 2,
    pacman.y * gridSize + gridSize / 2
  );
  ctx.fill();
}

function animatePacman() {
  const now = Date.now();
  if (now - lastAnimationTime > animationInterval) {
    pacman.mouthOpen = !pacman.mouthOpen;
    lastAnimationTime = now;
  }
}

function drawGhosts() {
  ghosts.forEach((ghost) => {
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(
      ghost.x * gridSize + gridSize / 2,
      ghost.y * gridSize + gridSize / 2,
      gridSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

function checkCollision() {
  if (map[pacman.y][pacman.x] === 0) {
    map[pacman.y][pacman.x] = 2;
    score++;
    console.log("Score:", score);
  }
  ghosts.forEach((ghost) => {
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
      console.log("Collision! Game Over");
      // Restart the game or take appropriate action
      resetGame();
    }
  });
}

function resetGame() {
  pacman = {
    x: 1,
    y: 1,
    direction: null,
    nextDirection: null,
    mouthOpen: true,
  };
  ghosts = [
    { x: 1, y: 2, target: null, color: "red" },
    { x: 8, y: 3, target: null, color: "pink" },
    { x: 15, y: 7, target: null, color: "cyan" },
    { x: 4, y: 9, target: null, color: "orange" },
  ];
  score = 0;
  map = JSON.parse(JSON.stringify(initialMap));
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  movePacman();
  moveGhosts();
  checkCollision();
  drawPacman();
  drawGhosts();
  animatePacman();
  requestAnimationFrame(gameLoop);
}

gameLoop();
