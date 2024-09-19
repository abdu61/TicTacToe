document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const roundsInput = document.getElementById('rounds');
    const opponentSelect = document.getElementById('opponent');
    const difficultySelect = document.getElementById('difficulty');
    const playerNameInput = document.getElementById('player-name');
    const modal = document.getElementById('summary-modal');
    const closeModal = document.querySelector('.close');
    const summaryText = document.getElementById('summary-text');
    const playerScoreDisplay = document.getElementById('player-score');
    const computerScoreDisplay = document.getElementById('computer-score');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let rounds = 1;
    let currentRound = 1;
    let opponent = 'computer';
    let difficulty = 'medium';
    let playerName = 'player 2';
    let playerScore = 0;
    let computerScore = 0;

    opponentSelect.addEventListener('change', () => {
        opponent = opponentSelect.value;
        playerNameInput.style.display = opponent === 'player' ? 'block' : 'none';
        if (opponent === 'player')
            updateScore();
    });

    difficultySelect.addEventListener('change', () => {
        difficulty = difficultySelect.value;
    });

    playerNameInput.addEventListener('input', () => {
        playerName = playerNameInput.value;
    });

    roundsInput.addEventListener('input', () => {
        rounds = parseInt(roundsInput.value);
    });

    cells.forEach(cell => {
        cell.addEventListener('click', () => handleCellClick(cell));
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        resetGame(true);
    });

    function handleCellClick(cell) {
        const index = cell.getAttribute('data-index');
        if (board[index] !== '' || !gameActive) return;

        board[index] = currentPlayer;
        cell.textContent = currentPlayer;

        if (checkWin()) {
            gameActive = false;
            if (currentPlayer === 'X') {
                playerScore++;
                updateScore();
                if (currentRound >= rounds) {
                    showSummary('You Win!');
                } else {
                    resetGame(false);
                }
            } else {
                computerScore++;
                updateScore();
                if (currentRound >= rounds) {
                    showSummary('You Lose!');
                } else {
                    resetGame(false);
                }
            }
        } else if (board.every(cell => cell !== '')) {
            gameActive = false;
            if (currentRound >= rounds) {
                showSummary('It\'s a draw!');
            } else {
                resetGame(false);
            }
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (opponent === 'computer' && currentPlayer === 'O') {
                setTimeout(computerMove, 500); // Add delay for computer move
            }
        }
    }

    function computerMove() {
        let emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
        let moveIndex;

        if (difficulty === 'easy') {
            moveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } else if (difficulty === 'medium') {
            moveIndex = findBestMove('O') || emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } else if (difficulty === 'hard') {
            moveIndex = minimax(board, 'O').index;
        }

        board[moveIndex] = 'O';
        document.querySelector(`.cell[data-index="${moveIndex}"]`).textContent = 'O';
        if (checkWin()) {
            gameActive = false;
            computerScore++;
            updateScore();
            if (currentRound >= rounds) {
                showSummary('You Lose!');
            } else {
                resetGame(false);
            }
        } else if (board.every(cell => cell !== '')) {
            gameActive = false;
            if (currentRound >= rounds) {
                showSummary('It\'s a draw!');
            } else {
                resetGame(false);
            }
        } else {
            currentPlayer = 'X';
        }
    }

    function findBestMove(player) {
        const opponent = player === 'O' ? 'X' : 'O';
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = player;
                if (checkWin()) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = opponent;
                if (checkWin()) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        return null;
    }

    function minimax(newBoard, player) {
        const availSpots = newBoard.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
        const opponent = player === 'O' ? 'X' : 'O';

        if (checkWinForPlayer(newBoard, 'X')) {
            return { score: -10 };
        } else if (checkWinForPlayer(newBoard, 'O')) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            const move = {};
            move.index = availSpots[i];
            newBoard[availSpots[i]] = player;

            if (player === 'O') {
                const result = minimax(newBoard, 'X');
                move.score = result.score;
            } else {
                const result = minimax(newBoard, 'O');
                move.score = result.score;
            }

            newBoard[availSpots[i]] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === 'O') {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    function checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winPatterns.some(pattern => {
            return pattern.every(index => board[index] === currentPlayer);
        });
    }

    function checkWinForPlayer(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winPatterns.some(pattern => {
            return pattern.every(index => board[index] === player);
        });
    }

    function showSummary(message) {
        if (opponent === 'computer') {
            summaryText.innerHTML = `${message}<br><br>Final Score: You ${playerScore} : ${computerScore} Computer`;
        } else {
            summaryText.innerHTML = `${message}<br><br>Final Score: Player 1 ${playerScore} : ${computerScore} ${playerName}`;
        }
        modal.style.display = 'block';
    }

    function updateScore() {
        playerScoreDisplay.textContent = `Player: ${playerScore}`;
        if(opponent === 'computer'){
        computerScoreDisplay.textContent = `Computer: ${computerScore}`;
        } else {
            computerScoreDisplay.textContent = `${playerName}: ${computerScore}`;
        }
    }

    function updateRound() {
        document.getElementById('rounds').value = 1;
    }

    function resetGame(resetScores) {
        board = ['', '', '', '', '', '', '', '', ''];
        cells.forEach(cell => cell.textContent = '');
        currentPlayer = 'X';
        gameActive = true;
        if (resetScores) {
            playerScore = 0;
            computerScore = 0;
            currentRound = 1;
            updateRound();
            updateScore();
        } else {
            currentRound++;
        }
    }
});