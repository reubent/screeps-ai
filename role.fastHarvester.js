var baseRole = require("baseRole");
var roleFastHarvester = Object.assign({}, baseRole, {
    myType: "fastHarvester",
    getUnits: function (spawn) {
        var units = [CARRY, CARRY, MOVE];
        for (var i = 0; i < spawn.room.energyCapacityAvailable && units.length < 40; i += 400) {
            units.push(WORK, WORK);
            if (i % 800 == 0) {
                units.push(MOVE);
            }
        }
        console.log("FastHarvester: " + JSON.stringify(units));
        return units;
    },
    lineStyle: {
        stroke: '#ffffff',
        strokeWidth: 0.1,
        opacity: 0.7,
        lineStyle: 'dotted'
    },
    maxToCreate: (room) => room.controller.level > 3 ? room.find(FIND_SOURCES).length : 0,
    run: function (creep, roomData) {
        if (creep.memory.sleeping > 0) {
            creep.memory.sleeping--;
            creep.say("💤");
            creep.memory.renewing = true;
            return;
        }
        // if (creep.room.name != creep.memory.homeRoom) {
        //     creep.moveTo(10, 10, creep.memory.homeRoom)
        // }
        if (creep.ticksToLive < 150 && this.handleTtl(creep, roomData)) {
            creep.memory.renewing = true;
            return;
        }
        if (creep.carry.energy > 0) {
            this.transfer(creep);
        }
        if (_.sum(creep.carry) < creep.carryCapacity && creep.memory.assignedSource) {
            return this.slurp(creep, roomData);
        }
        return this.assignSource(creep);
    },
    transfer: function (creep) {
        var creeps = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: (c) => c.name !== creep.name && _.sum(c.carry) < c.carryCapacity
        });
        if (creeps.length == 0) {
            creeps = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (c) => {
                    if (c.structureType === STRUCTURE_CONTAINER) {
                        var spaceUsed = _.sum(c.store);
                        return spaceUsed < c.storeCapacity;
                    }
                    if (c.structureType === STRUCTURE_LINK) {
                        return c.energyCapacity > c.energy
                    }
                    return false;
                }
            });
        }
        if (creeps.length == 0) {
            return;
        }
        var target = creeps.pop();
        var amount;
        if (target instanceof Creep) {
            amount = Math.min(target.carryCapacity - _.sum(target.carry), creep.carry.energy);
            target.memory.harvesting = true;
        } else if (target.structureType == STRUCTURE_CONTAINER) {
            amount = Math.min(target.storeCapacity - _.sum(target.store), creep.carry.energy);
        } else {
            amount = Math.min(target.energyCapacity - target.energy, creep.carry.energy);
        }
        var result = creep.transfer(target, RESOURCE_ENERGY, amount);
        if (result === OK) {
            creep.say("⛽");
        } else {
            console.log("ERROR transferring energy - " + result);
            creep.say("☠️")
        }
    },
    slurp: function (creep, roomData) {
        if (creep.carry.energy == creep.carryCapacity) {
            creep.say("🛑");
            return;
        }
        if (roomData.droppedEnergy.length > 0) {
            var nearMe = creep.pos.findInRange(roomData.droppedEnergy, 1)
            if (nearMe.length) {
                creep.pickup(nearMe[0]);
                creep.say("YAY")
                return
            }
        }
        var source = Game.getObjectById(creep.memory.assignedSource);
        var harvestResult = creep.harvest(source);
        if (harvestResult === OK) {
            creep.memory.renewing = false;
            creep.say("😋");
            return;
        } else if (harvestResult === ERR_NOT_IN_RANGE || harvestResult === ERR_NOT_ENOUGH_RESOURCES) {
            var result = creep.moveTo(source, { visualizePathStyle: this.lineStyle, reusePath: 10, maxRooms: 1, range: 1, ignoreCreeps: (creep.room.name == "W16S8" ? false : true) });
            if (result == ERR_TIRED) {
                creep.say("😪")
            } else {
                creep.memory.renewing = true;
                creep.say("⚠️" + result)
            }
        } else {
            creep.say("☠️")
        }
        return;
    },
    assignSource: function (creep) {
        sources = creep.room.find(FIND_SOURCES, {
            filter: (s) => (typeof Memory.eaters[s.id] === "undefined") || !(Game.creeps[Memory.eaters[s.id]] instanceof Creep) || Memory.eaters[s.id] == creep.name
        });
        if (sources.length) {
            var source = sources.pop();
            creep.memory.assignedSource = source.id;
            Memory.eaters[source.id] = creep.name;
        } else {
            console.log("FH " + creep.name + " in room " + creep.room.name + " can't be assigned source")
        }
    }
});
module.exports = roleFastHarvester;
