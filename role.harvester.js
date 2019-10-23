var baseRole = require("baseRole");
var roleHarvester = Object.assign({}, baseRole, {
    units: [CARRY, MOVE, CARRY],
    myType: "harvester",
    maxToCreate: (room) => {
        return 1;
    },
    isTarget: function (structure) {
        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_POWER_SPAWN || structure.structureType == STRUCTURE_LAB) &&
            structure.energy < structure.energyCapacity;
    },
    lineStyle: {
        stroke: '#6666ff',
        strokeWidth: 0.1,
        opacity: 1,
        lineStyle: undefined
    },
    getUnits: function (spawn) {
        if (spawn.room.name != "W16S8" && (!Memory.creepsByRoom[spawn.room.name] || _.sum(Memory.creepsByRoom[spawn.room.name]) != 0)) {
            var units = [WORK];
            for (var i = 0; i < spawn.room.energyCapacityAvailable && i < 1800; i += 450) {
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
    /** @param {Creep} creep **/
    run: function (creep, roomData) {
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("🕗");
            creep.memory.sleeping--;
            return;
        }
        if (this.handleTtl(creep, roomData)) {
            return;
        }
        if (!roomData) {
            creep.moveTo(10, 10, creep.memory.homeRoom ? creep.memory.homeRoom : "W19S5");
            creep.say("Lost!");
            return;
        }
        if (creep.carry.energy < 50) {
            //if (roomData.needEnergy.length > 0) {
            this.doHarvest(creep, roomData);
            //} else {
            //creep.move(TOP_LEFT)

            // }
            return
        }
        if (creep.carry.energy < creep.carryCapacity && roomData.needEnergy && roomData.needEnergy.length > 0) {
            var source = this.findEnergySource(creep, roomData);
            if (source && creep.pos.inRangeTo(source, 1)) {
                this.actuallyHarvest(creep, source)
                return;
            } else {
                //console.log(creep.room.name+": "+creep.name + ": No source");
            }
        }
        var target;
        if (creep.memory.tCommitted !== undefined) {
            //console.log(creep.id+" Committed");
            target = Game.getObjectById(creep.memory.tCommitted);
            if (!target) {
                creep.memory.tCommitted = undefined;
                return;
            }
            if (target.energy == target.energyCapacity) {
                creep.memory.tCommitted = undefined;
                target = undefined;
            }
        }
        if (this.myType !== "towerRenewer" && typeof target === "undefined" && roomData.needEnergyHighPriority && roomData.needEnergyHighPriority.length > 0) {
            target = this.findTarget(roomData.needEnergyHighPriority, creep);
        }
        if (typeof target === "undefined" && roomData.needEnergy && roomData.needEnergy.length > 0) {
            target = this.findTarget(roomData.needEnergy, creep);
        }
        if (typeof target === "undefined") {
            target = this.findStorage(creep);
        }

        if (typeof target !== "undefined" && target !== null) {
            if (target.id) {
                creep.memory.tCommitted = target.id;
            }
            var result = creep.transfer(target, RESOURCE_ENERGY);
            if (result == ERR_NOT_IN_RANGE) {
                if (creep.fatigue > 0) {
                    creep.say("😟");
                    return;
                }
                creep.say('▶️ ');
                creep.moveTo(target, { visualizePathStyle: this.lineStyle, reusePath: 10, maxRooms: 1, maxOps: 1000 });
            } else if (result == OK) {
                creep.memory.lastRenewed = target.id;
                creep.memory.tCommitted = undefined;
            }
        } else if (!this.handleTtl(creep, roomData)) {
            if (creep.fatigue > 0) {
                creep.say("😟");
                return;
            }
            creep.say("😴 ");
            result = creep.move(TOP);
            if (result != OK) {
                creep.move(RIGHT);
            }
        } else {
            creep.say("!!!!")
        }

    },
    findTarget: function (targets, creep) {
        if (targets.length == 0) {
            return;
        }
        targets.sort(this.sortTargets.bind(this, creep))
        //console.log("TARGETS for "+this.myType+": ", JSON.stringify(targets.map(function(t){ return {type: t.structureType,dist: creep.pos.getRangeTo(t)}})))
        var target = targets.shift();
        targets.unshift(target);
        return target;
    },
    sortTargets: function (creep, a, b) {
        if (this.isTarget(a) && !this.isTarget(b)) {
            return -1;
        }
        if (this.isTarget(b) && !this.isTarget(a)) {
            return 1;
        }

        if (a.structureType == STRUCTURE_CONTAINER && b.structureType != STRUCTURE_CONTAINER) {
            return 1;
        }
        if (a.structureType != STRUCTURE_CONTAINER && b.structureType == STRUCTURE_CONTAINER) {
            return -1;
        }
        if (a.structureType == STRUCTURE_STORAGE && b.structureType != STRUCTURE_STORAGE) {
            return 1;
        }
        if (a.structureType != STRUCTURE_STORAGE && b.structureType == STRUCTURE_STORAGE) {
            return -1;
        }
        if (a.structureType == STRUCTURE_NUKER && b.structureType !== STRUCTURE_NUKER) {
            return 1
        }
        if (b.structureType == STRUCTURE_NUKER && a.structureType !== STRUCTURE_NUKER) {
            return -1
        }

        var rangeA = creep.pos.getRangeTo(a);
        var rangeB = creep.pos.getRangeTo(b);
        if (a.structureType == STRUCTURE_CONTAINER && b.structureType == STRUCTURE_CONTAINER) {
            if (rangeA + 10 < rangeB) {
                return -1
            }
            if (rangeB + 10 < rangeA) {
                return 1
            }
            var storeA = a.store[RESOURCE_ENERGY] ? a.store[RESOURCE_ENERGY] : 0
            var storeB = b.store[RESOURCE_ENERGY] ? b.store[RESOURCE_ENERGY] : 0
            if (storeA > storeB) {
                return -1
            }
            if (storeB > storeA) {
                return 1
            }
        }

        if (rangeA < rangeB) {
            return -1;
        }
        if (rangeB < rangeA) {
            return 1;
        }
        return 0;
    }
});

module.exports = roleHarvester;