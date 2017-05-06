var baseRole = require("baseRole");
module.exports = {
    units: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH],
    myType: "attacker",
    maxToCreate: 0,
    lineStyle: {
        stroke: '#ff6666',
        strokeWidth: 0.3,
        opacity: 1,
        lineStyle: undefined
    },
    doSpawn: baseRole.doSpawn,
    handleTtl: baseRole.handleTtl,
    run: function (creep) {
        if (creep.room.name == "W11S2") {
            creep.say("Hello!", true);
            var vector = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (!vector) {
                vector = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: function (o) {
                        if (o.structureType == STRUCTURE_CONTROLLER) {
                            return false;
                        }
                        return true;
                    }
                });
            }
            if (!vector) {
                var result = creep.signController(creep.room.controller, "Hello! Sorry to have destroyed everything.");
                if (result !== OK) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: this.lineStyle});
                }
                return;
            }

            var result = creep.attack(vector);
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveTo(vector, {visualizePathStyle: this.lineStyle});
            }
            console.log("Attack result " + result);
        } else {
            creep.say("Travel");
            console.log(creep.moveTo(new RoomPosition(4, 10, "W11S2"), {visualizePathStyle: this.lineStyle}));
        }
    }
};