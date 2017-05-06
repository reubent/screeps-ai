var baseRole = require("baseRole");
var roleBuilder = {
    units: [
        WORK, MOVE, CARRY
    ],
    myType: "builder",
    maxToCreate: 0,
    lineStyle: {
        stroke: '#00aa00',
        strokeWidth: 0.2,
        opacity: 1,
        lineStyle: undefined
    },
    findEnergySource: baseRole.findEnergySource,
    doSpawn: baseRole.doSpawn,
    doHarvest: baseRole.doHarvest,
    handleTtl: baseRole.handleTtl,
    findStoreAsSource: baseRole.findStoreAsSource,
    findGameSource: baseRole.findGameSource,
    getUnits: function (spawn) {
        var units = [];
        for (var i = 0; i < spawn.room.energyCapacityAvailable; i += 400) {
            units = units.concat(this.units);
        }
        console.log("builder: " + JSON.stringify(units));
        return units;
    },
    /** @param {Creep} creep **/
    run: function (creep) {
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("Wait!");
            creep.memory.sleeping--;
            return;
        }
        if (creep.ticksToLive < 200) {
            this.handleTtl(creep);
            return;
        }
        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
            creep.memory.committed = undefined;
        }

        if (creep.memory.building) {
            var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: function (site) {
                    return site.structureType == STRUCTURE_WALL || site.structureType == STRUCTURE_RAMPART;
                }
            });
            if (!targets.length) {
                targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            }
            if (targets.length) {
                var target = creep.pos.findClosestByPath(targets);
                if (!target) {
                    creep.say("No path");
                    return;
                }
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    if (creep.fatigue > 0) {
                        creep.say("Tired 😟");
                        return;
                    }
                    var moveTo = creep.moveTo(target, {visualizePathStyle: this.lineStyle});
                    if (moveTo !== OK) {
                        creep.say("Stuck!");
                    }
                }
            } else if (!this.handleTtl(creep)) {
                creep.say("😴 idle");
            }
        } else {
            this.doHarvest(creep);
        }
    }
};

module.exports = roleBuilder;