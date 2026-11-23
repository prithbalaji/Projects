const WORDS = [
  'apple','brave','chair','dance','eagle','flame','grape','house','input','jolly','koala','lemon','music','night','ocean','peace','queen','river','smile','trust','under','vivid','water','xenon','young','zebra','about','again','alive','amber','angel','beach','berry','black','blaze','bloom','bread','brick','brush','candy','charm','clean','cloud','coral','crane','cream','dream','earth','elite','faith','frost','giant','glass','green','happy','heart','horse','light','magic','maple','money','mouse','movie','north','paint','paper','phone','plant','power','quick','radio','raise','robot','route','score','shine','shore','sound','space','spice','stone','story','sweet','tiger','toast','tower','train','trend','unity','video','windy','world','worry','yacht'
].filter(word => word.length === 5);

const VALID_WORDS = new Set(WORDS);
const KEY_ROWS = ['qwertyuiop','asdfghjkl','zxcvbnm'];
const board = document.querySelector('#board');
const keyboard = document.querySelector('#keyboard');
const toast = document.querySelector('#toast');

let solution = WORDS[Math.floor(Math.random() * WORDS.length)].toLowerCase();
let guesses = [];
let currentGuess = '';
let gameOver = false;

function createBoard() {
  board.innerHTML = '';
  for (let row = 0; row < 6; row++) {
    const rowElement = document.createElement('div');
    rowElement.className = 'board-row';
    for (let column = 0; column < 5; column++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${row}-${column}`;
      rowElement.appendChild(tile);
    }
    board.appendChild(rowElement);
  }
}

function createKeyboard() {
  KEY_ROWS.forEach((row, rowIndex) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'keyboard-row';

    if (rowIndex === 2) {
      rowElement.appendChild(createKey('enter', 'enter', 'wide'));
    }

    [...row].forEach(letter => rowElement.appendChild(createKey(letter)));

    if (rowIndex === 2) {
      rowElement.appendChild(createKey('⌫', 'backspace', 'wide'));
    }
    keyboard.appendChild(rowElement);
  });
}

function createKey(label, action = label, extraClass = '') {
  const key = document.createElement('button');
  key.className = `key ${extraClass}`;
  key.dataset.key = action;
  key.textContent = label;
  key.setAttribute('aria-label', action);
  key.addEventListener('click', () => handleInput(action));
  return key;
}

function handleInput(input) {
  if (gameOver) return;
  if (/^[a-z]$/i.test(input)) {
    if (currentGuess.length < 5) {
      currentGuess += input.toLower;
      updateTiles();
    }
  } else if (input === 'backspace') {
    currentGuess = currentGuess.slice(0, -1);
    updateTiles();
  } else if (input === 'enter') {
    submitGuess();
  }
}

function updateTiles() {
  const row = guesses.length;
  for (let column = 0; column < 5; column++) {
    const tile = document.querySelector(`#tile-${row}-${column}`);
    const letter = currentGuess[column] || '';
    tile.textContent = letter;
    tile.classList.toggle('filled', Boolean(letter));
  }
}

function submitGuess() {
  if (currentGuess.length !== 5) {
    showToast('Not enough letters');
    shakeCurrentRow();
    return;
  }
  if (!VALID_WORDS.has(currentGuess)) {
    showToast('Not in word list');
    shakeCurrentRow();
    return;
  }

  const guess = currentGuess;
  const states = scoreGuess(guess);
  const row = guesses.length;

  states.forEach((state, column) => {
    setTimeout(() => {
      const tile = document.querySelector(`#tile-${row}-${column}`);
      tile.classList.add('reveal', state);
    }, column * 280);
  });

  setTimeout(() => {
    states.forEach((state, column) => {
      const letter = guess[column].toUpperCase();
      updateKey(letter, state);
    });
  }, 1500);

  guesses.push(guess);
  currentGuess = '';

  setTimeout(() => {
    if (guess === solution) {
      gameOver = true;
      showToast(['Genius', 'Magnificent', 'Impressive', 'Splendid', 'Great', 'Phew'][guesses.length - 1]);
      updateStats(true, guesses.length);
    } else if (guesses.length === 6) {
      gameOver = true;
      showToast(solution.toUpperCase());
      updateStats(false, 0);
    }
  }, 1550);
}

function scoreGuess(guess) {
  const answerLetters = solution.toUpperCase().split('');
  const guessLetters = guess.toUpperCase().split('');
  const states = Array(5).fill('absent');

  guessLetters.forEach((letter, index) => {
    if (letter === answerLetters[index]) {
      states[index] = 'correct';
      answerLetters[index] = null;
    }
  });

  guessLetters.forEach((letter, index) => {
    if (states[index] === 'correct') return;
    const matchIndex = answerLetters.indexOf(letter);
    if (matchIndex !== -1) {
      states[index] = 'present';
      answerLetters[matchIndex] = null;
    }
  });

  return states;
}

function updateKey(letter, state) {
  const key = document.querySelector(`[data-key="${letter.toLowerCase()}"]`);
  if (!key) return;
  const priority = { absent: 1, present: 2, correct: 3 };
  const existing = [...key.classList].find(name => ['absent','present','correct'].includes(name));
  if (!existing || priority[state] > priority[existing]) {
    key.classList.remove('absent','present','correct');
    key.classList.add(state);
  }
}

function shakeCurrentRow() {
  const row = document.querySelectorAll('.board-row')[guesses.length];
  row.classList.remove('shake');
  void row.offsetWidth;
  row.classList.add('shake');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function getStats() {
  return JSON.parse(localStorage.getItem('wordle-stats') || '{"played":0,"wins":0,"currentStreak":0,"maxStreak":0,"distribution":[0,0,0,0,0,0]}');
}

function updateStats(won, guessCount) {
  const stats = getStats();
  stats.played++;
  if (won) {
    stats.wins++;
    stats.currentStreak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.distribution[guessCount - 1]++;
  } else {
    stats.currentStreak = 0;
  }
  localStorage.setItem('wordle-stats', JSON.stringify(stats));
}

function renderStats() {
  const stats = getStats();
  document.querySelector('#played').textContent = stats.played;
  document.querySelector('#winPercent').textContent = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
  document.querySelector('#currentStreak').textContent = stats.currentStreak;
  document.querySelector('#maxStreak').textContent = stats.maxStreak;

  const distribution = document.querySelector('#distribution');
  const highest = Math.max(...stats.distribution, 1);
  distribution.innerHTML = stats.distribution.map((count, index) =>
    `<div class="dist-row"><span>${index + 1}</span><div class="dist-bar ${count ? 'active' : ''}" style="width:${Math.max(count / highest * 100, 8)}%">${count}</div></div>`
  ).join('');
}

document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Enter') handleInput('enter');
  else if (event.key === 'Backspace') handleInput('backspace');
  else if (/^[a-z]$/i.test(event.key)) handleInput(event.key);
});

document.querySelector('#helpButton').addEventListener('click', () => document.querySelector('#helpDialog').showModal());
document.querySelector('#statsButton').addEventListener('click', () => { renderStats(); document.querySelector('#statsDialog').showModal(); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.querySelector(`#${button.dataset.close}`).close()));

const savedTheme = localStorage.getItem('wordle-theme');
if (savedTheme === 'light') document.body.classList.add('light');
document.querySelector('#themeButton').addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('wordle-theme', document.body.classList.contains('light') ? 'light' : 'dark');
});

createBoard();
createKeyboard();
