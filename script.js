const emoji = "🐺";
const decoyEmoji = "🦝";

const gameContainer = document.getElementById("game-grid");
const submitBtn = document.getElementById("submit-btn");
const resultText = document.getElementById("result");
const timerDisplay = document.getElementById("timer");
const playAgainBtn = document.getElementById("retry-btn");

let decoyPositions = new Set();
let emojiPositions = new Set();
let selectedCells = new Set();
let timeLeft = 60;
let timerInterval;
let attemptsLeft = 5;

let currentLevel = 1;

const levels = {
  1: { gridSize: 4, numberOfEmojis: 1, decoyCount: 1 },
  2: { gridSize: 6, numberOfEmojis: 2, decoyCount: 2 },
  3: { gridSize: 8, numberOfEmojis: 3, decoyCount: 3 }
};


// 1. Create the grid
function createGrid(gridSize) {
  gameContainer.innerHTML = '';
  gameContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    gameContainer.appendChild(cell);
  }
}


// 2. Generate random emoji positions
function generateEmojiPositions() {
  const { numberOfEmojis, decoyCount } = levels[currentLevel];
  emojiPositions.clear();
  decoyPositions.clear();

  // Place wolf emojis
  while (emojiPositions.size < numberOfEmojis) {
    const rand = Math.floor(Math.random() * totalCells);
    emojiPositions.add(rand);
  }

  // Place decoy emojis in unique, empty spots
  while (decoyPositions.size < decoyCount) {
    const rand = Math.floor(Math.random() * totalCells);
    if (!emojiPositions.has(rand) && !decoyPositions.has(rand)) {
      decoyPositions.add(rand);
    }
  }
}




// 3. Show emojis briefly
function showEmojis(gridSize) {
  document.querySelectorAll('.cell').forEach(cell => {
    const index = parseInt(cell.dataset.index);
    if (emojiPositions.has(index)) {
      cell.textContent = emoji;
    } else if (decoyPositions.has(index)) {
      cell.textContent = decoyEmoji;
    }
  });

  setTimeout(() => {
    hideEmojis();
    enableSelection();
    startTimer();
  }, 2000);
}



// 4. Hide emojis
function hideEmojis() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '•';
    cell.style.color = 'transparent';
  });
}

// 5. Allow player to select cells
function enableSelection() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const index = parseInt(cell.dataset.index);
      if (selectedCells.has(index)) {
        selectedCells.delete(index);
        cell.classList.remove("selected");
      } else {
        selectedCells.add(index);
        cell.classList.add("selected");
      }
    });
  });
}

// 6. Timer countdown
function startTimer() {
  timeLeft = 30;
  attemptsLeft = 5;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finalizeGame("⏱ Time's up!");
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerDisplay.textContent = `Time left: ${timeLeft}s | Attempts left: ${attemptsLeft}`;
}

// 7. Submit manually
submitBtn.addEventListener("click", () => {
  if (attemptsLeft > 0) {
    evaluateAttempt();
    attemptsLeft--;
    updateTimerDisplay();

    if (attemptsLeft === 0) {
      clearInterval(timerInterval);
      finalizeGame("🎮 No attempts left!");
    }
  }
});

// 8. Evaluate player selection
function evaluateAttempt() {
  let correct = 0;
  let wrong = 0;
  let hitDecoy = false;

  selectedCells.forEach(index => {
    if (decoyPositions.has(index)) {
      hitDecoy = true;
    } else if (emojiPositions.has(index)) {
      correct++;
    } else {
      wrong++;
    }
  });

  if (hitDecoy) {
    clearInterval(timerInterval);
    finalizeGame("💀 You clicked the wrong emoji! Game Over.");
    return;
  }

  const { numberOfEmojis } = levels[currentLevel];
  const selectedCorrectly = correct === numberOfEmojis;
  const exactMatch = selectedCells.size === emojiPositions.size;

  if (selectedCorrectly && exactMatch && wrong === 0) {
    clearInterval(timerInterval);
    if (currentLevel === 1) {
      finalizeGame("🎯 Level 1 passed!");
      setTimeout(() => {
        currentLevel = 2;
        startGame();
      }, 2500);
    } else if (currentLevel === 2) {
      finalizeGame("🎯 Level 2 passed!");
      setTimeout(() => {
        currentLevel = 3;
        startGame();
      }, 2500);
    } else {
      finalizeGame("🏆 You win the game!");
    }
  } else {
    resultText.textContent = `✅ You got ${correct} out of ${numberOfEmojis} correct! ❌ ${wrong} wrong selections. (${5 - attemptsLeft + 1}/5 tries)`;
  }
}




// 9. End game logic
function finalizeGame(messagePrefix) {
  submitBtn.disabled = true;

  let finalCorrect = 0;
  selectedCells.forEach(index => {
    if (emojiPositions.has(index)) {
      finalCorrect++;
    }
  });

  const { numberOfEmojis } = levels[currentLevel];
  const isWin = (
    (currentLevel === 1 || currentLevel === 2) &&
    finalCorrect === numberOfEmojis &&
    attemptsLeft > 0 &&
    timeLeft > 0
  ) || (currentLevel === 3 && finalCorrect === numberOfEmojis);

  // Show the GIF only if they LOST
  if (!isWin) {
    gameContainer.style.display = 'none';
    document.getElementById("end-gif").style.display = 'block';
  }

  // Reveal correct emoji positions (for clarity)
  document.querySelectorAll('.cell').forEach(cell => {
    const index = parseInt(cell.dataset.index);
    if (emojiPositions.has(index)) {
      cell.textContent = emoji;
      cell.style.color = 'black';
    }
  });

  resultText.textContent += `\n${messagePrefix}`;

  if (isWin && currentLevel === 3) {
    playAgainBtn.textContent = "🎉 Play Again";
  } else {
    playAgainBtn.textContent = "🔁 Try Again";
  }

  playAgainBtn.style.display = 'inline-block';
}


// 10. Start game
function startGame() {
  selectedCells.clear();
  resultText.textContent = '';
  submitBtn.disabled = false;
  playAgainBtn.style.display = 'none';
  clearInterval(timerInterval);

  document.getElementById("end-gif").style.display = 'none';
  gameContainer.style.display = 'grid';

  const { gridSize } = levels[currentLevel];
  totalCells = gridSize * gridSize;

  createGrid(gridSize);
  generateEmojiPositions();
  showEmojis();
}



playAgainBtn.addEventListener("click", () => {
  currentLevel = 1;
  startGame();
});

// Start the first level
document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("intro-modal").style.display = "none";
  startGame();
});

