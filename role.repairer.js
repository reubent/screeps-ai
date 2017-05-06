var baseRole = require("baseRole");
var roleRepairer = {
    units: [WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY],
    myType: "repairer",
    maxToCreate: 0,
    lineStyle: {
        stroke: '#ff00aa',
        strokeWidth: 0.2,
        opacity: 1,
        lineStyle: 'dotted'
    },
    spawnInit: function () {
        var idCodes = Memory.creepIdCodes;
        if (Object.keys(idCodes[this.myType]).length > 0) {
            this.units = [WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY]

            return true;
        }
        console.log("No repairers - going simple");
        this.units = [WORK, MOVE, MOVE, CARRY];
        return false;
    },
    doSpawn: baseRole.doSpawn,
    doHarvest: baseRole.doHarvest,
    handleTtl: baseRole.handleTtl,
    findEnergySource: baseRole.findEnergySource,
    findStoreAsSource: baseRole.findStoreAsSource,
    findGameSource: baseRole.findGameSource,
    /** @param {Creep} creep **/
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
        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧️ repair');
        }

        if (creep.memory.building) {
            // because defenders hold energy for a long time, we need to renew here too
            if (this.handleTtl(creep)) {
                return;
            }
            // find targets with less than full health as long as they have less than 2500 hit points
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    return structure.hits < Math.min(structure.hitsMax, 1000);
                }
            });
            // if there aren't any with less than 2500 hp, find any others under 5k
            if (!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return structure.hits < Math.min(2500, structure.hitsMax);
                    }
                });
            }
            // if there aren't any with less than 2500 hp, find any others under 10k
            if (!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return structure.hits < Math.min(3500, structure.hitsMax);
                    }
                });
            }
            // if there aren't any with less than 2500 hp, find any others under 25k
            if (!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return structure.hits < Math.min(5000, structure.hitsMax);
                    }
                });
            }
            // if there aren't any with less than 2500 hp, find any others under 25k
            if (!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return structure.structureType == STRUCTURE_CONTAINER && structure.hits < Math.min(50000, structure.hitsMax);
                    }
                });
            }
            if (targets.length) {
                var target = creep.pos.findClosestByPath(targets);
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: this.lineStyle});
                }
            } else if (!this.handleTtl(creep)) {
                creep.say("😴 idle");
                creep.moveTo(43, 31 + creep.memory.creepIndex, {visualizePathStyle: this.lineStyle});
            }
        } else if (!this.handleTtl(creep)) {
            this.doHarvest(creep);
        }
    }
};

module.exports = roleRepairer;