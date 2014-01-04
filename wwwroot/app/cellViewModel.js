// a viewModel to represent a cell during the game play
GameApp.cellViewModel = function (x, y) {
    var currentState = true;
    var nextState = false;
    
    function gameTurn(cellNeighbors) {
        var numNeighbors = cellNeighbors.live.length;
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
    function equals(coordX, coordY) {
        return (coordX === x) && (coordY === y);
    }

    return {
        x: x,
        y: y,
        currentState: currentState,
        transitionToNextState: transitionToNextState,
        gameTurn: gameTurn,
        equals: equals
    };
}