// a viewModel to represent a cell during the game play
GameApp.cellViewModel = function (x, y) {
    var currentState = true;
    var nextState = false;
    
    function gameTurn(allCells) {
        var cellNeighbors = GameApp.cellHelper.getNeighbors(self, allCells);
        var numNeighbors = cellNeighbors.length;
        if (numNeighbors === 3 || numNeighbors === 2) {
            nextState = true;
        } else {
            nextState = false;
        }
        return cellNeighbors;
    }
    function transitionToNextState() {
        currentState = nextState;
        nextState = false;
        return currentState;
    }

    var self = {
        x: x,
        y: y,
        currentState: currentState,
        transitionToNextState: transitionToNextState,
        gameTurn: gameTurn
    }
    return self;
}