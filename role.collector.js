var baseRole = require("baseRole");
var roleCollector = {
    units: [WORK, MOVE, MOVE, MOVE, CARRY, CARRY],
    myType: "collector",
    maxToCreate: 0,
    lineStyle: {
        stroke: '#ffff90',
        strokeWidth: 0.2,
        opacity: 1,
        lineStyle: undefined
    },
    findEnergySource: baseRole.findEnergySource,
    doSpawn: baseRole.doSpawn,
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
        if (creep.fatigue > 0) {
            creep.say("Tired 😟");
            return;
        }
        if (creep.carry.energy < creep.carryCapacity) {
            var source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: function (resource) {
                    return resource.resourceType == RESOURCE_ENERGY && resource.amount > 25;
                }
            });
            if (source) {
                if (creep.pickup(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: this.lineStyle});
                }
                creep.say('🔄 collect');
                return;
            }
        }
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
                        structure.energy < structure.energyCapacity;
            }
        });

        if (creep.carry.energy > 0 && targets.length > 0) {
            var target = creep.pos.findClosestByPath(targets);
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say('▶️ deliver');
                creep.moveTo(target, {visualizePathStyle: this.lineStyle});
            }
        } else if (!this.handleTtl(creep)) {
            creep.say("😴 idle");
            creep.moveTo(12 + creep.memory.creepIndex, 23, {reusePath: 20, visualizePathStyle: this.lineStyle});
        }

    }
};

module.exports = roleCollector;