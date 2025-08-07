// ################################
// Define Vars
// ################################
const emoji = "🐺";
const decoyEmoji = "🦝";

const gameContainer = document.getElementById("game-grid");
const submitBtn = document.getElementById("submit-btn");
const resultText = document.getElementById("result");
const timerDisplay = document.getElementById("timer");
const playAgainBtn = document.getElementById("retry-btn");

let decoyPositions = new Set();
let wolfPositions = new Set();    
let selectedCells = new Set();    // stores grid indexes of the squares that user selects 
let timeLeft = 30;
let timerInterval;
let startingAttempts = 3
let attemptsLeft = 3;

let currentLevel = 1;

const levels = {
  1: { gridSize: 4, numberOfEmojis: 1, decoyCount: 1 },
  2: { gridSize: 6, numberOfEmojis: 4, decoyCount: 2 },
  3: { gridSize: 8, numberOfEmojis: 5, decoyCount: 3 }
};


// 1. Create the grid
// given gridSize (#ofcols) will create grid using CSS property 

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
  const { numberOfEmojis, decoyCount } = levels[currentLevel];    // extract the #of emojis and decoyCount from levels dict based on currentLevel
  
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
// calls the evaluateAttempt function 
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
  let correct = 0;          // #of grids correctly selected 
  let wrong = 0;            // #of grids wrongly selected 
  
  // for of loop to go thru each grid index user selected 
  for (const index of selectedCells) {
    if (decoyPositions.has(index)) {

      // exit game if decoy index is in decoyPositions 
      clearInterval(timerInterval);
      // ! add some description...bandit trips HDQ and wolves catch up to HDQ
      finalizeGame("🦝🦝🦝🦝🦝.");
      return;

      // add 1 to correct 
    } else if (wolfPositions.has(index)) {
      correct++;

      // add 1 to wrong
    } else {
      wrong++;
    }
  }

  // extract vars 
  const { numberOfEmojis } = levels[currentLevel];              // extract numberOfEmojis based on currentLevel
  const selectedCorrectly = correct === numberOfEmojis;         // bool to see if #of correct same as tot #of wolfPositions => eval to True or False
  const exactMatch = selectedCells.size === wolfPositions.size; // bool if # of cells selected == #of wolfPositions 

  // User gets correct 
  if (selectedCorrectly && exactMatch && wrong === 0) {
    // stops the timerInterval repeating action (count down)
    clearInterval(timerInterval);

    // for passing level 1
    if (currentLevel === 1) {
      finalizeGame("🎯 Level 1 passed!");

      // wait 3s
      setTimeout(() => {
        currentLevel = 2;
        startGame();
      }, 3000);

    // passing level 2
    } else if (currentLevel === 2) {
      finalizeGame("🎯 Level 2 passed!");
      setTimeout(() => {
        currentLevel = 3;
        startGame();
      }, 3000);
    } else {
      finalizeGame("🏆 You saved HDQ from the wolves!");
    }

  // if not correct 
  } else if (gameRunning) {
    resultText.innerHTML = `✅ ${correct} out of ${numberOfEmojis} wolves <br>❌ ${wrong} wrong. (${startingAttempts - attemptsLeft + 1}/${startingAttempts} tries)`;
  }
}




// 9. End game logic
function finalizeGame(messagePrefix) {  
  submitBtn.disabled = true;              // submit button cannot be clicked 

  let finalCorrect = 0;
  // count how many wolves user was able to get correct 
  selectedCells.forEach(index => {
    if (wolfPositions.has(index)) {
      finalCorrect++;
    }
  });

  const { numberOfEmojis } = levels[currentLevel];       // access tot #of wolves for this lvl

  // define win condition 
  // - all wolves are selected 
  // - still have attempts left 
  // - still have time left 
  const isWin = (
    finalCorrect === numberOfEmojis &&
    attemptsLeft > 0 &&
    timeLeft > 0
  );


  // // Reveal correct emoji positions (for clarity)
  // document.querySelectorAll('.cell').forEach(cell => {      // loop thru each cell 
  //   const index = parseInt(cell.dataset.index);             // read cell's attribute value 
  //   if (wolfPositions.has(index)) {                         
  //     cell.textContent = emoji;
  //     cell.style.color = 'black';
  //   }
  // });

  // Show the GIF only if they LOST
  if (!isWin) {
    gameContainer.style.display = 'none';
    document.getElementById("end-gif").style.display = 'block';
  }

  resultText.textContent += `\n${messagePrefix}`;

  if (!isWin) {
    playAgainBtn.textContent = "🔁 Play Again";       // add text content to playAgainBtn
    playAgainBtn.style.display = 'inline-block';      // makes playAgainBtn 
  }
}


// define event listener + action for play again button
playAgainBtn.addEventListener("click", () => {
  currentLevel = 1;
  startGame();
});

// 10. Start game (runs each level)
function startGame() {
  gameRunning = true;
  selectedCells.clear();                        // clears prev selected cells
  resultText.textContent = '';                  // clears prev msgs 
  submitBtn.disabled = false;                   // re-enables submit btn 
  playAgainBtn.style.display = 'none';          // hides play again btn 
  attemptsLeft = 3                              // reset attempts each round
  timeLeft = 30                                 // reset time
  clearInterval(timerInterval);                 // stops timer

  const { gridSize } = levels[currentLevel];    // retrieves grid size for current lvl (will be always 1 due to playAgainBtn or 1st time loaded current level declared = 1)
  totalCells = gridSize * gridSize;             

  createGrid(gridSize);                         // create grid 
  gameContainer.style.display = 'grid';         // ensure unhide grid
  document.getElementById("end-gif").style.display = 'none'; // hide the gif 
  generatewolfPositions();                      // generate wolf positions
  showEmojis();                                 // briefly show wolves 
}

// Add event listener to start game (the let's begin btn)
document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("intro-modal").style.display = "none";
  startGame();
});

