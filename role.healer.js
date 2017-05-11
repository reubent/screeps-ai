var baseRole = require("baseRole");
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.healer');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    units: [
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        HEAL, HEAL
    ],
    myType: "healer",
    maxToCreate: (room) => room.find(FIND_MY_CREEPS, {
        filter: (c) => c.hits < c.hitsMax
    }).length,
    doSpawn: baseRole.doSpawn,
    handleTtl: baseRole.handleTtl,
    run: function (creep) {
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("Wait!");
            creep.memory.sleeping--;
            return;
        }
        if (creep.fatigue > 0) {
            creep.say("Tired 😟");
        }

        var targets = creep.room.find(FIND_MY_CREEPS, {
            filter: function (oCreep) {
                return oCreep.hits < oCreep.hitsMax;
            }
        });
        if (targets.length) {
            creep.say("heal");
            var result;
            var target = creep.pos.findClosestByPath(targets);
            if (target) {
                result = creep.heal(target);
            } else {
                result = creep;
            }
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#aaffaa'}});
            } else if (result !== OK) {
                console.log("Heal result " + result);
            }
        } else if (!this.handleTtl(creep)) {
            creep.say("😴 idle");
            creep.moveTo(8, 20 + creep.memory.creepIndex, {visualizePathStyle: {stroke: '#6666ff'}});
        }


    }
};