const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const score1El = document.querySelector('#score1');
const score2El = document.querySelector('#score2');
const clockEl = document.querySelector('#clock');
const statusEl = document.querySelector('#status');
const powerBar = document.querySelector('#powerBar');
const powerValue = document.querySelector('#powerValue');

const keys = {};
let running = false;
let score1 = 0;
let score2 = 0;
let timeLeft = 60;
let lastTime = 0;
let timerAccumulator = 0;
let charge = 0;
let charging = false;
let ballHeld = true;
let possession = 1;
let shotCooldown = 0;
let soundEnabled = true;

const player1 = {x: 260, y: 500, vx: 0, vy: 0, w: 54, h: 92, facing: 1, jump: false, block: false, color: '#ff5a1f', skin: '#d8a47c'};
const player2 = {x: 840, y: 500, vx: 0, vy: 0, w: 54, h: 92, facing: -1, jump: false, block: false, color: '#dce1d6', skin: '#9b684a'};
const ball = {x: 300, y: 430, vx: 0, vy: 0, r: 13, inFlight: false};

function resetPositions() {
  Object.assign(player1, {x: 260, y: 500, vx: 0, vy: 0, facing: 1, jump: false, block: false});
  Object.assign(player2, {x: 840, y: 500, vx: 0, vy: 0, facing: -1, jump: false, block: false});
  possession = Math.random() > .5 ? 1 : 2;
  ballHeld = true;
  ball.inFlight = false;
  ball.vx = 0;
  ball.vy = 0;
  attachBall();
}

function startGame() {
  score1 = 0;
  score2 = 0;
  timeLeft = 60;
  running = true;
  score1El.textContent = '0';
  score2El.textContent = '0';
  resetPositions();
  document.querySelector('#startOverlay').classList.add('hidden');
  setStatus('BALL UP');
}

function restart() {
  startGame();
}

function setStatus(text, flash = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle('flash', flash);
}

function attachBall() {
  const owner = possession === 1 ? player1 : player2;
  ball.x = owner.x + owner.w / 2 + owner.facing * 34;
  ball.y = owner.y - 16;
}

function beep(frequency = 440, duration = .05) {
  if (!soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!beep.context) beep.context = new AudioContext();
    const oscillator = beep.context.createOscillator();
    const gain = beep.context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.value = .05;
    oscillator.connect(gain).connect(beep.context.destination);
    oscillator.start();
    oscillator.stop(beep.context.currentTime + duration);
  } catch (_) {}
}

function movePlayer(player, keysLeft, keysRight, keysJump, keysBlock, dt) {
  const left = keys[keysLeft];
  const right = keys[keysRight];
  player.vx *= .82;
  if (left) { player.vx -= 1500 * dt; player.facing = -1; }
  if (right) { player.vx += 1500 * dt; player.facing = 1; }
  player.vx = Math.max(-260, Math.min(260, player.vx));
  player.x += player.vx * dt;
  player.x = Math.max(55, Math.min(990 - player.w, player.x));

  if (keys[keysJump] && !player.jump) {
    player.vy = -520;
    player.jump = true;
  }
  player.vy += 1100 * dt;
  player.y += player.vy * dt;
  if (player.y >= 500) {
    player.y = 500;
    player.vy = 0;
    player.jump = false;
  }
  player.block = Boolean(keys[keysBlock]);
}

function updateCPU(dt) {
  const target = ball.inFlight ? ball.x : possession === 1 ? 340 : player2.x;
  const dx = target - (player2.x + player2.w / 2);
  if (Math.abs(dx) > 22) {
    player2.vx += Math.sign(dx) * 900 * dt;
    player2.facing = Math.sign(dx);
  } else {
    player2.vx *= .85;
  }
  player2.vx = Math.max(-210, Math.min(210, player2.vx));
  player2.x += player2.vx * dt;
  player2.x = Math.max(55, Math.min(990 - player2.w, player2.x));

  player2.vy += 1100 * dt;
  player2.y += player2.vy * dt;
  if (player2.y >= 500) { player2.y = 500; player2.vy = 0; player2.jump = false; }

  if (possession === 2 && ballHeld && !shotCooldown) {
    if (Math.random() < dt * .35) shoot(player2, -1);
  }
  if (ball.inFlight && possession === 1 && player2.x < 470 && Math.random() < dt * .45) {
    player2.block = true;
  } else if (!ball.inFlight) {
    player2.block = false;
  }
}

function shoot(player, direction) {
  if (shotCooldown > 0 || !ballHeld || possession !== (player === player1 ? 1 : 2)) return;
  ballHeld = false;
  possession = 0;
  ball.inFlight = true;
  const power = player === player1 ? Math.max(.38, charge) : .82;
  const targetX = direction === 1 ? 922 : 178;
  const targetY = 350;
  ball.x = player.x + player.w / 2;
  ball.y = player.y - 15;
  ball.vx = (targetX - ball.x) * (1.55 + power * .28);
  ball.vy = -440 - power * 220;
  shotCooldown = 1;
  setStatus('SHOT!', true);
  beep(300, .08);
}

function handleCharging(dt) {
  if (keys.s && possession === 1 && ballHeld && !shotCooldown) {
    charging = true;
    charge = Math.min(1, charge + dt * .75);
  } else if (charging) {
    charging = false;
    shoot(player1, 1);
  }
  powerBar.style.width = `${Math.round(charge * 100)}%`;
  powerValue.textContent = `${Math.round(charge * 100)}%`;
  if (!charging && possession === 1 && ballHeld) charge = Math.max(0, charge - dt * 1.8);
}

function updateBall(dt) {
  if (ballHeld) {
    attachBall();
    return;
  }
  ball.vy += 980 * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Backboard and court bounds
  if (ball.x < ball.r) { ball.x = ball.r; ball.vx *= -.7; }
  if (ball.x > 1100 - ball.r) { ball.x = 1100 - ball.r; ball.vx *= -.7; }
  if (ball.y > 568) {
    ball.y = 568;
    ball.vy *= -.55;
    ball.vx *= .82;
  }

  // Score when the ball passes through either hoop while moving downward.
  if (ball.y > 338 && ball.y < 360 && ball.vy > 0) {
    if (ball.x > 895 && ball.x < 955) {
      scorePoint(1, 'PLAYER 1 SCORES');
    } else if (ball.x > 145 && ball.x < 205) {
      scorePoint(2, 'CPU SCORES');
    }
  }

  // A live ball can be picked up near a player.
  if (ball.inFlight && shotCooldown <= 0) {
    if (distance(ball, player1) < 68) {
      possession = 1;
      ballHeld = true;
      ball.inFlight = false;
      setStatus('PLAYER 1 BALL');
    } else if (distance(ball, player2) < 68) {
      possession = 2;
      ballHeld = true;
      ball.inFlight = false;
      setStatus('CPU BALL');
    }
  }
}

function distance(a, b) {
  return Math.hypot(a.x - (b.x + b.w / 2), a.y - (b.y - 20));
}

function scorePoint(player, message) {
  ball.inFlight = false;
  ballHeld = false;
  ball.vx = 0;
  ball.vy = 0;
  if (player === 1) {
    score1 += 2;
    score1El.textContent = score1;
  } else {
    score2 += 2;
    score2El.textContent = score2;
  }
  setStatus(message, true);
  beep(620, .18);

  if (score1 >= 11 || score2 >= 11) {
    running = false;
    setStatus(score1 >= 11 ? 'PLAYER 1 WINS' : 'CPU WINS', true);
  } else {
    setTimeout(() => {
      resetPositions();
      setStatus('BALL UP');
    }, 1400);
  }
}

function update(dt) {
  if (!running) return;

  timerAccumulator += dt;
  if (timerAccumulator >= 1) {
    timerAccumulator = 0;
    timeLeft--;
    if (timeLeft <= 0) {
      if (score1 !== score2) {
        running = false;
        setStatus(score1 > score2 ? 'PLAYER 1 WINS' : 'CPU WINS', true);
      } else {
        timeLeft = 30;
        setStatus('OVERTIME', true);
      }
    }
    clockEl.textContent = `00:${String(Math.max(0, timeLeft)).padStart(2, '0')}`;
  }

  shotCooldown = Math.max(0, shotCooldown - dt);
  movePlayer(player1, 'a', 'd', 'w', 'w', dt);
  updateCPU(dt);
  handleCharging(dt);
  updateBall(dt);
}

function drawCourt() {
  ctx.fillStyle = '#afbaa2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#f3eadb';
  ctx.fillStyle = '#f3eadb';
  ctx.globalAlpha = .9;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(550, 92);
  ctx.lineTo(550, 568);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(550, 330, 85, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeRect(420, 246, 260, 168);
  ctx.beginPath();
  ctx.arc(550, 330, 80, Math.PI * .15, Math.PI * .85);
  ctx.stroke();

  ctx.globalAlpha = .12;
  ctx.fillStyle = '#59644f';
  for (let x = 0; x < 1100; x += 55) {
    ctx.fillRect(x, 92, 1, 476);
  }
  for (let y = 92; y < 568; y += 55) {
    ctx.fillRect(0, y, 1100, 1);
  }
  ctx.globalAlpha = 1;
}

function drawHoop(x) {
  ctx.strokeStyle = '#f3eadb';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(x + (x < 550 ? 42 : -42), 170);
  ctx.lineTo(x + (x < 550 ? 42 : -42), 330);
  ctx.stroke();

  ctx.fillStyle = '#ece0cb';
  ctx.fillRect(x + (x < 550 ? 30 : -76), 185, 46, 70);
  ctx.strokeStyle = '#171816';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + (x < 550 ? 30 : -76), 185, 46, 70);

  ctx.strokeStyle = '#ff5a1f';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(x, 330, 38, 9, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPlayer(player) {
  ctx.save();
  ctx.translate(player.x + player.w / 2, player.y);
  ctx.fillStyle = 'rgba(17,19,15,.18)';
  ctx.beginPath();
  ctx.ellipse(0, 102, 38, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = player.skin;
  ctx.beginPath();
  ctx.arc(0, -64, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = player.color;
  ctx.fillRect(-27, -42, 54, 62);
  ctx.fillStyle = '#171816';
  ctx.fillRect(-22, -34, 44, 7);

  ctx.fillStyle = player.skin;
  ctx.fillRect(-37, -38, 12, 46);
  ctx.fillRect(25, -38, 12, 46);

  ctx.fillStyle = '#171816';
  ctx.fillRect(-24, 20, 16, 78);
  ctx.fillRect(8, 20, 16, 78);

  if (player.block) {
    ctx.strokeStyle = player.skin;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-25, -30);
    ctx.lineTo(-55, -90);
    ctx.moveTo(25, -30);
    ctx.lineTo(55, -90);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBall() {
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.fillStyle = '#ff762e';
  ctx.beginPath();
  ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#171816';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-ball.r, 0); ctx.lineTo(ball.r, 0);
  ctx.moveTo(0, -ball.r); ctx.lineTo(0, ball.r);
  ctx.arc(0, 0, ball.r * .7, -.8, .8);
  ctx.stroke();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCourt();
  drawHoop(178);
  drawHoop(922);
  drawPlayer(player1);
  drawPlayer(player2);
  drawBall();
}

function gameLoop(time) {
  const dt = Math.min(.032, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  keys[key] = true;
  if (key === ' ' || key === 'enter') {
    event.preventDefault();
    if (!running) startGame();
  }
});
window.addEventListener('keyup', event => { keys[event.key.toLowerCase()] = false; });

document.querySelector('#startButton').addEventListener('click', startGame);
document.querySelector('#restartButton').addEventListener('click', restart);
document.querySelector('#soundButton').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  document.querySelector('#soundButton').innerHTML = `VOL <b>${soundEnabled ? 'ON' : 'OFF'}</b>`;
});

resetPositions();
requestAnimationFrame(gameLoop);
