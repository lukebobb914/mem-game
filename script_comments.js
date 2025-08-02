const gridSize = 4;
const totalCells = gridSize * gridSize;
const emoji = "🐺";
const numberOfEmojis = 6;

// get DOM elements 
const gameContainer = document.getElementById("game-grid");
const submitBtn = document.getElementById("submit-btn");
const resultText = document.getElementById("result");

// declare sets 
let emojiPositions = new Set();     // stores position of wolves 
let selectedCells = new Set();      // stores cells selected by user

// 1. Create the grid
function createGrid() {
  gameContainer.innerHTML = '';     // clears previous grid 

  // Creates div for each cell in totalCells 
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");     // create div element for that cell 
    cell.classList.add("cell");                     // add CSS class 'cell' to div     
    cell.dataset.index = i;
    gameContainer.appendChild(cell);
  }
}

// 2. Randomly place emojis into set 
function generateEmojiPositions() {
  emojiPositions.clear();       // clear set 
  // keeps going until required amount of unique emohi positions
  while (emojiPositions.size < numberOfEmojis) {    
    const rand = Math.floor(Math.random() * totalCells);
    emojiPositions.add(rand);
  }
}

// 3. Show emojis briefly
function showEmojis() {
  document.querySelectorAll('.cell').forEach(cell => {
    const index = parseInt(cell.dataset.index);
    if (emojiPositions.has(index)) {
      cell.textContent = emoji;
    }
  });

  setTimeout(() => {
    hideEmojis();
    enableSelection();
  }, 2000); // show for 2 seconds
}

function hideEmojis() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '';
  });
}

// 4. Let player select cells
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

// 5. Check result
submitBtn.addEventListener("click", () => {
  let correct = 0;
  selectedCells.forEach(index => {
    if (emojiPositions.has(index)) {
      correct++;
    }
  });

  resultText.textContent = `You got ${correct} out of ${numberOfEmojis} correct! 🎯`;
  submitBtn.disabled = true;
});

// Start the game
function startGame() {
  selectedCells.clear();
  resultText.textContent = '';
  submitBtn.disabled = false;
  createGrid();
  generateEmojiPositions();
  showEmojis();
}

startGame();
