const emoji = "🐺";
const decoyEmoji = "🦝";

const gameContainer = document.getElementById("game-grid");
const submitBtn = document.getElementById("submit-btn");
const resultText = document.getElementById("result");
const timerDisplay = document.getElementById("timer");
const playAgainBtn = document.getElementById("retry-btn");

let decoyPositions = new Set();
let wolfPositions = new Set();
let selectedCells = new Set();
let timeLeft = 30;
let timerInterval;
let attemptsLeft = 5;

let currentLevel = 1;

const levels = {
  1: { gridSize: 4, numberOfEmojis: 1, decoyCount: 1 },
  2: { gridSize: 6, numberOfEmojis: 4, decoyCount: 2 },
  3: { gridSize: 8, numberOfEmojis: 5, decoyCount: 3 }
};


// 1. Create the grid
// given gridSize (#ofcols) will create grid using 

//  - takes in #of rows/cols 
function createGrid(gridSize) {
  gameContainer.innerHTML = '';   // clear any existing grid 
  // use css property gridTemplateColumns to assign grid size 
  gameContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;   

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    gameContainer.appendChild(cell);
  }
}


// 2. Generate random emoji positions
// randomly generates positions of wolves + decoy emojis and stores in wolfPositions and decoyPositions sets
function generatewolfPositions() {
  const { numberOfEmojis, decoyCount } = levels[currentLevel];    // extract the #of emojis and decoyCount from levels dict 
  
  // clear prev positions
  wolfPositions.clear();
  decoyPositions.clear();

  // Create + store wolf positions in wolfPositions
  while (wolfPositions.size < numberOfEmojis) {
    const rand = Math.floor(Math.random() * totalCells);          // random # from 0-1 then times by tot cells 
    wolfPositions.add(rand);                                      // add # to wolfPositions set 
  }

  // Place decoy emojis in unique, empty spots
  while (decoyPositions.size < decoyCount) {
    const rand = Math.floor(Math.random() * totalCells);
    if (!wolfPositions.has(rand) && !decoyPositions.has(rand)) {  // checks if pos is already occupied by wolf or decoy 
      decoyPositions.add(rand);
    }
  }
}

// 3. Show emojis briefly
// sets cell value to be correct emoji for cell that are in wolfPositions and decoyPositions
// call hideEmojis callback function after 2 seconds
function showEmojis(gridSize) {
  document.querySelectorAll('.cell').forEach(cell => {
    const index = parseInt(cell.dataset.index);

    // assign correct emoji (wolf/decoy) to correct grid 
    if (wolfPositions.has(index)) {
      cell.textContent = emoji;       
    } else if (decoyPositions.has(index)) {
      cell.textContent = decoyEmoji;
    }
  });

  // Delay before executing callback function -> hideEmojis()
  setTimeout(() => {
    hideEmojis();
    enableSelection();
    startTimer();
  }, 2000);
}



// 4. Make emojis transparent color 
function hideEmojis() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '•';
    cell.style.color = 'transparent';
  });
}

// 5. Allow player to select cells
// allows player to select and unselect cells 
function enableSelection() {

  // loop thru each cell in grid 
  document.querySelectorAll('.cell').forEach(cell => {

    // add event listener for click to each cell 
    cell.addEventListener('click', () => {
      const index = parseInt(cell.dataset.index);       // get index of clicked cell 
      // if cell prev selected => remove and vice versa 
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
// countdown timer for 30s if time exceeds will 
function startTimer() {
  updateTimerDisplay();

  timerInterval = setInterval(() => {   // built in fn to set up an action for every sec 
    timeLeft--;                         // subtract 1 from timeLeft
    updateTimerDisplay();               // call fn to update timer display  

    if (timeLeft <= 0) {
      clearInterval(timerInterval);     // built-in fn to stop repeating task started with setInterval
      finalizeGame("⏱ Time's up!");
    }
  }, 1000);
}

// Helper fn to update timer display based on current timeLeft var 
function updateTimerDisplay() {
  timerDisplay.textContent = `Time left: ${timeLeft}s | Attempts left: ${attemptsLeft}`;
}

// 7. Submit manually
submitBtn.addEventListener("click", () => {       // add click event listener for submit-button 
  if (attemptsLeft > 0) {
    evaluateAttempt();          // call evaluateAttempt()
    attemptsLeft--;             // subtract 1 from attemptsLeft
    updateTimerDisplay();       // update timer display (also displays attempts left)

    // checks if user runs out of attempts 
    if (attemptsLeft === 0) {
      clearInterval(timerInterval);
      finalizeGame("🎮 No attempts left!");   // call finalizeGame 
    }
  }
});

// 8. Evaluate player selection
// checks #of wolves correctly selected, check if decoys were hit, 
function evaluateAttempt() {
  let correct = 0;
  let wrong = 0;
  let hitDecoy = false;

  selectedCells.forEach(index => {
    if (decoyPositions.has(index)) {
      hitDecoy = true;
    } else if (wolfPositions.has(index)) {
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
  const exactMatch = selectedCells.size === wolfPositions.size;

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
    if (wolfPositions.has(index)) {
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
    if (wolfPositions.has(index)) {
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

  const { gridSize } = levels[currentLevel];
  totalCells = gridSize * gridSize;

  createGrid(gridSize);
  generatewolfPositions();
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

