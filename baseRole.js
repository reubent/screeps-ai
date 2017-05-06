/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('baseRole');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    handleTtl: function (creep) {
        if (creep.ticksToLive > 200) {
            return false;
        }
        var name = creep.name.replace(/^[a-zA-Z]+/, "");
        var lifetime = Math.floor(Date.now() / 1000) - parseInt(name);
        if (lifetime > 604800) {
            console.log(name + ": Lifetime is " + lifetime + " so time to die...");
            creep.suicide();
            return true;
        }
        if (typeof creep.memory.renewable !== "undefined" && creep.memory.renewable === false) {
            console.log(name + ": Basic creep - not renewable");
            return false;
        }
        if (creep.memory.role !== "fetcher" && Object.keys(Memory.creepIdCodes[this.myType]).length > this.maxToCreate) {
            console.log(name + ": Not renewing - too many creeps of  type" + this.myType + "...");
            if (creep.carry.energy == 0) {
                console.log("Not carrying anything so good night");
                creep.say("Goodbye");
                creep.suicide();
            }
            return false;
        }
        var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_SPAWN;
            }
        });
        if (target && target.spawning && creep.carry.energy > 100) {
            return false;
        }
        creep.say("Renew");
        console.log(name + ": Sending " + creep.name + " to " + (target ? target.name : "nowhere") + " for renewal as lifetime is " + lifetime + " with TTL of " + creep.ticksToLive);
        creep.moveTo(target, {visualizePathStyle: this.lineStyle});
        creep.memory.committed = target.id;
        return true;
    },
    findGameSource: function (creep) {
        var sources = creep.room.find(FIND_SOURCES, {
            filter: function (thisSource) {
                return thisSource.energy > 0 || thisSource.ticksToRegeneration < 20;
            }
        });
        return creep.pos.findClosestByPath(sources);
    },
    findStoreAsSource: function (creep) {
        var sources = [];
        if (creep.memory.role !== "harvester" || creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
            sources = creep.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    var spaceUsed = typeof structure.store !== "undefined" && structure.store[RESOURCE_ENERGY] > 10 ? structure.store[RESOURCE_ENERGY] : 0;
                    if (spaceUsed == 0 && structure.structureType == STRUCTURE_LINK) {
                        spaceUsed = structure.energy;
                    }
                    return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_LINK) && spaceUsed > 0;
                }
            });
        }
        if (sources.length == 0) {
            creep.say("😴");
            return;
        }
        return creep.pos.findClosestByPath(sources);
    },
    findLinkAsSource: function (creep) {
        //console.log(creep.name+" Looking for link as source");
        var sources = creep.pos.findInRange(FIND_STRUCTURES, 15, {
            filter: function (structure) {
                var spaceUsed = structure.energy;
                return structure.structureType == STRUCTURE_LINK && spaceUsed > 0;
            }
        });
        if (sources.length) {
            //console.log("found link");
            return sources.pop();
        }
        //console.log("no links in range");
    },
    findStorage: function (creep) {
        var sources = creep.room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_STORAGE;
            }
        });
        if (sources.length) {
            return sources.pop();
        }
        return undefined;
    },
    findEnergySource: function (creep) {
        var source;
        // 10% chance of uncommitting to prevent logjams
        if (false && typeof creep.memory.committed !== "undefined" && Math.random() < 0.95) {
            //console.log("Creep "+creep.name+" is committed to "+creep.memory.committed);
            source = Game.getObjectById(creep.memory.committed);
        } else {
            if (creep.memory.role == "upgrader" && creep.room.name == "W19S5") {
                var mySource = Game.getObjectById("55c34a6c5be41a0a6e80c7b3");
                if (mySource.energy > 0) {
                    source = mySource;
                } else {
                    source = this.findStoreAsSource(creep);
                }
            } else if (creep.memory.role == "harvester" || creep.memory.role == "towerRenewer") {
                source = this.findGameSource(creep);
                if (!source) {
                    source = this.findStoreAsSource(creep);
                }
            } else {
                source = this.findStoreAsSource(creep);
                if (!source) {
                    source = this.findGameSource(creep);
                }
            }

            if (source === null || typeof source === "undefined" && creep.memory.role !== "multi") {
                creep.say("No path");
                creep.move(TOP);
                return;
            }
            // console.log("Committing "+creep.name+" to source "+source.id);
            creep.memory.committed = source.id;
        }
        return source;
    },
    doHarvest: function (creep) {
        var source = this.findEnergySource(creep);
        var harvesting = false;
        if (source === null || typeof source === "undefined") {
            creep.say("No sources");
            return -999;
        }
        var result;
        if (typeof source.structureType !== "undefined" && (source.store || source.energy)) {
            if (source.store && source.store[RESOURCE_ENERGY] === 0) {
                creep.memory.committed = undefined;
                return;
            }
            var amount = Math.min(source.store ? source.store[RESOURCE_ENERGY] : source.energy, creep.carryCapacity - creep.carry.energy);
            //console.log(creep.name + " Withdrawing "+amount+" of "+source.store[RESOURCE_ENERGY]);
            result = creep.withdraw(source, RESOURCE_ENERGY, amount);
            creep.say('🔄 collect')
            //console.log("Result "+result);
        } else if (typeof source.resourceType !== "undefined") {
            result = creep.pickup(source);
            creep.say('🔄 pickup')
        } else {
            result = creep.harvest(source);
            harvesting = true;
            creep.say('🔄 harvest');
            //console.log(source.id);
        }
        //console.log(source.id+": "+result);
        if (result === OK && _.sum(creep.carry) < creep.carryCapacity) {
            creep.memory.harvesting = harvesting;
            return;
        }
        creep.memory.harvesting = false;
        if (result === ERR_NOT_IN_RANGE || result == ERR_NOT_ENOUGH_RESOURCES) {
            if (creep.fatigue > 0) {
                creep.say("Tired 😟");
                return result;
            }

            var moveResult = creep.moveTo(source, {visualizePathStyle: this.lineStyle});
            if (moveResult === ERR_NO_PATH) {
                creep.say("No path");
                creep.memory.committed = undefined;
            }
            return moveResult;
        } else {
            //console.log(result);
        }
        creep.memory.committed = undefined;
        return result;
    },
    doSpawn: function (spawn, extant) {
        if (this.myType == "builder" && spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length < 1) {
            console.log("Nothing to spawn");
            return false;
        }
        if (extant < this.maxToCreate) {
            var renewable = true;
            if (this.hasOwnProperty("spawnInit")) {
                renewable = this.spawnInit(spawn);
            }
            console.log("Trying to make " + this.myType);
            var units = this.hasOwnProperty("getUnits") ? this.getUnits(spawn) : this.units;
            var canCreate = spawn.canCreateCreep(units);
            if (canCreate !== OK) {
                switch (canCreate) {
                    case ERR_NOT_OWNER:
                        console.log("Not your object");
                        break;
                    case ERR_NAME_EXISTS:
                        console.log("Name exists");
                        break;
                    case ERR_BUSY:
                        console.log("Spawn busy");
                        break;
                    case ERR_NOT_ENOUGH_ENERGY:
                        //console.log("Not enough energy "+spawn.room.energyAvailable+" / "+spawn.room.energyCapacityAvailable+" in room");
                        break;
                    case ERR_INVALID_ARGS:
                        console.log("Invalid description");
                        break;
                    case ERR_RCL_NOT_ENOUGH:
                        console.log("Room conroller not leveled up");
                        break;
                    default:
                        console.log("Unknown error");
                }
                return false;
            }
            var creepIndex;
            var creepIdCodes = Memory.creepIdCodes;
            for (creepIndex = 0; creepIndex < 100; creepIndex++) {
                if (!creepIdCodes[this.myType].hasOwnProperty(creepIndex)) {
                    break;
                }
            }
            var newName = this.myType + Math.floor(Date.now() / 1000);
            var created = spawn.createCreep(units, newName, {role: this.myType, creepIndex: creepIndex, renewable: renewable, homeRoom: spawn.room.name, originalType: this.myType});
            if (created == newName) {
                Memory.spawnType = this.myType;
                return true;
            } else {
                console.log("Create failed");
            }
        }
        return false;
    }
};