    

const grid = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const gameOverDiv = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const gameContainer = document.getElementById('game-container');

const COLS = 4;
const TILE_HEIGHT = 80;
const GAME_HEIGHT = 480;
const TILE_SPEED = 2.5; // px per frame
const TILE_INTERVAL = 700; // ms between new tiles

const CM_TO_PX = 37.8; // 1cm ≈ 37.8px on most screens
const TILE_GAP_CM = 4;
const TILE_GAP_PX = TILE_GAP_CM * CM_TO_PX; // 4cm gap in px

let tiles = [];
let score = 0;
let gameRunning = false;
let animationId = null;
let tileIntervalId = null;

// The Happy Birthday note sequence
const noteSequence = [
  'Do','Do','Re','Do','Fa','Mi',
  'Do','Do','Re','Do','Sol','Fa',
  'Do','Do','La','Fa','Mi',
  'Re','Si','Si','La','Fa','Sol','Fa'
];
let noteIndex = 0;

// Preload audio elements for each note
const noteNames = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
const noteAudios = {};
noteNames.forEach(note => {
  const audio = new Audio(`sounds/${note}.mp3`);
  noteAudios[note] = audio;
});

function resetGame() {
  tiles = [];
  score = 0;
  noteIndex = 0; // Reset note sequence
  scoreDisplay.textContent = 'Score: 0';
  grid.innerHTML = '';
  gameOverDiv.style.display = 'none';
  gameRunning = false;
  cancelAnimationFrame(animationId);
  clearInterval(tileIntervalId);
}

function startGame() {
  resetGame();
  gameRunning = true;
  startBtn.style.display = 'none';
  spawnTile();
  tileIntervalId = setInterval(spawnTile, TILE_INTERVAL);
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;
  clearInterval(tileIntervalId);
  cancelAnimationFrame(animationId);
  gameOverDiv.style.display = 'block';
  startBtn.style.display = 'block';
}

function spawnTile() {
  // Find which columns are eligible for a new tile (no tile or last tile is far enough down)
  const eligibleCols = [];
  for (let col = 0; col < COLS; col++) {
    // Find the highest (most recent) tile in this column
    const colTiles = tiles.filter(t => t.col === col && !t.clicked);
    if (colTiles.length === 0) {
      eligibleCols.push(col);
    } else {
      // Find the tile with the smallest y (closest to the top)
      const lastTile = colTiles.reduce((minT, t) => t.y > minT.y ? t : minT, colTiles[0]);
      if (lastTile.y > TILE_GAP_PX) {
        eligibleCols.push(col);
      }
    }
  }
  if (eligibleCols.length === 0) return; // No eligible columns, skip this spawn
  const col = eligibleCols[Math.floor(Math.random() * eligibleCols.length)];
  const tile = {
    col,
    y: -TILE_HEIGHT,
    clicked: false,
    el: null
  };
  const tileDiv = document.createElement('div');
  tileDiv.className = 'tile';
  tileDiv.style.left = (col * 25) + '%';
  tileDiv.style.top = tile.y + 'px';
  tileDiv.style.height = TILE_HEIGHT + 'px';
  tileDiv.addEventListener('click', () => {
    if (!gameRunning || tile.clicked) return;
    tile.clicked = true;
    tileDiv.classList.add('clicked');
    setTimeout(() => tileDiv.classList.remove('clicked'), 180);
    tileDiv.style.background = '#4caf50';
    // Play the next note in the Happy Birthday sequence
    if (noteIndex < noteSequence.length) {
      const note = noteSequence[noteIndex];
      const audio = noteAudios[note];
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
      noteIndex++;
    }
    score++;
    scoreDisplay.textContent = 'Score: ' + score;
    setTimeout(() => {
      if (tileDiv.parentNode) tileDiv.parentNode.removeChild(tileDiv);
    }, 100);
  });
  tile.el = tileDiv;
  grid.appendChild(tileDiv);
  tiles.push(tile);
}

function gameLoop() {
  if (!gameRunning) return;
  for (let i = tiles.length - 1; i >= 0; i--) {
    const tile = tiles[i];
    if (tile.clicked) {
      tiles.splice(i, 1);
      continue;
    }
    tile.y += TILE_SPEED;
    tile.el.style.top = tile.y + 'px';
    if (tile.y + TILE_HEIGHT >= GAME_HEIGHT) {
      // Missed tile
      endGame();
      return;
    }
  }
  animationId = requestAnimationFrame(gameLoop);
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
// Optional: allow pressing space to start/restart
document.addEventListener('keydown', (e) => {
  if ((e.key === ' ' || e.key === 'Spacebar') && !gameRunning) {
    startGame();
  }
});