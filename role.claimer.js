var baseRole = require("baseRole");
module.exports = {
    units: [MOVE, MOVE, MOVE, MOVE, MOVE, CLAIM],
    myType: "claimer",
    maxToCreate: 0,
    lineStyle: {
        stroke: '#aaffaa',
        strokeWidth: 0.4,
        opacity: 1,
        lineStyle: undefined
    },
    doSpawn: baseRole.doSpawn,
    doHarvest: baseRole.doHarvest,
    handleTtl: function () {
        return false;
    },
    run: function (creep) {
        creep.say("Claim", true);
        if (creep.fatigue > 0) {
            creep.say("Tired 😟");
            return;
        }
        if (creep.room.name == "W18S5") {
            console.log("In room!");
            var source = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function (o) {
                    return o.structureType == STRUCTURE_CONTROLLER;
                }
            });
            if (!source) {
                console.log("Can't find controller");
            }
            var result = creep.claimController(source);
            creep.signController(source, "Reuben was here");
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: this.lineStyle});
            } else if (result !== OK) {
                console.log("Can't claim - " + result);
            }
            return;
        }
        var move = creep.moveTo(new RoomPosition(14, 42, "W18S5"), {visualizePathStyle: this.lineStyle});
        if (move !== OK) {
            console.log("Claim move result " + move);
        }
    }
};