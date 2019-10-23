var baseRole = require("baseRole");
module.exports = {
    units: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM],
    myType: "unclaimer",
    maxToCreate: (room) => {
        switch (room.name) {
            //case "W18S9":
            //    return Game.time % 300 == 0;
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
    getTarget: function (creep) {
        if (!creep.memory.target) {
            var seed = Math.random()
            if (seed < 0.33333) {
                creep.memory.target = "W12S7"
            } else if (seed < 0.666667) {
                creep.memory.target = "W11S7"
            } else {
                creep.memory.target = "W11S8"
            }
        }
        return creep.memory.target;
    },
    run: function (creep) {
        creep.say("Unclaim", true);
        if (creep.fatigue > 0) {
            creep.say("Tired 😟");
            return;
        }
        if (creep.room.name == this.getTarget(creep)) {
            console.log("In room!");
            var source = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function (o) {
                    return o.structureType == STRUCTURE_CONTROLLER;
                }
            });
            if (!source) {
                console.log("Can't find controller");
            }
            var result = creep.attackController(source);
            creep.signController(source, "Bosh!");
            if (result == ERR_NOT_IN_RANGE) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                var res = creep.moveTo(source, { visualizePathStyle: this.lineStyle });
            } else if (result !== OK) {
                console.log("Can't unclaim - " + result);
            }
            return;
        }
        if (creep.fatigue > 0) {
            creep.say("😴💤")
            return
        }
        var move = creep.moveTo(new RoomPosition(10, 10, this.getTarget(creep)), { visualizePathStyle: this.lineStyle, ignoreCreeps: true, maxOps: 1000 });
        if (move !== OK) {
            console.log("Unclaim move result " + move);
            creep.say("!")
        } else {
            creep.say("UNCLAIM")
        }
    }
};