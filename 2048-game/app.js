const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const newGameButton = document.getElementById("new-game");

const size = 4;
let board = [];
let score = 0;
let best = Number(localStorage.getItem("2048-best") || 0);
bestElement.textContent = best;

function startGame() {
    board = Array.from({ length: size }, () => Array(size).fill(0));
    score = 0;
    scoreElement.textContent = "0";
    addRandomTile();
    addRandomTile();
    render();
}

function addRandomTile() {
    const empty = [];
    board.forEach((row, r) => row.forEach((value, c) => {
        if (value === 0) empty.push([r, c]);
    }));
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
    boardElement.innerHTML = "";
    board.flat().forEach((value) => {
        const tile = document.createElement("div");
        tile.className = value ? `cell tile-${value}` : "cell";
        tile.textContent = value || "";
        boardElement.appendChild(tile);
    });
    scoreElement.textContent = score;
    if (score > best) {
        best = score;
        bestElement.textContent = best;
        localStorage.setItem("2048-best", best);
    }
}

function slideAndMerge(line) {
    const values = line.filter(Boolean);
    for (let i = 0; i < values.length - 1; i++) {
        if (values[i] === values[i + 1]) {
            values[i] *= 2;
            score += values[i];
            values.splice(i + 1, 1);
        }
    }
    while (values.length < size) values.push(0);
    return values;
}

function move(direction) {
    const previous = JSON.stringify(board);

    if (direction === "left" || direction === "right") {
        for (let r = 0; r < size; r++) {
            let line = [...board[r]];
            if (direction === "right") line.reverse();
            line = slideAndMerge(line);
            if (direction === "right") line.reverse();
            board[r] = line;
        }
    } else {
        for (let c = 0; c < size; c++) {
            let line = board.map((row) => row[c]);
            if (direction === "down") line.reverse();
            line = slideAndMerge(line);
            if (direction === "down") line.reverse();
            line.forEach((value, r) => board[r][c] = value);
        }
    }

    if (previous !== JSON.stringify(board)) {
        addRandomTile();
        render();
        if (isGameOver()) setTimeout(() => alert(`Game over! Your score: ${score}`), 50);
    }
}

function isGameOver() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!board[r][c]) return false;
            if (c < size - 1 && board[r][c] === board[r][c + 1]) return false;
            if (r < size - 1 && board[r][c] === board[r + 1][c]) return false;
        }
    }
    return true;
}

const keys = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
document.addEventListener("keydown", (event) => {
    if (!keys[event.key]) return;
    event.preventDefault();
    move(keys[event.key]);
});

let startX = 0;
let startY = 0;
boardElement.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
}, { passive: true });
boardElement.addEventListener("touchend", (event) => {
    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
}, { passive: true });

newGameButton.addEventListener("click", startGame);
startGame();
