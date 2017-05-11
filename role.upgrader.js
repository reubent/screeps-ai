var baseRole = require("baseRole");
var roleUpgrader = {
    units: [WORK, MOVE, CARRY],
    myType: "upgrader",
    maxToCreate: 4,
    lineStyle: {
        stroke: '#ffff00',
        strokeWidth: 0.2,
        opacity: 1,
        lineStyle: 'dotted'
    },
    doSpawn: baseRole.doSpawn,
    doHarvest: baseRole.doHarvest,
    handleTtl: baseRole.handleTtl,
    findEnergySource: baseRole.findEnergySource,
    findStoreAsSource: baseRole.findStoreAsSource,
    findGameSource: baseRole.findGameSource,
    getUnits: function (spawn) {
        var units = [];
        for (var i = 0; i < spawn.room.energyCapacityAvailable; i += 400) {
            units = units.concat(this.units);
        }
        console.log("upgrader: " + JSON.stringify(units));
        return units;
    },
    /** @param {Creep} creep **/
    run: function (creep) {
        // for upgraders they might as well be the secondary source for now as it's nearer
        var source = creep.room.controller;
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("Wait!");
            creep.memory.sleeping--;
            return;
        }
        if (creep.ticksToLive < 200) {
            this.handleTtl(creep);
            return;
        }
//        if (creep.memory.creepIndex == 1 && creep.room.name !== "W19S8") {
//            creep.moveTo(new RoomPosition(10,10,"W19S8"));
//            creep.say("Emigrate");
//            return;
//        }
        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.upgrading && (creep.carry.energy == creep.carryCapacity || source.energy == 0)) {
            creep.memory.upgrading = true;
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE || creep.pos.getRangeTo(creep.room.controller) > 1) {
                if (creep.fatigue > 0) {
                    creep.say("Tired 😟");
                    return;
                }
                creep.moveTo(creep.room.controller, {visualizePathStyle: this.lineStyle});
            } else {
                creep.say('⚡ upgrade');
            }
        } else {
            if (this.doHarvest(creep) === -999 && creep.carry.energy > 0) {
                creep.memory.upgrading = true;
            }
        }
    }
};

module.exports = roleUpgrader;