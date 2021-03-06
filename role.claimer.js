var baseRole = require("baseRole");
module.exports = {
    units: [MOVE, MOVE, MOVE, MOVE, MOVE, CLAIM],
    myType: "claimer",
    maxToCreate: (room) => {
        switch (room.name) {
            case "W13S8":
                return 0;
            default:
                return 0;
        }
    },
    lineStyle: {
        stroke: '#ff0000',
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
        if (creep.room.name == "W12S7") {
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
            creep.signController(source, "Bosh!");
            if (result == ERR_NOT_IN_RANGE) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                creep.moveTo(source, { visualizePathStyle: this.lineStyle });
            } else if (result !== OK) {
                console.log("Can't claim - " + result);
            }
            return;
        }
        if (creep.fatigue > 0) {
            creep.say("😴💤")
            return
        }
        var move = creep.moveTo(new RoomPosition(18, 39, "W12S7"), { visualizePathStyle: this.lineStyle, ignoreCreeps: true, maxRooms: 64 });
        if (move !== OK) {
            console.log("Claim move result " + move);
            creep.say("!")
        } else {
            creep.say("CLAIM")
        }
    }
};