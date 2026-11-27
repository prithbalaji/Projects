const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const messageEl = document.getElementById("message");

const grid = 20;
const cells = canvas.width / grid;
let snake, direction, nextDirection, food, score, best, timer, running;

best = Number(localStorage.getItem("snake-best") || 0);
bestEl.textContent = best;

function startGame() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  running = true;
  scoreEl.textContent = "0";
  messageEl.textContent = "Use the arrow keys or WASD";
  placeFood();
  clearInterval(timer);
  timer = setInterval(tick, 110);
  draw();
}

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
  } while (snake.some(part => part.x === food.x && part.y === food.y));
}

function tick() {
  if (!running) return;
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells || snake.some(part => part.x === head.x && part.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      localStorage.setItem("snake-best", best);
    }
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function endGame() {
  running = false;
  clearInterval(timer);
  messageEl.textContent = `Game over — score: ${score}`;
  draw();
}

function draw() {
  ctx.fillStyle = "#aad751";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(150,190,85,.35)";
  for (let y = 0; y < cells; y++) for (let x = 0; x < cells; x++) {
    if ((x + y) % 2 === 0) ctx.fillRect(x * grid, y * grid, grid, grid);
  }

  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.arc(food.x * grid + grid / 2, food.y * grid + grid / 2, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#69a84f";
  ctx.fillRect(food.x * grid + 13, food.y * grid + 2, 5, 8);

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#3367d6" : "#4285f4";
    ctx.beginPath();
    ctx.roundRect(part.x * grid + 2, part.y * grid + 2, grid - 4, grid - 4, 7);
    ctx.fill();
  });

  if (snake.length) {
    const head = snake[0];
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(head.x * grid + 8, head.y * grid + 8, 2.5, 0, Math.PI * 2);
    ctx.arc(head.x * grid + 22, head.y * grid + 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

const controls = {
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 }
};

document.addEventListener("keydown", event => {
  const control = controls[event.key];
  if (!control) return;
  event.preventDefault();
  if (control.x !== -direction.x || control.y !== -direction.y) nextDirection = control;
});

let touchStart = null;
canvas.addEventListener("touchstart", event => {
  touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
}, { passive: true });
canvas.addEventListener("touchend", event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  const control = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 })
    : (dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
  if (control.x !== -direction.x || control.y !== -direction.y) nextDirection = control;
}, { passive: true });

document.getElementById("restart").addEventListener("click", startGame);
startGame();
