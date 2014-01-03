// a viewModel to enable clicking to select for the initial setup
GameApp.selectCellViewModel = function (x, y) {
    var isSelected = ko.observable(false);
    function toggle() {
        isSelected(!isSelected());
    }
    return {
        x: x,
        y: y,
        isSelected: isSelected,
        toggle: toggle
    };
}