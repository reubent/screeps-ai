var baseRole = require("baseRole");
var roleHarvester = {
    units: [WORK, MOVE, MOVE, CARRY],
    myType: "harvester",
    maxToCreate: 3,
    findEnergySource: baseRole.findEnergySource,
    isTarget: function (structure) {
        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                structure.energy < structure.energyCapacity;
    },
    lineStyle: {
        stroke: '#6666ff',
        strokeWidth: 0.2,
        opacity: 1,
        lineStyle: undefined
    },
    getUnits: function (spawn) {
        var idCodes = Memory.creepIdCodes;
        if (Object.keys(idCodes[this.myType]).length > 0) {
            var units = [];
            for (var i = 0; i < spawn.room.energyCapacityAvailable; i += 450) {
                units = units.concat(this.units);
            }
            return units;
        }
        console.log("No harvesters - going simple");
        return [WORK, MOVE, CARRY];
    },
    spawnInit: function (spawn) {
        return this.getUnits(spawn).length > 3 || spawn.room.energyCapacityAvailable < 301;
    },
    doSpawn: baseRole.doSpawn,
    doHarvest: baseRole.doHarvest,
    handleTtl: baseRole.handleTtl,
    findStoreAsSource: baseRole.findStoreAsSource,
    findGameSource: baseRole.findGameSource,
    /** @param {Creep} creep **/
    run: function (creep) {
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("Wait!");
            creep.memory.sleeping--;
            return;
        }
        if (creep.ticksToLive < 100) {
            this.handleTtl(creep);
            return;
        }
        if (creep.carry.energy < 50) {
            this.doHarvest(creep);
        } else {
            var findTarget = true;
            if (creep.carry.energy < creep.carryCapacity) {
                var source = this.findEnergySource(creep);
                var harvestResult = false;
                if (source) {
                    if (typeof source.structureType !== "undefined") {
                        var amount = Math.min(source.store ? source.store[RESOURCE_ENERGY] : source.energy, creep.carryCapacity - creep.carry.energy);
                        harvestResult = creep.withdraw(source, RESOURCE_ENERGY, amount);
                    } else {
                        harvestResult = creep.harvest(source);
                    }

                    if (harvestResult != OK) {
                        if (harvestResult !== ERR_NOT_IN_RANGE) {
                            console.log(creep.name + ": Harvest result " + harvestResult);
                        }
                    } else {
                        creep.say("Harvester");
                        return;
                    }
                } else {
                    console.log(creep.name + ": No source");
                }
                findTarget = (!source || harvestResult == ERR_NOT_IN_RANGE);
            }
            var target;
            var targets = [];
            if (creep.memory.tCommitted !== undefined) {
                //console.log(creep.id+" Committed");
                target = Game.getObjectById(creep.memory.tCommitted);
                if (target.energy == target.energyCapacity) {
                    creep.memory.tCommitted = undefined;
                    target = undefined;
                    //console.log("not any more");
                }
            }
            if (typeof target === "undefined") {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: this.isTarget
                });
                if (targets.length == 0) {
                    //console.log("Looking for stores");
                    targets = creep.room.find(FIND_STRUCTURES, {
                        filter: function (structure) {
                            var spaceUsed = _.sum(structure.store);
                            return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER) && spaceUsed < structure.storeCapacity;
                        }
                    });
                }
            }
            if (targets.length > 0) {
                target = this.findTarget(targets, creep);
            }

            if (findTarget && typeof target !== "undefined" && target !== null) {
                if (target.id) {
                    creep.memory.tCommitted = target.id;
                }
                var result = creep.transfer(target, RESOURCE_ENERGY);
                if (result == ERR_NOT_IN_RANGE) {
                    if (creep.fatigue > 0) {
                        creep.say("Tired 😟");
                        return;
                    }
                    creep.say('▶️ move');
                    creep.moveTo(target, {visualizePathStyle: this.lineStyle, reusePath: 10});
                } else if (result == OK) {
                    creep.memory.lastRenewed = target.id;
                    creep.memory.tCommitted = undefined;
                }
            } else if (!this.handleTtl(creep)) {
                if (creep.fatigue > 0) {
                    creep.say("Tired 😟");
                    return;
                }
                creep.say("😴 idle");
                //creep.moveTo(19, 30+creep.memory.creepIndex, {visualizePathStyle: this.lineStyle});
            }
        }
    },
    findTarget: function (targets, creep) {
        return creep.pos.findClosestByPath(targets);
    }
};

module.exports = roleHarvester;