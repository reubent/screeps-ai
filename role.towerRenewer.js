var roleHarvester = require("role.harvester");
var roleTowerRenewer = Object.assign({}, roleHarvester, {
    isTarget: function (structure) {
        return structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity - 100;
    },
    maxToCreate: (room) => {
        var j = room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_TOWER
        }).length;

        return (j > 0) ? 1 : 0;
    },
    myType: "towerRenewer",
    units: [MOVE, CARRY],
    getUnits: function (spawn) {
        var units = [WORK];
        for (var i = 0; i < spawn.room.energyCapacityAvailable && i < 1600; i += 300) {
            units = units.concat(this.units);
        }
        console.log("towerRenewer: " + JSON.stringify(units));
        return units;
    },
    initSpawn: function (spawn) {
        return true;
    },
    lineStyle: {
        stroke: '#aa00ff',
        strokeWidth: 0.1,
        opacity: 0.8,
        lineStyle: undefined
    },
    spawnInit: function () {
        return true;
    }
});
module.exports = roleTowerRenewer;