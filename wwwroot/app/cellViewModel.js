// a viewModel to represent a cell during the game play
GameApp.cellViewModel = function (x, y) {
    var currentState = true;
    
    function gameTurn(neighborCount) {
        currentState = (neighborCount === 2 || neighborCount === 3);
        return currentState;
    }

    return {
        x: x,
        y: y,
        currentState: currentState,
        gameTurn: gameTurn,
    };
}