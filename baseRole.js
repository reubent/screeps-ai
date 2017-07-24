module.exports = {
    handleTtl: function (creep, helperObj) {
        if (creep.ticksToLive > 200) {
            return false;
        }
        var name = creep.name.replace(/^[a-zA-Z]+/, "");
        var lifetime = Math.floor(Date.now() / 1000) - parseInt(name);
        if (!creep.memory.role.match(/^fetcher/) && lifetime > 604800) {
            if (creep.ticksToLive < 20) {
                console.log(name + ": Lifetime is " + lifetime + " so time to die...");
                creep.suicide();
                return true;
            }
            return false;
        }
        if (typeof creep.memory.renewable !== "undefined" && creep.memory.renewable === false) {
            console.log(name + ": Basic creep - not renewable");
            return false;
        }
        if (!creep.memory.role.match(/^fetcher/) && creep.ticksToLive < 20 && Object.keys(Memory.creepIdCodes[this.myType]).length > (typeof this.maxToCreate === "function" ? this.maxToCreate(creep.room) : this.maxToCreate)) {
            console.log(name + ": Not renewing - too many creeps of  type" + this.myType + "...");
            if (creep.carry.energy == 0) {
                console.log("Not carrying anything so good night");
                creep.say("Goodbye");
                creep.suicide();
            }
            return false;
        }
        if (creep.room.name != creep.memory.homeRoom) {
            if (!creep.room.controller || !creep.room.controller.owner || creep.room.controller.owner.username != "ReubenT") {
                creep.moveTo(new RoomPosition(20, 20, creep.memory.homeRoom), {visualizePathStyle: this.lineStyle});
                creep.say("Go home", true);
                return true;
            }
        }
        var target = helperObj.findSpawn(creep);
        //console.log("target is "+JSON.stringify(target));
        if (target && target.spawning && creep.carry.energy > 100) {
            return false;
        }
        if (target) {
            creep.say("Renew");
            console.log(name + ": Sending " + creep.name + " to " + (target ? target.name : "nowhere") + " for renewal as lifetime is " + lifetime + " with TTL of " + creep.ticksToLive);
            creep.moveTo(target, {visualizePathStyle: this.lineStyle});
            creep.memory.committed = target.id;
        
            return true;
        }
        creep.say(":S");
        return false;
    },
    findGameSource: function (creep, helper) {
        var sources = helper.findGameSources();
        return creep.pos.findClosestByPath(/*fastHarvesters.length ? fastHarvesters :*/ sources);
    },
    findStoreAsSource: function (creep, helper) {
        var sources = helper.findStoreAsSource(creep);
        
        if (sources.length == 0) {
            creep.say("😴");
            return;
        }
        return creep.pos.findClosestByPath(sources);
    },
    findLinkAsSource: function (creep) {
        //console.log(creep.name+" Looking for link as source");
        var sources = creep.pos.findInRange(FIND_STRUCTURES, 8, {
            filter: function (structure) {
                var spaceUsed = structure.energy;
                return structure.structureType == STRUCTURE_LINK && spaceUsed > 100;
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
                return structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_TERMINAL;
            }
        });
        if (sources.length) {
            return sources.pop();
        }
        return undefined;
    },
    findEnergySource: function (creep, helper) {
        var source;
        // 20% chance of uncommitting to prevent logjams
        if (typeof creep.memory.committed !== "undefined" && Math.random() < 0.8) {
            //console.log("Creep "+creep.name+" is committed to "+creep.memory.committed);
            source = Game.getObjectById(creep.memory.committed);
        } else {
            
            source = this.findLinkAsSource(creep, helper);
            if (!source) {
                source = this.findGameSource(creep, helper);
            }
            if (!source) {
                source = this.findStoreAsSource(creep, helper);
            }
            

            if (source === null || typeof source === "undefined" && creep.memory.role !== "multi") {
                creep.say("No path");
                if (creep.pos.y > 2) {
                    creep.move(TOP);
                }
                return;
            }
            // console.log("Committing "+creep.name+" to source "+source.id);
            if (source.id) {
                creep.memory.committed = source.id;
            }
        }
        return source;
    },
    doHarvest: function (creep, helper) {
        var source = this.findEnergySource(creep, helper);
        var harvesting = false;
        if (source === null || typeof source === "undefined") {
            creep.say("No sources");
            return -999;
        }
        var result;
        if (source instanceof Creep) {
            creep.say("reslurp");
            if (source.memory.renewing) {
                creep.memory.committed = undefined;
            }
            result = creep.pos.inRangeTo(source,1) ? OK : ERR_NOT_IN_RANGE;
            if (result === OK) {
                var secondary = creep.pos.findInRange(FIND_SOURCES_ACTIVE,1);
                if (secondary.length) {
                    creep.harvest(secondary.pop());
                }
            }
        } else if (typeof source.structureType !== "undefined" && (source.store || source.energy)) {
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
            var moveResult = creep.moveTo(source, {visualizePathStyle: this.lineStyle, ignoreCreeps: !creep.pos.inRangeTo(source, 15)});
            if (moveResult === ERR_NO_PATH) {
                creep.say("No path");
                //creep.memory.committed = undefined;
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
        if (extant < (typeof this.maxToCreate === "function" ? this.maxToCreate(spawn.room) : this.maxToCreate)) {
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
