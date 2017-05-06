/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.defender');
 * mod.thing == 'a thing'; // true
 */

var baseRole = require("baseRole");
module.exports = {
    units: [
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        ATTACK, ATTACK, ATTACK
    ],
    myType: "defender",
    maxToCreate: 0,
    lineStyle: {
        stroke: '#ff0000',
        strokeWidth: 0.4,
        opacity: 1,
        lineStyle: 'dotted'
    },
    homePositions: [
        //[44, 15],
        [3, 15],
        [14, 6],
        [47, 28],
        [17, 3],
        //[ 5, 24],
        //[44, 19],
        [47, 28],
        //[ 5, 26],
        //[ 5, 32],
        [7, 39],
        [8, 41],
        [8, 43],
                //[ 5, 18],
                //[ 5, 12]
    ],
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
            return;
        }

        var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        if (targets.length) {
            var target = creep.pos.findClosestByPath(targets);

            creep.say('🔫 ATTACK', true);
            var attackResult = creep.attack(target);
            if (attackResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: this.lineStyle});
            } else if (attackResult != OK) {
                console.log("Error attacking: " + attackResult);
            }
        } else if (!this.handleTtl(creep)) {
            creep.say("👮 Guard", true);
            var homePosition = this.homePositions[creep.memory.creepIndex];
            creep.moveTo(homePosition[0], homePosition[1], {reusePath: 20, visualizePathStyle: this.lineStyle});
            // if we created lots of defenders to repel an attack, kill them when we no longer need them
            if (creep.memory.creepIndex > this.maxToCreate && Math.random > 0.85) {
                creep.suicide();
            }
        }

    }
};