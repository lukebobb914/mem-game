const emoji = "🐺";

const gameContainer = document.getElementById("game-grid");
const submitBtn = document.getElementById("submit-btn");
const resultText = document.getElementById("result");
const timerDisplay = document.getElementById("timer");
const playAgainBtn = document.getElementById("retry-btn");

let emojiPositions = new Set();
let selectedCells = new Set();
let timeLeft = 60;
let timerInterval;
let attemptsLeft = 5;

let currentLevel = 1;

const levels = {
  1: { gridSize: 4, numberOfEmojis: 5 },
  2: { gridSize: 6, numberOfEmojis: 5 },
  3: { gridSize: 8, numberOfEmojis: 5 }
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
  const { numberOfEmojis } = levels[currentLevel];
  emojiPositions.clear();

  while (emojiPositions.size < numberOfEmojis) {
    const rand = Math.floor(Math.random() * totalCells);
    emojiPositions.add(rand);
  }
}


// 3. Show emojis briefly
function showEmojis(gridSize) {
  document.querySelectorAll('.cell').forEach(cell => {
    const index = parseInt(cell.dataset.index);
    if (emojiPositions.has(index)) {
      cell.textContent = emoji;
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
  timeLeft = 60;
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

  selectedCells.forEach(index => {
    if (emojiPositions.has(index)) {
      correct++;
    } else {
      wrong++;
    }
  });

  const { numberOfEmojis } = levels[currentLevel];
  const selectedCorrectly = correct === numberOfEmojis;
  const exactMatch = selectedCells.size === emojiPositions.size;

  let message = `✅ You got ${correct} out of ${numberOfEmojis} correct!`;
  if (wrong > 0) {
    message += ` ❌ ${wrong} wrong selections.`;
  }
  message += ` (${5 - attemptsLeft + 1}/5 tries)`;
  resultText.textContent = message;

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
    }

}



// 9. End game logic
function finalizeGame(messagePrefix) {
  submitBtn.disabled = true;

  document.querySelectorAll('.cell').forEach(cell => {
    cell.style.pointerEvents = 'none';
    const index = parseInt(cell.dataset.index);
    if (emojiPositions.has(index)) {
      cell.textContent = emoji;
      cell.style.color = 'black';
    }
  });

  let finalCorrect = 0;
  selectedCells.forEach(index => {
    if (emojiPositions.has(index)) {
      finalCorrect++;
    }
  });

  const { numberOfEmojis } = levels[currentLevel];
  resultText.textContent += `\n${messagePrefix} Final score: ${finalCorrect}/${numberOfEmojis}`;

  if (currentLevel === 3 && finalCorrect === numberOfEmojis) {
    playAgainBtn.textContent = "🎉 Play Again";
    playAgainBtn.style.display = 'inline-block';
  } else if (attemptsLeft === 0 || timeLeft <= 0) {
    playAgainBtn.textContent = "🔁 Try Again";
    playAgainBtn.style.display = 'inline-block';
  }
}

// 10. Start game
function startGame() {
  selectedCells.clear();
  resultText.textContent = '';
  submitBtn.disabled = false;
  playAgainBtn.style.display = 'none';
  clearInterval(timerInterval);

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
startGame();
