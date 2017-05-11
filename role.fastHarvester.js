var baseRole = require("baseRole");
var roleFastHarvester = Object.assign({}, baseRole, {
    myType: "fastHarvester",
    getUnits: function (spawn) {
        var units = [CARRY, MOVE];
        for (var i = 0; i < spawn.room.energyCapacityAvailable; i += 400) {
            units.push(WORK, WORK);
        }
        console.log("FastHarvester: "+JSON.stringify(units));
        return units;
    },
    maxToCreate: (room) => room.find(FIND_SOURCES).length,
    run: function(creep) {
        if (creep.ticksToLive < 100 && this.handleTtl(creep)) {
            return;
        }
        if (creep.carry.energy > 0) {
            this.transfer(creep);
        }
        if (creep.memory.assignedSource) {
            return this.slurp(creep);
        }
        return this.assignSource(creep);
    },
    transfer: function(creep) {
        var creeps = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: (c) => c.name !== creep.name && c.carry.energy < c.carryCapacity
        });
        if (creeps.length == 0) {
            return;
        }
        var target = creeps.pop();
        var amount = Math.min(target.carryCapacity - _.sum(target.carry), creep.carry.energy);
        var transferResult = creep.transfer(target, RESOURCE_ENERGY, amount);
        console.log("Tried to transfer "+amount+" from "+creep.name+" to "+target.name+" with result "+transferResult);
        creep.say("Transfer");
    },
    slurp: function(creep) {
        if (creep.carry.energy == creep.carryCapacity) {
            creep.say("Full");
            return;
        }
        creep.say("Slurp");
        var source = Game.getObjectById(creep.memory.assignedSource);
        var harvestResult = creep.harvest(source);
        if (harvestResult === OK) {
            return;
        }
        
        creep.moveTo(source, {visualizePathStyle: this.lineStyle, reusePath: 10, ignoreCreeps: true});
        
        return;
    },
    assignSource: function(creep) {
        if (typeof Memory.eaters === "undefined") {
            Memory.eaters = {};
        }
        sources = creep.room.find(FIND_SOURCES, {
            filter: (s) => typeof Memory.eaters[s.id] === "undefined"
        });
        if (sources.length) {
            var source = sources.pop();
            creep.memory.assignedSource = source.id;
            Memory.eaters[source.id] = creep.name;
        }
    }
});
module.exports = roleFastHarvester;
