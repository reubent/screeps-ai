module.exports = {
    handleTtl: function (creep, roomData) {
        if (creep.memory.gotoX && creep.memory.gotoY) {
            console.log(`${creep.name}  doing as commanded and going to ${creep.memory.gotoX},${creep.memory.gotoY}`)
            if (creep.pos.x == creep.memory.gotoX && creep.pos.y == creep.memory.gotoY) {
                creep.memory.gotoX = undefined
                creep.memory.gotoY = undefined
                return false
            }
            creep.say("G")
            creep.moveTo(new RoomPosition(creep.memory.gotoX, creep.memory.gotoY, creep.memory.homeRoom), { visualizePathStyle: this.lineStyle })
            return true
        }
        if (creep.ticksToLive > 120 || this.creepIsBoosted(creep)) {
            return false;
        }
        if (typeof creep.memory.renewable !== "undefined" && creep.memory.renewable === false) {
            console.log(creep.name + ": Basic creep - not renewable");
            return false;
        }
        if (creep.memory.role == "claimer" || creep.memory.role == 'unclaimer' || creep.memory.role == "lugger" || creep.memory.role == "remoteHarvester") {
            return false;
        }
        if (creep.room.name != creep.memory.homeRoom
            && !creep.room.my
            && (!creep.memory.role
                || (creep.memory.role != "" && creep.memory.role != "lugger" && creep.memory.role != "attacker" && creep.memory.role != "claimer" && creep.memory.role != "unclaimer" && creep.memory.role != "remoteHarvester"))
        ) {
            creep.moveTo(new RoomPosition(5, 20, creep.memory.homeRoom), { visualizePathStyle: this.lineStyle, ignoreCreeps: true });
            creep.say("🏠!", true);
            return true;
        }
        var name = creep.name.replace(/^[a-zA-Z]+/, "");

        if (!creep.memory.role.match(/^fetcher/) && Object.keys(Memory.creepIdCodes[this.myType]).length > (typeof this.maxToCreate === "function" ? this.maxToCreate(creep.room) : this.maxToCreate)) {
            console.log(name + ": Not renewing - too many creeps of  type" + this.myType + "...");
            if (creep.carry.energy == 0) {
                console.log("Not carrying anything so good night");
                creep.say("☠️");
                creep.suicide();
            }
            return false;
        }
        if (!roomData) {
            console.log("No data for room...")
            return false;
        }
        if (!roomData.spawns || roomData.spawns.length == 0) {
            console.log("No spawn")
            return false;
        }
        if (creep.fatigue > 0) {
            creep.say("😫👵")
            return true;
        }
        var target;
        if (creep.memory.committed) {
            target = Game.getObjectById(creep.memory.committed)
            if (!target || target.structureType !== STRUCTURE_SPAWN) {
                target = undefined;
            }
        }
        if (!target) {
            target = creep.pos.findClosestByRange(roomData.spawns)
        }

        if (target && target.spawning && creep.carry.energy > 100) {
            return false;
        }
        if (target) {
            creep.say("👴🏻");
            creep.moveTo(target, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
            creep.memory.committed = target.id;

            return true;
        }
        creep.say("😕");
        return false;
    },
    findGameSource: function (creep, roomData) {
        var sources = roomData.energySources.sort(this.sortEnergySources.bind(this, creep));
        if (sources.length === 0) {
            return;
        }
        var source = sources.shift();
        sources.unshift(source);
        if (source instanceof Source && typeof Memory.eaters[source.id] !== "undefined") {
            var fastHarvester = Game.creeps[Memory.eaters[source.id]];
            result = fastHarvester.pos.inRangeTo(source, 1) ? OK : ERR_NOT_IN_RANGE;
            if (!fastHarvester.memory.renewing && result === OK) {
                return fastHarvester;
            }
        }
        return source;
    },
    sortEnergySources: function (creep, a, b) {
        var aDist = creep.pos.getRangeTo(a);
        var bDist = creep.pos.getRangeTo(b);

        if (this.myType == "upgrader" && a.structureType === STRUCTURE_LINK && aDist < 10) {
            return -1;
        }
        if (this.myType == "upgrader" && b.structureType === STRUCTURE_LINK && bDist < 10) {
            return 1;
        }
        // temp fix for W16S9
        if (a.id == "5c70bbe41499b21f1c4d572f" && bDist > 5 /*|| a.id == "55c34a6b5be41a0a6e80c25f"*/) {
            return -1
        }
        if (b.id == "5c70bbe41499b21f1c4d572f" && aDist > 5 /* || b.id == "55c34a6b5be41a0a6e80c25f"*/) {
            return 1
        }

        // temp fix for W14S8
        if (a.id == "5d34ed54fa096a5b2020a189" && bDist > 5 /*|| a.id == "55c34a6b5be41a0a6e80c25f"*/) {
            return -1
        }
        if (b.id == "5d34ed54fa096a5b2020a189" && aDist > 5 /* || b.id == "55c34a6b5be41a0a6e80c25f"*/) {
            return 1
        }

        if (a instanceof Resource && !(b instanceof Resource)) {
            return -1;
        }
        if (b instanceof Resource && !(a instanceof Resource)) {
            return 1;
        }
        if (a.structureType === STRUCTURE_CONTAINER && b instanceof Source && aDist < 5) {
            return -1;
        }
        if (b.structureType === STRUCTURE_CONTAINER && a instanceof Source && bDist < 5) {
            return 1;
        }
        if (a.structureType == STRUCTURE_CONTAINER && b.structureType == STRUCTURE_CONTAINER) {
            if (aDist + 10 < bDist) {
                return -1
            }
            if (bDist + 10 < aDist) {
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
        // REMOVE THIS
        if (a.structureType === STRUCTURE_TERMINAL && b.structureType !== STRUCTURE_TERMINAL /*&& aDist < 8*/) {
            return -1
        }
        if (b.structureType === STRUCTURE_TERMINAL && a.structureType !== STRUCTURE_TERMINAL /*&& bDist < 8*/) {
            return 1
        }
        if (this.myType !== "multi" && this.myType !== "upgrader" && a instanceof Source && !(b instanceof Source)) {
            return -1
        }
        if (this.myType !== "multi" && this.myType !== "upgrader" && b instanceof Source && !(a instanceof Source)) {
            return 1
        }
        if (this.myType !== "multi" && this.myType !== "upgrader" && a.structureType === STRUCTURE_CONTAINER && b.structureType !== STRUCTURE_CONTAINER) {
            return -1
        }
        if (this.myType !== "multi" && this.myType !== "upgrader" && b.structureType === STRUCTURE_CONTAINER && a.structureType !== STRUCTURE_CONTAINER) {
            return 1
        }
        if (a.structureType === STRUCTURE_STORAGE && b.structureType !== STRUCTURE_STORAGE && b.structureType !== STRUCTURE_CONTAINER && a.store[RESOURCE_ENERGY] > 100) {
            return -1
        }
        if (b.structureType === STRUCTURE_STORAGE && a.structureType !== STRUCTURE_STORAGE && a.structureType !== STRUCTURE_CONTAINER && b.store[RESOURCE_ENERGY] > 100) {
            return 1
        }

        if (aDist < bDist) {
            return -1;
        }
        if (aDist > bDist) {
            return 1;
        }
        return 0
    },
    findStorage: function (creep) {
        if (creep.room.terminal && _.sum(creep.room.terminal.store) < creep.room.terminal.storeCapacity) {
            return creep.room.terminal;
        }
        return creep.room.storage;
    },
    findEnergySource: function (creep, roomData) {
        var source;
        // 20% chance of uncommitting to prevent logjams
        var committed = creep.memory.committed;
        if (typeof committed !== "undefined" && committed !== null && Math.random() < 0.8) {
            var obj = Game.getObjectById(committed);
            if (obj !== undefined && obj !== null) {
                return obj;
            } else {
                console.log("Uncommitting " + creep.name + " because committed id " + committed + " does not exist")
                creep.memory.committed = undefined;
            }
        }

        source = this.findGameSource(creep, roomData);
        if (source && source.id && !(source instanceof Creep)) {
            creep.memory.committed = source.id;
        }
        return source;
    },
    actuallyHarvest: function (creep, source) {
        var result;
        if (source instanceof Creep) {
            creep.say("🍇");
            result = creep.pos.inRangeTo(source, 1) ? OK : ERR_NOT_IN_RANGE;
        } else if (source instanceof Resource) {
            result = creep.pickup(source);
        } else if (typeof source.structureType !== "undefined" && (source.store || source.energy)) {
            if (source.store && source.store[RESOURCE_ENERGY] === 0) {
                creep.memory.committed = undefined;
                return ERR_NO_PATH;
            }
            var amount = Math.min(source.store ? source.store[RESOURCE_ENERGY] : source.energy, creep.carryCapacity - creep.carry.energy);
            //console.log(creep.name + " Withdrawing "+amount+" of "+source.store[RESOURCE_ENERGY]);
            result = creep.withdraw(source, RESOURCE_ENERGY, amount);
            creep.say('🔄 ')
            //console.log("Result "+result);
        } else if (typeof source.resourceType !== "undefined") {
            result = creep.pickup(source);
            creep.say('🍄')
        } else {
            result = creep.harvest(source);
            creep.say('🌽');
            //console.log(source.id);
        }
        return result;
    },
    doHarvest: function (creep, roomData) {
        if (creep.room.name != creep.memory.homeRoom && !creep.room.my) {
            if (creep.fatigue > 0) {
                creep.say("😴💤")
                return true
            }
            creep.moveTo(new RoomPosition(20, 20, creep.memory.homeRoom), { visualizePathStyle: this.lineStyle, ignoreCreeps: true });
            creep.say("🏠H", true);
            return true;
        }
        var source = this.findEnergySource(creep, roomData);
        if (source === null || typeof source === "undefined") {
            creep.say("X E");
            return -999;
        }
        var result = this.actuallyHarvest(creep, source)
        //console.log(source.id+": "+result+" "+source.id+" "+source.structureType);
        if (result === OK && _.sum(creep.carry) < creep.carryCapacity) {
            creep.memory.harvesting = true;
            return;
        }
        creep.memory.harvesting = false;
        if (result === ERR_NOT_IN_RANGE || result == ERR_NOT_ENOUGH_RESOURCES) {
            if (creep.fatigue > 0) {
                creep.say("😟");
                return result;
            }
            var moveResult = creep.moveTo(source, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000, ignoreCreeps: !creep.pos.inRangeTo(source, 15) });
            if (moveResult === ERR_NO_PATH) {
                creep.say("X")
                creep.memory.committed = undefined;
            }
            return moveResult;
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
            var created = spawn.createCreep(units, newName, { role: this.myType, creepIndex: creepIndex, renewable: renewable, homeRoom: spawn.room.name, originalType: this.myType });
            if (created == newName) {
                Memory.spawnType = this.myType;
                return true;
            } else {
                console.log("Create failed");
            }
        }
        return false;
    },
    creepIsBoosted: function (creep) {
        return _.reduce(_.map(creep.body, (i, j) => i.boost != undefined), (memo, input) => (memo || input), false)
    }
};