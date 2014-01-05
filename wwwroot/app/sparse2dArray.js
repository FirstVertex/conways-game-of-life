// a model for a sparse 2 dimensional array
GameApp.sparse2dArray = function () {
    var items = {};

    function xExists(x) {
        return items[x] != undefined;
    }

    function addItem(item, x, y) {
        if (!xExists(x)) {
            items[x] = {};
        }
        items[x][y] = item;
    }

    function removeItem(x, y) {
        if (xExists(x)) {
            delete items[x][y];
            if (Object.keys(items[x]).length === 0) {
                delete items[x];
            }
        }
    }

    function getItem(x, y) {
        if (xExists(x)) {
            return items[x][y];
        } else {
            return undefined;
        }
    }

    function itemExists(x, y) {
        return (getItem(x, y) != undefined);
    }

    function getItemNeighbors(x, y) {
        var result = {
            exist: [],
            dontExist: []
        };
        for (var i = x - 1; i <= x + 1; i++) {
            for (var j = y - 1; j <= y + 1; j++) {
                if (!((i === x) && (j === y))) {
                    var liveItem = getItem(i, j);
                    if (liveItem) {
                        result.exist.push(liveItem);
                    }
                    else {
                        result.dontExist.push({
                            x: i,
                            y: j
                        });
                    }
                }
            }
        }
        return result;
    }

    var _cachedFlat;
    function flatten() {
        if (_cachedFlat) {
            return _cachedFlat;
        }
        var result = [];

        // have to be careful with each because of the possibility of a negative index
        var rowKeys = _.keys(items);
        _.each(rowKeys, function (rowKey) {
            var row = items[rowKey];

            if (row) {
                var colKeys = _.keys(row);

                _.each(colKeys, function (colKey) {
                    var item = row[colKey];
                    if (item) {
                        result.push(item);
                    }
                });
            }
        });
        _cachedFlat = result;
        return result;
    }

    function resetCache() {
        _cachedFlat = null;
    }

    function measure () {
        var bounds = {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0
        };
        var cells = flatten();
        if (cells.length > 0) {
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
        };
    }

    function reset() {
        items = [];
    }

    function perItem(callback) {
        var cells = flatten();
        _.each(cells, callback);
    }

    function isEmpty() {
        return flatten().length === 0;
    }

    return {
        addItem: addItem,
        removeItem: removeItem,
        getItem: getItem,
        itemExists: itemExists,
        getItemNeighbors: getItemNeighbors,
        flatten: flatten,
        measure: measure,
        reset: reset,
        perItem: perItem,
        isEmpty: isEmpty,
        resetCache: resetCache
    };
}