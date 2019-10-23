var baseRole = require("baseRole");
var attackerRole = require("role.attacker")
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
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        HEAL, HEAL, HEAL, HEAL, HEAL
    ],
    myType: "healer",
    maxToCreate: (room) => {
        switch (room.name) {
            //case "W19S4":
            //case "W19S5":
            //case "W19S6":
            //case "W19S8":
            //case "W18S5":
            case "W19S11":
            //case "W18S6":
            //case "W19S9":
            case "W19S13":
                // if (!Game.getObjectById("5c4362ee5ec147719c4f2310")) {
                //     return 0;
                // }
                // console.log(`Death comes in ${Game.getObjectById("5c4362ee5ec147719c4f2310").timeToLand} ticks` )
                //if  (Game.getObjectById("5c4362ee5ec147719c4f2310").timeToLand < 400) {
                return 0;
            //}
            default:
                return 0;
        }
    },
    lineStyle: {
        stroke: '#20ff20',
        strokeWidth: 0.15,
        opacity: 1,
        lineStyle: undefined
    },
    doSpawn: baseRole.doSpawn,
    handleTtl: () => false,
    run: function (creep, roomData) {
        var victim = attackerRole.victim
        if (creep.room.name != victim && creep.room.name !== "W21S5") {
            victim = "W21S5"
        }
        if (creep.room.name == victim) {


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
                    creep.rangedHeal(target)
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#aaffaa' } });
                } else if (result !== OK) {
                    console.log("Heal result " + result);
                }
            } else if (!this.handleTtl(creep, roomData)) {
                creep.say("😴 idle");
                target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (i) => {
                        return i.memory && i.memory.role != "healer"
                    }
                });
                if (target) {
                    res = creep.moveTo(target, { visualizePathStyle: this.lineStyle, maxOps: 1000 })
                    if (res != OK) {
                        creep.move(LEFT)
                    }
                } else {
                    creep.move(LEFT)
                }
            }
        } else {
            if (creep.fatigue > 0) {
                creep.say("Tired 😟");
            }
            creep.moveTo(new RoomPosition(25, 46, victim), { visualizePathStyle: this.lineStyle, maxOps: 1000 });
        }


    }
};