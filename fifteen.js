// fifteen.js - Implementation of the Fifteen Puzzle game

class FifteenPuzzle {
    constructor() {
        this.boardSize = 4;
        this.tileSize = 100;
        this.moves = 0;
        this.gameStarted = false;
        this.timerInterval = null;
        this.startTime = null;
        this.emptyTile = { row: 3, col: 3 }; 
        this.initializeBoard();
        this.initializeEventListeners();
    }

    initializeBoard() {
        this.board = Array.from({ length: this.boardSize }, (_, row) =>
            Array.from({ length: this.boardSize }, (_, col) => {
                const value = row * this.boardSize + col + 1;
                return value === 16 ? null : value;
            })
        );

        this.renderBoard();
        this.updateMoveableState();
    }

    renderBoard() {
        const container = document.getElementById('puzzle-container');
        container.innerHTML = '';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const value = this.board[row][col];
                if (value !== null) {
                    const tile = document.createElement('div');
                    tile.className = 'puzzle-piece';
                    tile.textContent = value;
                    tile.style.left = (col * this.tileSize) + 'px';
                    tile.style.top = (row * this.tileSize) + 'px';
                    tile.style.backgroundPosition = 
                        `${-col * this.tileSize}px ${-row * this.tileSize}px`;
                    tile.dataset.row = row;
                    tile.dataset.col = col;
                    
                    container.appendChild(tile);
                }
            }
        }
    }

    initializeEventListeners() {
        const container = document.getElementById('puzzle-container');
        container.addEventListener('click', (e) => this.handleTileClick(e));
        
        document.getElementById('shuffle').addEventListener('click', 
            () => this.shuffle());

        // Add mouseover/mouseout events for movable pieces
        container.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('puzzle-piece')) {
                this.updateMoveableState();
            }
        });
    }

    isMovable(row, col) {
        return (
            (Math.abs(row - this.emptyTile.row) === 1 && col === this.emptyTile.col) ||
            (Math.abs(col - this.emptyTile.col) === 1 && row === this.emptyTile.row)
        );
    }

    updateMoveableState() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        pieces.forEach(piece => {
            const row = parseInt(piece.dataset.row);
            const col = parseInt(piece.dataset.col);
            if (this.isMovable(row, col)) {
                piece.classList.add('movablepiece');
            } else {
                piece.classList.remove('movablepiece');
            }
        });
    }

    handleTileClick(e) {
        if (!e.target.classList.contains('puzzle-piece')) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        if (this.isMovable(row, col)) {
            this.moveTile(row, col);
            this.moves++;
            document.getElementById('moves').textContent = `Moves: ${this.moves}`;
            
            if (!this.gameStarted) {
                this.startTimer();
                this.gameStarted = true;
            }

            if (this.checkWin()) {
                this.handleWin();
            }
        }
    }

    moveTile(row, col) {
        // Swap the tile with empty space
        const value = this.board[row][col];
        this.board[row][col] = null;
        this.board[this.emptyTile.row][this.emptyTile.col] = value;

        // Update empty tile position
        const oldEmpty = { ...this.emptyTile };
        this.emptyTile = { row, col };

        // Update the visual position of the tile
        this.renderBoard();
        this.updateMoveableState();
    }

    shuffle() {
        // Reset game state
        this.moves = 0;
        this.gameStarted = false;
        document.getElementById('moves').textContent = 'Moves: 0';
        this.stopTimer();

        // Perform random moves
        for (let i = 0; i < 200; i++) {
            const movableTiles = [];
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    if (this.isMovable(row, col) && this.board[row][col] !== null) {
                        movableTiles.push({ row, col });
                    }
                }
            }
            const randomTile = movableTiles[
                Math.floor(Math.random() * movableTiles.length)
            ];
            this.moveTile(randomTile.row, randomTile.col);
        }
    }

    checkWin() {
        let count = 1;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (row === this.boardSize - 1 && 
                    col === this.boardSize - 1) {
                    return this.board[row][col] === null;
                }
                if (this.board[row][col] !== count) {
                    return false;
                }
                count++;
            }
        }
        return true;
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('timer').textContent = 
                `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        document.getElementById('timer').textContent = 'Time: 0:00';
    }

    handleWin() {
        this.stopTimer();
        this.gameStarted = false;
        alert(`Congratulations! You solved the puzzle in ${this.moves} moves!`);
    }
}

// Initialize the game when the page loads
window.onload = () => {
    const game = new FifteenPuzzle();
};