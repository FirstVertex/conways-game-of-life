// the viewModel for the game board itself
GameApp.gameBoardViewModelFactory = function (rows, cols) {
    var selectionCells = [],
        currentMode = ko.observable('selection'),
        isSelectionMode = ko.computed(function () {
            return currentMode() === 'selection';
        }),
        isPlayMode = ko.computed(function () {
            return currentMode() === 'play';
        }),
        gameState = ko.observable('Initializing'),
        showGridLines = ko.observable(true),
        isPlaying = ko.observable(false),
        isPaused = ko.computed(function () {
            return !isPlaying();
        }),
        turnCounter = 0,
        gameGrid,
        gameCells = GameApp.sparse2dArray(),
        canvasSize = 900,
        canvas,
        context,
        saveKey = "ConwayGameSave",
        canLoad = ko.observable(localStorage.getItem(saveKey) != undefined),
        saveMessage = ko.observable("Pause the game to enable Save &amp; Load");

    // draw a grid on Html canvas
    function drawGrid(numSquares) {
        var cellSize = canvasSize / numSquares;
        context.beginPath();
        context.strokeStyle = '#ccc';
        context.strokeWidth = 1;
        for (var i = 1; i <= numSquares; i++) {
            var xCoord = i * cellSize;
            context.moveTo(xCoord, 0);
            context.lineTo(xCoord, canvasSize);
            context.stroke();
            context.moveTo(0, xCoord);
            context.lineTo(canvasSize, xCoord);
            context.stroke();
        }
        context.closePath();
    }

    // get the screen coordinates of a cell
    function getCellCoordinates(cell, gameWH, gameSize, cellOffset) {
        var cellSize = canvasSize / gameWH;

        var cellX = cell.x - gameSize.bounds.minX;
        cellX += cellOffset.x;
        cellX *= cellSize;

        var cellY = cell.y - gameSize.bounds.minY;
        cellY += cellOffset.y;
        cellY *= cellSize;

        return {
            x: cellX,
            y: cellY,
            width: cellSize,
            height: cellSize
        };
    }

    // draw the game board on the Html canvas
    function drawGameBoard() {
        // clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // compute the max/min coords and get an absolute size that's square
        var gameSize = gameCells.measure();
        var gameWH = Math.max(10, Math.max(gameSize.width, gameSize.height));
        // draw grid
        if (showGridLines()) {
            drawGrid(gameWH);
        }

        // center the display with this offset
        var cellOffset = {
            x: 0,
            y: 0
        };
        if (gameSize.width != gameWH) {
            cellOffset.x = Math.floor((gameWH - gameSize.width) / 2)
        }
        if (gameSize.height != gameWH) {
            cellOffset.y = Math.floor((gameWH - gameSize.height) / 2)
        }

        gameCells.perItem(function (cell) {
            var rect = getCellCoordinates(cell, gameWH, gameSize, cellOffset);
            // default of black is fine so no need to set the fill brush
            context.fillRect(rect.x, rect.y, rect.width, rect.height);
        });
    }

    // allow the option to be checked/unchecked while paused and still show feedback
    showGridLines.subscribe(function (value) {
        if (!isPlaying()) {
            drawGameBoard();
        }
    });

    // function to run during every iteration of the game
    function gameHeartbeat() {
        gameState("Running turn " + turnCounter);
        
        drawGameBoard();

        if (gameCells.isEmpty()) {
            gameState("Game completed with no survivors after " + turnCounter + " turn" + (turnCounter === 1 ? "." : "s."));
            stopGamePlay();
            return;
        }

        // enforce game rules

        var deadNeighbors = [];
        var dyingNow = [];
        gameCells.perItem(function (cell) {
            var neighbors = gameCells.getItemNeighbors(cell.x, cell.y);
            deadNeighbors = deadNeighbors.concat(neighbors.dontExist);
            if (!cell.gameTurn(Object.keys(neighbors.exist).length)) {
                dyingNow.push(cell);
            }
        });
        _.each(dyingNow, function (cell) {
            gameCells.removeItem(cell.x, cell.y);
        });

        neighborGroups = _.groupBy(deadNeighbors, function (neighbor) {
            return "x:" + neighbor.x + ",y:" + neighbor.y;
        });
        // include newborn cells
        _.forOwn(neighborGroups, function (value, key) {
            if (value.length === 3) {
                gameCells.addItem(GameApp.cellViewModel(value[0].x, value[0].y), value[0].x, value[0].y);
            }
        });
        gameCells.resetCache();
        turnCounter++;
    }

    function animloop() {
        if (!isPlaying()) return;
        requestAnimationFrame(animloop);
        gameHeartbeat();
    }

    function projectSelectionToGameplay() {
        var selectedCells = [];
        _.each(selectionCells, function (selectionRow) {
            selectedCells = selectedCells.concat(_.filter(selectionRow, function (cell) {
                return cell.isSelected();
            }));
        });

        return _.map(selectedCells, function (cell) {
            return GameApp.cellViewModel(cell.x, cell.y);
        });
    }
    
    // begin playing the game
    function startGamePlay() {
        turnCounter = 0;

        gameCells.reset();
        var cells = projectSelectionToGameplay();
        _.each(cells, function (cell) {
            gameCells.addItem(cell, cell.x, cell.y);
        });

        isPlaying(true);
        saveMessage("Pause the game to enable Save &amp; Load");
        animloop();
    }

    // stop playing the game
    function stopGamePlay() {
        isPlaying(false);
        saveMessage("To save the game state, press the Save button");
    }

    // allow the user to pause the game
    function pauseGame() {
        stopGamePlay();
        isPlaying(false);
        gameState("Paused on turn " + turnCounter);
        saveMessage("To save the game state, press the Save button");
    }

    // allow the user to resume the game
    function resumeGame() {
        isPlaying(true);
        saveMessage("Pause the game to enable Save &amp; Load");
        animloop();
    }

    // generate a DTO for saving the game state
    function generateDTO() {
        return {
            showGridLines: showGridLines(),
            turnCounter: turnCounter,
            gameCells: gameCells.flatten()
        };
    }

    // load game state from a DTO
    function loadDTO(dto) {
        showGridLines(dto.showGridLines);
        turnCounter = dto.turnCounter;
        gameCells.reset();
        _.each(dto.gameCells, function (cell) {
            gameCells.addItem(cell, cell.x, cell.y);
        });
    }

    // persist game
    function saveGame() {
        var dto = generateDTO();
        var dtoString = ko.toJSON(dto)
        localStorage.setItem(saveKey, dtoString);
        canLoad(true);
        saveMessage("Game state was saved successfully");
    }

    // load persisted game
    function loadGame() {
        var dtoString = localStorage.getItem(saveKey);
        if (!dtoString) {
            saveMessage("Failed to load Game state");
        } else {
            var dto = JSON.parse(dtoString);
            loadDTO(dto);
            saveMessage("Game state was loaded successfully");
            gameState("Loaded game at turn " + turnCounter);
            drawGameBoard();
        }
    }    

    // transition from selection mode to play mode and back
    function toggleMode() {
        if (isSelectionMode()) {
            currentMode('play');
            setTimeout(function () {
                canvas = document.getElementById('gameCanvas');
                context = canvas.getContext('2d');
                startGamePlay();
            }, 1);
        } else {
            stopGamePlay();
            currentMode('selection');
        }
    }

    // initialize the 2d array of selection cells
    for (var i = 0; i < rows; i++) {
        selectionCells[i] = [];

        for (var j = 0; j < cols; j++) {
            selectionCells[i][j] = GameApp.selectCellViewModel(j, i);
        }
    }

    return {
        rows: rows,
        cols: cols,
        selectionCells: selectionCells,
        toggleMode: toggleMode,
        isSelectionMode: isSelectionMode,
        isPlayMode: isPlayMode,
        gameState: gameState,
        showGridLines: showGridLines,
        pauseGame: pauseGame,
        resumeGame: resumeGame,
        saveGame: saveGame,
        loadGame: loadGame,
        isPlaying: isPlaying,
        isPaused: isPaused,
        canLoad: canLoad,
        saveMessage: saveMessage
    };
}

// instantiate the singleton used by the app
GameApp.gameBoardViewModel = GameApp.gameBoardViewModelFactory(100, 100);

$(function () {
    // the gameBoard is bound to the DOM after document ready
    ko.applyBindings(GameApp.gameBoardViewModel);
});