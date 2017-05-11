var roleHarvester = require("role.harvester");
var roleTowerRenewer = Object.assign({}, roleHarvester, {
    isTarget: function (structure) {
        return structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity - 100;
    },
    maxToCreate: (room) => {
        return room.find(FIND_MY_STRUCTURES, {
           filter: (s) => s.structureType == STRUCTURE_TOWER
        }).length;
    },
    myType: "towerRenewer",
    units: [WORK, MOVE, MOVE, MOVE, CARRY, CARRY],
    getUnits: function (spawn) {
        var units = [];
        for (var i = 0; i < spawn.room.energyCapacityAvailable; i += 600) {
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
        strokeWidth: 0.2,
        opacity: 1,
        lineStyle: undefined
    },
    findTarget: function (targets, creep) {
        if (targets.length === 0) {
            return;
        }
        var lastRenewed = -1;
        if (typeof creep.memory.lastRenewed !== "undefined") {
            //   lastRenewed = creep.memory.lastRenewed;
        }
        targets.sort(this.sortTargets.bind(null, creep));
        var a = targets.pop();
        //console.log("selecting "+a.id);
        return a;
    },
    sortTargets: function (creep, a, b) {
        if (a.energy < b.energy - 100) {
            //console.log(a.id+" has much less energy than "+b.id);
            return 1;
        }
        if (b.energy < a.energy - 100) {
            //console.log(a.id+" has much more energy than "+b.id);
            return -1;
        }
        var aDist = creep.pos.getRangeTo(a);
        var bDist = creep.pos.getRangeTo(b);
        //console.log(JSON.stringify(a) + " " + aDist);
        //console.log(JSON.stringify(b) + " " +bDist);
        if (aDist < bDist) {
            //console.log(a.id+" is nearer than "+b.id+ "("+aDist+"/"+bDist+")");
            return 1;
        }
        if (aDist > bDist) {
            //console.log(a.id+" is further than "+b.id+ "("+aDist+"/"+bDist+")");
            return -1;
        }
        //console.log("equal");
        return 0;
    },
    spawnInit: function () {
        return true;
    }
});
module.exports = roleTowerRenewer;