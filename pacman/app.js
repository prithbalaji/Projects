const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const messageEl = document.getElementById("message");

const tile = 20;
const cols = 28;
const rows = 31;
const baseMap = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "     #.##### ## #####.#     ",
  "     #.##          ##.#     ",
  "     #.## ###--### ##.#     ",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "     #.## ######## ##.#     ",
  "     #.##          ##.#     ",
  "     #.## ######## ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#.####.#####.##.#####.####.#",
  "#o..##................##..o#",
  "###.##.##.########.##.##.###",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################"
];

let map = baseMap.slice();
let player, ghosts, pellets, score, lives, running, mouth;
let level = 1;
let invulnerable = 0;
let frightened = 0;
let eatenGhostScore = 200;
let levelElapsed = 0;
let levelTransition = false;
let transitionTimer = null;

function getLevelSetting(levelNumber) {
  const labels = ["Easy", "Normal", "Hard", "Expert", "Nightmare"];
  return {
    speed: Math.min(0.095, 0.045 + (levelNumber - 1) * 0.006),
    count: Math.min(8, 3 + Math.floor((levelNumber - 1) / 2) + (levelNumber >= 3 ? 1 : 0)),
    label: labels[Math.min(levelNumber - 1, labels.length - 1)]
  };
}

function buildMap(levelNumber) {
  const mapCopy = baseMap.map(row => row.split(""));
  const barrierPatterns = [
    [[5, 6], [5, 21], [25, 6], [25, 21]],
    [[8, 9], [8, 18], [20, 9], [20, 18]],
    [[6, 13], [17, 13], [22, 13], [29, 13]],
    [[1, 13], [1, 14], [26, 13], [26, 14]],
    [[5, 13], [16, 13], [23, 13], [27, 13]]
  ];

  for (let patternIndex = 0; patternIndex < Math.min(5, levelNumber); patternIndex++) {
    barrierPatterns[patternIndex].forEach(([y, x]) => {
      if (mapCopy[y]?.[x] === ".") mapCopy[y][x] = "#";
    });
  }

  // Levels beyond five add rotating extra barriers and remain varied.
  if (levelNumber > 5) {
    const extraBarriers = [
      [[4, 8], [4, 19], [18, 8], [18, 19]],
      [[7, 13], [21, 13], [28, 13], [29, 14]],
      [[3, 5], [3, 22], [24, 5], [24, 22]],
      [[9, 12], [9, 15], [19, 12], [19, 15]]
    ][(levelNumber - 6) % 4];
    extraBarriers.forEach(([y, x]) => {
      if (mapCopy[y]?.[x] === ".") mapCopy[y][x] = "#";
    });
  }

  return mapCopy.map(row => row.join(""));
}

function resetLivesAndLevel() {
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = null;
  levelTransition = false;
  level = 1;
  score = 0;
  lives = 3;
  livesEl.textContent = lives;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  loadLevel();
}

function reset() { resetLivesAndLevel(); }

function loadLevel() {
  map = buildMap(level);
  player = { x: 13, y: 23, dx: 0, dy: 0, nextDx: 0, nextDy: 0 };

  const ghostTypes = [
    { x: 13, y: 11, dx: 1, dy: 0, color: "#ff3333", personality: 1 },
    { x: 14, y: 14, dx: -1, dy: 0, color: "#ffb8ff", personality: 0.85 },
    { x: 12, y: 14, dx: 1, dy: 0, color: "#00ffff", personality: 0.7 },
    { x: 13, y: 14, dx: 0, dy: -1, color: "#ff9900", personality: 0.55 },
    { x: 15, y: 14, dx: 0, dy: 1, color: "#55ff55", personality: 0.45 },
    { x: 11, y: 14, dx: 1, dy: 0, color: "#a970ff", personality: 0.4 },
    { x: 16, y: 14, dx: -1, dy: 0, color: "#ff6eb4", personality: 0.35 },
    { x: 13, y: 12, dx: 0, dy: 1, color: "#ffea70", personality: 0.3 }
  ];

  const setting = getLevelSetting(level);
  ghosts = ghostTypes.slice(0, setting.count).map(g => ({
    ...g,
    baseSpeed: setting.speed,
    speed: setting.speed,
    eaten: false,
    respawnTimer: 0,
    spawnX: g.x,
    spawnY: g.y
  }));
  pellets = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    if (isOpen(x, y) && map[y][x] !== " ") pellets.push({ x, y, power: map[y][x] === "o" });
  }
  mouth = 0;
  invulnerable = 0;
  frightened = 0;
  eatenGhostScore = 200;
  levelElapsed = 0;
  levelTransition = false;
  running = true;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
  messageEl.textContent = `Level ${level} — ${setting.label} — Use arrow keys or WASD`;
}

function isOpen(x, y) {
  if (y === 14 && (x === -1 || x === cols)) return true;
  if (x < 0 || x >= cols || y < 0 || y >= rows) return false;
  const tileAt = map[y]?.[x];
  return tileAt === "." || tileAt === "o" || tileAt === " " || tileAt === "-";
}

function atCenter(a) { return Math.abs(a - Math.round(a)) < 0.12; }

function moveEntity(entity) {
  if (Math.round(entity.y) === 14) {
    if (entity.x < -0.5) entity.x = cols - 0.5;
    if (entity.x > cols - 0.5) entity.x = -0.5;
  }

  const cx = Math.round(entity.x), cy = Math.round(entity.y);
  if (atCenter(entity.x) && atCenter(entity.y)) {
    if (entity.nextDx !== undefined && isOpen(cx + entity.nextDx, cy + entity.nextDy)) {
      entity.dx = entity.nextDx;
      entity.dy = entity.nextDy;
    }
    if (!isOpen(cx + entity.dx, cy + entity.dy)) {
      entity.dx = 0;
      entity.dy = 0;
    }
  }

  entity.x += entity.dx * (entity.speed || 0.075);
  entity.y += entity.dy * (entity.speed || 0.075);

  if (Math.round(entity.y) === 14) {
    if (entity.x < -0.5) entity.x = cols - 0.5;
    if (entity.x > cols - 0.5) entity.x = -0.5;
  }
}

function ghostChoices(g) {
  const gx = Math.round(g.x), gy = Math.round(g.y);
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => {
    if (isOpen(gx + dx, gy + dy)) {
      // Prevent immediate reversing unless it is the only available option.
      if (g.dx && dx === -g.dx && dy === g.dy) return false;
      if (g.dy && dy === -g.dy && dx === g.dx) return false;
      return true;
    }
    return false;
  });
}

function chooseGhostDirection(g) {
  let choices = ghostChoices(g);
  if (!choices.length) {
    choices = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) =>
      isOpen(Math.round(g.x) + dx, Math.round(g.y) + dy));
  }
  if (!choices.length) return;

  // Every ghost favors Pac-Man's tile. Personality changes make the chase
  // feel natural while later levels leave less room for predictability.
  // Frightened ghosts flee from Pac-Man instead of chasing.
  choices.sort((a, b) => {
    const da = Math.hypot(Math.round(g.x) + a[0] - player.x, Math.round(g.y) + a[1] - player.y);
    const db = Math.hypot(Math.round(g.x) + b[0] - player.x, Math.round(g.y) + b[1] - player.y);
    return frightened > 0 ? db - da : da - db;
  });

  const chaseChance = frightened > 0
    ? 0.05
    : 0.55 + g.personality * 0.35 + (level - 1) * 0.025;
  const choice = Math.random() < Math.min(chaseChance, 0.95)
    ? choices[0]
    : choices[Math.floor(Math.random() * choices.length)];
  g.dx = choice[0];
  g.dy = choice[1];
}

function update() {
  if (!running) return;
  moveEntity(player);
  const px = Math.round(player.x), py = Math.round(player.y);
  const pelletIndex = pellets.findIndex(p => p.x === px && p.y === py);
  if (pelletIndex >= 0) {
    const eatenPellet = pellets[pelletIndex];
    score += eatenPellet.power ? 50 : 10;
    if (eatenPellet.power) {
      frightened = 600;
      eatenGhostScore = 200;
      messageEl.textContent = "Power up! Ghosts are vulnerable!";
    }
    pellets.splice(pelletIndex, 1);
    scoreEl.textContent = score;
  }

  if (!pellets.length) {
    if (!levelTransition) {
      levelTransition = true;
      running = false;
      level++;
      levelEl.textContent = level;
      messageEl.textContent = `Level cleared! Preparing level ${level}...`;
      transitionTimer = setTimeout(() => {
        transitionTimer = null;
        loadLevel();
      }, 2200);
    }
  }

  levelElapsed++;

  ghosts.forEach((g, ghostIndex) => {
    if (g.eaten) {
      g.respawnTimer--;
      if (g.respawnTimer <= 0) {
        g.eaten = false;
        g.x = g.spawnX;
        g.y = g.spawnY;
        g.dx = ghostIndex % 2 === 0 ? 1 : -1;
        g.dy = 0;
      }
      return;
    }

    const timedSpeedBoost = Math.min(0.045, (levelElapsed / 60) * 0.003);
    g.speed = g.baseSpeed + timedSpeedBoost;
    if (frightened > 0) g.speed *= 0.65;

    if (atCenter(g.x) && atCenter(g.y)) chooseGhostDirection(g);
    g.x += g.dx * g.speed;
    g.y += g.dy * g.speed;
    if (Math.round(g.y) === 14 && g.x < -0.5) g.x = cols - 0.5;
    if (Math.round(g.y) === 14 && g.x > cols - 0.5) g.x = -0.5;

    const ghostPlayerDistance = Math.hypot(player.x - g.x, player.y - g.y);
    if (ghostPlayerDistance < 0.7) {
      if (frightened > 0) {
        const points = eatenGhostScore;
        score += points;
        eatenGhostScore *= 2;
        scoreEl.textContent = score;
        messageEl.textContent = `Ghost eaten! +${points}`;
        g.eaten = true;
        g.respawnTimer = 300;
      } else if (invulnerable <= 0) {
        lives--;
        livesEl.textContent = lives;
        if (lives <= 0) {
          running = false;
          messageEl.textContent = `Game over! Final score: ${score}`;
        } else {
          player.x = 13;
          player.y = 23;
          player.dx = player.dy = 0;
          player.nextDx = player.nextDy = 0;
          ghosts.forEach((ghost, i) => {
            ghost.x = [13, 14, 12, 13, 15, 11, 16, 13][i];
            ghost.y = i === 0 ? 11 : (i === 7 ? 12 : 14);
            ghost.dx = i % 2 === 0 ? 1 : -1;
            ghost.dy = 0;
            ghost.eaten = false;
            ghost.respawnTimer = 0;
          });
          messageEl.textContent = `Caught! ${lives} lives remaining`;
          invulnerable = 60;
        }
      }
    }
  });
  mouth += 0.2;
  if (invulnerable > 0) invulnerable--;
  if (frightened > 0) frightened--;
}

function draw() {
  ctx.fillStyle = "#05050a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    if (map[y][x] === "#") {
      ctx.fillStyle = "#1111aa";
      ctx.fillRect(x * tile, y * tile, tile, tile);
      ctx.strokeStyle = "#3939ff";
      ctx.strokeRect(x * tile + 1, y * tile + 1, tile - 2, tile - 2);
    } else if (map[y][x] === "-") {
      ctx.fillStyle = "#ff77ff";
      ctx.fillRect(x * tile, y * tile + 8, tile, 4);
    }
  }

  pellets.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = p.power ? "#fff" : "#ffd180";
    ctx.arc(p.x * tile + 10, p.y * tile + 10, p.power ? 5 : 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.beginPath();
  ctx.fillStyle = "#ffe600";
  const angle = 0.2 + Math.abs(Math.sin(mouth)) * 0.25;
  ctx.moveTo(player.x * tile + 10, player.y * tile + 10);
  ctx.arc(player.x * tile + 10, player.y * tile + 10, 9, angle * Math.PI, (2 - angle) * Math.PI);
  ctx.closePath();
  ctx.fill();

  ghosts.forEach(g => {
    if (g.eaten) return;

    ctx.beginPath();
    if (frightened > 0) {
      ctx.fillStyle = frightened < 120 && Math.floor(frightened / 10) % 2 === 0 ? "#ffffff" : "#245cff";
    } else {
      ctx.fillStyle = g.color;
    }
    ctx.arc(g.x * tile + 10, g.y * tile + 4, 9, Math.PI, 0);
    ctx.lineTo(g.x * tile + 19, g.y * tile + 18);
    ctx.lineTo(g.x * tile + 10, g.y * tile + 14);
    ctx.lineTo(g.x * tile + 1, g.y * tile + 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(g.x * tile + 6, g.y * tile + 7, 2.5, 0, Math.PI * 2);
    ctx.arc(g.x * tile + 14, g.y * tile + 7, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function loop() { update(); draw(); requestAnimationFrame(loop); }

const controls = {
  ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
  ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
  ArrowDown: [0, 1], s: [0, 1], S: [0, 1]
};

document.addEventListener("keydown", e => {
  if (controls[e.key]) {
    e.preventDefault();
    [player.nextDx, player.nextDy] = controls[e.key];
  }
});

document.getElementById("restart").addEventListener("click", reset);
reset();
loop();
