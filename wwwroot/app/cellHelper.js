// a helper class to work with groups of cells
GameApp.cellHelper = {
    countNeighbors: function (cellX, cellY, group) {
        return _.reduce(group, function (sum, item) {
            var xDiff = item.x - cellX,
                yDiff = item.y - cellY;
            if (xDiff === 0 && yDiff === 0) return sum;
            return sum + ((Math.abs(xDiff) <= 1 && Math.abs(yDiff) <= 1) ? 1 : 0);
        }, 0);
    },
    getNeighbors: function (cell, group) {
        return _.reduce(group, function (sum, item) {
            var xDiff = item.x - cell.x,
                yDiff = item.y - cell.y;
            if ((xDiff != 0 || yDiff != 0) && (Math.abs(xDiff) <= 1 && Math.abs(yDiff) <= 1)) {
                sum.push(item);
            }
            return sum;
        }, []);
    },
    getGameCells: function (selectionCells) {
        var selectedCells = [];
        _.each(selectionCells, function (selectionRow) {
            selectedCells = selectedCells.concat(_.filter(selectionRow, function (cell) {
                return cell.isSelected();
            }));
        });

        return _.map(selectedCells, function (cell) {
            return GameApp.cellViewModel(cell.x, cell.y);
        });
    },
    measureCells: function (cells) {
        var bounds = {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0
        };
        if (cells && cells.length > 0) {
            bounds.minX = cells[0].x;
            bounds.minY = cells[0].y;
            bounds.maxX = cells[0].x;
            bounds.maxY = cells[0].y;

            _.each(cells, function (cell) {
                bounds.minX = Math.min(bounds.minX, cell.x);
                bounds.minY = Math.min(bounds.minY, cell.y);
                bounds.maxX = Math.max(bounds.maxX, cell.x);
                bounds.maxY = Math.max(bounds.maxY, cell.y);
            });
        }
        return {
            width: 1 + (bounds.maxX - bounds.minX),
            height: 1 + (bounds.maxY - bounds.minY),
            bounds: bounds
        }
    }
};