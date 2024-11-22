/*jslint browser: true, long: true */
/*global window */

var createFifteenPuzzle;

createFifteenPuzzle = function () {
    function Game() {
        var boardSize;
        var tileSize;
        var moves;
        var gameStarted;
        var timerInterval;
        var startTime;
        var emptyTile;
        var board;
        var bestMoves;
        var bestTime;
        
        function isMovable(row, col) {
            var rowDiff = Math.abs(row - emptyTile.row);
            var colDiff = Math.abs(col - emptyTile.col);
            return (rowDiff === 1 && col === emptyTile.col) ||
                (colDiff === 1 && row === emptyTile.row);
        }

        function updateMoveableState() {
            var pieces = document.querySelectorAll(".puzzle-piece");
            pieces.forEach(function (piece) {
                var row = parseInt(piece.dataset.row, 10);
                var col = parseInt(piece.dataset.col, 10);
                if (isMovable(row, col)) {
                    piece.classList.add("movablepiece");
                } else {
                    piece.classList.remove("movablepiece");
                }
            });
        }

        function renderBoard() {
            var container = document.getElementById("puzzle-container");
            var i;
            var j;
            var value;
            var tile;
            container.innerHTML = "";
            i = 0;
            while (i < boardSize) {
                j = 0;
                while (j < boardSize) {
                    value = board[i][j];
                    if (value !== null) {
                        tile = document.createElement("div");
                        tile.className = "puzzle-piece";
                        tile.textContent = value;
                        tile.style.left = String(j * tileSize) + "px";
                        tile.style.top = String(i * tileSize) + "px";
                        tile.style.backgroundPosition = 
                            String(-j * tileSize) + "px " + 
                            String(-i * tileSize) + "px";
                        tile.dataset.row = i;
                        tile.dataset.col = j;
                        container.appendChild(tile);
                    }
                    j += 1;
                }
                i += 1;
            }
        }

        function updateStats() {
            document.getElementById("moves").textContent = 
                "Moves: " + String(moves);
            
            if (startTime) {
                var currentTime = Math.floor((Date.now() - startTime) / 1000);
                var minutes = Math.floor(currentTime / 60);
                var seconds = currentTime % 60;
                document.getElementById("timer").textContent = 
                    "Time: " + String(minutes) + ":" + 
                    String(seconds).padStart(2, "0");
            }
        }

        function startTimer() {
            if (timerInterval) {
                return;
            }
            startTime = Date.now();
            timerInterval = window.setInterval(function () {
                updateStats();
            }, 1000);
        }

        function stopTimer() {
            if (timerInterval) {
                window.clearInterval(timerInterval);
                timerInterval = null;
            }
            startTime = null;
            document.getElementById("timer").textContent = "Time: 0:00";
        }

        function formatTime(totalSeconds) {
            var minutes = Math.floor(totalSeconds / 60);
            var seconds = totalSeconds % 60;
            return String(minutes) + ":" + String(seconds).padStart(2, "0");
        }

        function handleWin() {
            var currentTime = Math.floor((Date.now() - startTime) / 1000);
            stopTimer();
            gameStarted = false;
            
            if (!bestTime || currentTime < bestTime) {
                bestTime = currentTime;
            }
            if (!bestMoves || moves < bestMoves) {
                bestMoves = moves;
            }

            var message = String("Congratulations! Puzzle solved!\n") +
                "Time: " + formatTime(currentTime) + "\n" +
                "Moves: " + String(moves) + "\n\n" +
                "Best Time: " + formatTime(bestTime) + "\n" +
                "Best Moves: " + String(bestMoves);
            
            window.alert(message);
        }

        function checkWin() {
            var count = 1;
            var row;
            var col;
            row = 0;
            while (row < boardSize) {
                col = 0;
                while (col < boardSize) {
                    if (row === boardSize - 1 && col === boardSize - 1) {
                        return board[row][col] === null;
                    }
                    if (board[row][col] !== count) {
                        return false;
                    }
                    count += 1;
                    col += 1;
                }
                row += 1;
            }
            return true;
        }

        function moveTile(row, col) {
            var value = board[row][col];
            board[row][col] = null;
            board[emptyTile.row][emptyTile.col] = value;
            emptyTile = {
                "col": col,
                "row": row
            };
            renderBoard();
            updateMoveableState();
        }

        function handleTileClick(e) {
            var row;
            var col;

            if (!e.target.classList.contains("puzzle-piece")) {
                return;
            }

            row = parseInt(e.target.dataset.row, 10);
            col = parseInt(e.target.dataset.col, 10);

            if (isMovable(row, col)) {
                moveTile(row, col);
                moves += 1;
                updateStats();
                
                if (!gameStarted) {
                    gameStarted = true;
                    startTimer();
                }

                if (checkWin()) {
                    handleWin();
                }
            }
        }

        function shuffle() {
            var i;
            var row;
            var col;
            var movableTiles;
            var randomIndex;
            var randomTile;

            moves = 0;
            gameStarted = false;
            stopTimer();

            i = 0;
            while (i < 200) {
                movableTiles = [];
                row = 0;
                while (row < boardSize) {
                    col = 0;
                    while (col < boardSize) {
                        if (isMovable(row, col) && board[row][col] !== null) {
                            movableTiles.push({
                                "col": col,
                                "row": row
                            });
                        }
                        col += 1;
                    }
                    row += 1;
                }
                
                randomIndex = Math.floor(Math.random() * movableTiles.length);
                randomTile = movableTiles[randomIndex];
                moveTile(randomTile.row, randomTile.col);
                i += 1;
            }
            
            updateStats();
        }

        function initializeBoard() {
            var row;
            var col;
            board = [];
            row = 0;
            while (row < boardSize) {
                board[row] = [];
                col = 0;
                while (col < boardSize) {
                    board[row][col] = row * boardSize + col + 1;
                    if (row === boardSize - 1 && col === boardSize - 1) {
                        board[row][col] = null;
                    }
                    col += 1;
                }
                row += 1;
            }
            renderBoard();
            updateMoveableState();
        }

        function initializeEventListeners() {
            var container = document.getElementById("puzzle-container");
            var shuffleButton = document.getElementById("shuffle");
            
            if (container) {
                container.addEventListener("click", handleTileClick);
                container.addEventListener("mouseover", function (e) {
                    if (e.target.classList.contains("puzzle-piece")) {
                        updateMoveableState();
                    }
                });
            }

            if (shuffleButton) {
                shuffleButton.removeEventListener("click", shuffle);
                shuffleButton.addEventListener("click", shuffle);
            }
        }

        function init() {
            boardSize = 4;
            tileSize = 100;
            moves = 0;
            gameStarted = false;
            timerInterval = null;
            startTime = null;
            bestMoves = null;
            bestTime = null;
            emptyTile = {
                "col": 3,
                "row": 3
            };
            
            initializeBoard();
            initializeEventListeners();
            updateStats();
        }

        init();
    }

    return Game;
};

window.onload = function () {
    new (createFifteenPuzzle())();
};