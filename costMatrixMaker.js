var costMatrixMaker = function (room) {
    var matrix = new PathFinder.CostMatrix();
    for (var x = 0; x < 50; x++) {
        for (var y = 14; y < 15; y++) {
            var cost = getCostForPos(room.getPositionAt(x, y));
            matrix.set(x, y, cost);
        }
    }
    return matrix;

    function getCostForPos(pos) {
        var cost = 2;
        var things = pos.look();
        for (var i in things) {
            //console.log(JSON.stringify(things[i]));
            var thing = things[i];
            if (thing.type == "terrain") {
                if (thing.terrain == "wall") {
                    cost += 10;
                }
                if (thing.terrain == "swamp") {
                    cost += 8;
                }
            }
            if (thing.type == "creep") {
                cost += 1;
            }
            if (thing.type == "structure") {
                if (thing.structure.structureType == "constructedWall") {
                    cost += 10;
                } else if (thing.structure.structureType == "road") {
                    //console.log("is road");
                    cost -= 10;
                } else {
                    cost += 5;
                }
            }

        }
        if (pos.x == 0 || pos.y == 0) {
            cost += 4;
        }
        if (cost <= 0) {
            cost = 1;
        }
        return cost;
    }
}
module.exports = costMatrixMaker;

