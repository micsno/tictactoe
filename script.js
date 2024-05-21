// script.js
const cells = document.querySelectorAll('[data-cell]'); // Get all cells
const board = document.getElementById('board'); // Get the board
const messageElement = document.getElementById('message'); // Get the message element
const restartButton = document.getElementById('restartButton'); // Get the restart button
const difficultySelect = document.getElementById('difficulty'); // Get the difficulty select

let currentPlayer = 'X'; // Set the current player
let boardState = ['', '', '', '', '', '', '', '', '']; // Set the board state
let isGameActive = true; // Set the game to active

const WINNING_COMBINATIONS = [ // All possible winning combinations
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

cells.forEach(cell => { // Add click event listener to each cell
    cell.addEventListener('click', handleCellClick, { once: true }); // Handle cell click event
});

restartButton.addEventListener('click', restartGame); // Add click event listener to restart button
difficultySelect.addEventListener('change', restartGame); // Add change event listener to difficulty select

function handleCellClick(e) { // Handle cell click event
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (boardState[cellIndex] !== '' || !isGameActive) return; // If cell is already filled or game is over, return

    placeMark(cell, cellIndex); // Place mark on the cell
    if (checkWin(currentPlayer)) { // Check if the current player has won
        endGame(false); // End the game with a win
    } else if (isDraw()) { // Check if it's a draw
        endGame(true); // End the game with a draw
    } else { // Switch player if game is not over
        switchPlayer(); // Switch the player
        if (currentPlayer === 'O') { // If the current player is O, make the AI move
            makeAIMove(); // Make the AI move
        }
    }
}

function placeMark(cell, index) { // Place mark on the cell
    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
}

function switchPlayer() { // Switch the player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function checkWin(player) { // Check if the player has won
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return boardState[index] === player;
        });
    });
}

function isDraw() { // Check if it's a draw
    return boardState.every(cell => { // Check if all cells are filled
        return cell !== ''; // If all cells are filled, return true
    });
}

function endGame(draw) { // End the game
    isGameActive = false; // Set game to inactive
    if (draw) { // If it's a draw
        messageElement.textContent = "Draw!"; // Display draw message
    } else { // If there's a winner
        messageElement.textContent = `${currentPlayer} Wins!`; // Display winner message
    }
}

function restartGame() { // Restart the game
    currentPlayer = 'X'; 
    boardState = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    messageElement.textContent = '';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.addEventListener('click', handleCellClick, { once: true });
    });
}

function makeAIMove() { // Make the AI move
    const difficulty = difficultySelect.value;
    let move;
    if (difficulty === 'easy') {
        move = getRandomMove();
    } else if (difficulty === 'medium') {
        move = getMediumMove();
    } else {
        move = getBestMove();
    }
    placeMark(cells[move], move); // Place mark on the cell
    if (checkWin(currentPlayer)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        switchPlayer();
    }
}

function getRandomMove() { // Get a random move
    const availableMoves = boardState 
        .map((cell, index) => cell === '' ? index : null)
        .filter(index => index !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getMediumMove() {
    for (const combination of WINNING_COMBINATIONS) { 
        const [a, b, c] = combination;
        if (boardState[a] === 'O' && boardState[b] === 'O' && boardState[c] === '') return c;
        if (boardState[a] === 'O' && boardState[c] === 'O' && boardState[b] === '') return b;
        if (boardState[b] === 'O' && boardState[c] === 'O' && boardState[a] === '') return a;
    }
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (boardState[a] === 'X' && boardState[b] === 'X' && boardState[c] === '') return c;
        if (boardState[a] === 'X' && boardState[c] === 'X' && boardState[b] === '') return b;
        if (boardState[b] === 'X' && boardState[c] === 'X' && boardState[a] === '') return a;
    }
    return getRandomMove();
}

function getBestMove() { // Get the best move using minimax algorithm
    let bestScore = -Infinity; 
    let move; 
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            boardState[i] = 'O';
            let score = minimax(boardState, 0, false);
            boardState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) { // Minimax algorithm
    let scores = { 'X': -1, 'O': 1, 'Draw': 0 }; 
    if (checkWin('O')) return scores['O'];
    if (checkWin('X')) return scores['X'];
    if (isDraw()) return scores['Draw'];

    if (isMaximizing) { 
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore; 
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}
