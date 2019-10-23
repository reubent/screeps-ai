var baseRole = require("baseRole");
var roleTowerRenewer = require("role.towerRenewer")
var roleMulti = Object.assign({}, baseRole, {
    units: [WORK, MOVE, MOVE, CARRY],
    myType: "multi",
    maxToCreate: (room) => {
        return room.name == "W19S11" || room.name == "W14S8" ? 4 : 2;
    },
    isTarget: function (structure) {
        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_POWER_SPAWN) &&
            structure.energy < structure.energyCapacity;
    },
    lineStyle: {
        stroke: '#ffc0ff',
        strokeWidth: 0.1,
        opacity: 1,
        lineStyle: undefined
    },
    getUnits: function (spawn) {
        var units = [];
        for (var i = 0; i < spawn.room.energyCapacityAvailable && i < 2200; i += 500) {
            units = units.concat(this.units);
        }
        console.log("multi: " + JSON.stringify(units));
        return units;
    },
    spawnInit: function (spawn) {
        return true;
    },
    hasNonEnergyResource: function (creep) {
        for (var i in creep.store) {
            if (creep.store.hasOwnProperty(i) && i !== RESOURCE_ENERGY && creep.store[i] > 0) {
                return i;
            }
        }
        return false;
    },

    run: function (creep, roomData) {
        // if we're being renewed, wait
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("⏲️");
            creep.memory.sleeping--;
            return;
        }
        //creep.memory.mining = false;
        // if we've got < 100 ttl then let's get renewed
        if (creep.ticksToLive < 60 && this.handleTtl(creep, roomData)) {
            return;
        }
        if (_.sum(creep.store) < creep.store.getCapacity() && creep.memory.mining) {
            this.goMining(creep, roomData);
            return;
        } else {
            creep.memory.mining = false;
        }
        if (!roomData) {
            if (!creep.room.controller || !creep.room.controller.my) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                creep.say("Lost")
                creep.moveTo(new RoomPosition(20, 20, creep.memory.homeRoom), { visualizePathStyle: this.lineStyle, maxOps: 1000 })
            }
            return
        }
        // if we're empty, go find some energy
        var needEnergy = roomData.needEnergy.length + roomData.construction.length;
        //console.log(creep.room.name + ": needs energy "+needEnergy)
        if (needEnergy > 0 && (_.sum(creep.store) < 1 || creep.memory.harvesting)) {
            //console.log(creep.id+": - harvesting");
            var result = this.doHarvest(creep, roomData);
            if (_.sum(creep.store) == creep.store.getCapacity()) {
                creep.memory.harvesting = false;

            } else if (result == ERR_NO_PATH || result === -999) {
                if (this.goMining(creep, roomData) === false) {
                    // console.log("Mining as no path");
                    creep.say("X");
                    creep.move(TOP);
                }
            }
            return;
        }
        var dropped;
        if (_.sum(creep.store) < creep.store.getCapacity() / 2 && roomData.dropped.length > 0) {

            var dropped = creep.pos.findClosestByRange(roomData.dropped);
            if (dropped.amount > 20) {
                creep.say("DROPPED")
                var result = creep.pickup(dropped)
                if (result !== OK) {
                    if (creep.fatigue > 0) {
                        creep.say("😴💤")
                        return
                    }
                    creep.moveTo(dropped, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
                    return;
                }
            }
        }
        if (_.sum(creep.store) < creep.store.getCapacity() / 2 && roomData.tombstones.length > 0) {
            //console.log("Looking for tombstones")
            var dropped = creep.pos.findClosestByRange(roomData.tombstones);
            creep.say("⚰️")
            var result = -1;
            for (var i in dropped.store) {
                if (dropped.store.hasOwnProperty(i) && dropped.store[i] > 50) {
                    result = creep.withdraw(dropped, i)
                    break;
                }
            }
            if (result !== OK && result != -1) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                creep.moveTo(dropped, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
                return;
            }
        }
        creep.memory.harvesting = false;
        // if we're carrying something that's not energy, get rid of it
        var resource = this.hasNonEnergyResource(creep);
        if (resource !== false) {
            //console.log(creep.id+": - depositing resource");
            var target = this.findStorage(creep);
            if (target) {
                creep.say(resource);
                var result = creep.transfer(target, resource);
                if (result === ERR_NOT_IN_RANGE) {
                    if (creep.fatigue > 0) {
                        creep.say("😴💤")
                        return
                    }
                    creep.moveTo(target, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
                }
                return;
            }
        }
        // otherwise, find something useful to do...

        // find targets with less than full health as long as they have less than 1000 hit points
        var repairers = 0;
        for (var i in roomData.towers) {
            if (roomData.towers[i].energy > 410) {
                repairers++;
            }
        }
        if (repairers < 1 && roomData.repair.length) {
            if (roomData.towers.length > 0) {
                console.log("Using " + creep.name + " as tower renewer")
                return roleTowerRenewer.run(creep, roomData)
            }
            //console.log(creep.id+": - repairing");
            var target = creep.pos.findClosestByRange(roomData.repair, { maxRooms: 1 });
            if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                creep.say("🔧");
                //console.log("Repairing " + target.id + " which is of type " + target.structureType);
                creep.moveTo(target, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
            }
            return;
        }
        if (roomData.construction.length) {
            var target
            if (roomData.highPriConstruction.length) {
                target = creep.pos.findClosestByRange(roomData.highPriConstruction, { maxRooms: 1 });
            } else {
                target = creep.pos.findClosestByRange(roomData.construction, { maxRooms: 1 });
            }
            if (typeof target !== "undefined") {
                creep.say("🏗️");
                var result = creep.build(target);
                if (result === ERR_NOT_IN_RANGE) {
                    if (creep.fatigue > 0) {
                        creep.say("😴💤")
                        return
                    }
                    var moveTo = creep.moveTo(target, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
                    if (moveTo !== OK) {
                        creep.say("!");
                    }
                    return;
                }
                if (result === OK) {
                    return;
                }
            }
        }
        if (needEnergy) {
            // if there are empty extensions, fill them...
            var targets = roomData.needEnergyHighPriority;

            if (targets.length < 1) {
                targets = roomData.needEnergy;
            }

            if (targets.length < 1) {
                // and if there's nothing useful to do, store what we have. this may result in repeatedly storing/unstoring but that's better than losing the collector work
                targets = [this.findStorage(creep)]
            }

            if (targets.length > 0) {
                var target = this.findTarget(targets, creep);
                var result = creep.transfer(target, RESOURCE_ENERGY);
                if (result == ERR_NOT_IN_RANGE) {
                    if (creep.fatigue > 0) {
                        creep.say("😟");
                        return;
                    }
                    creep.say('▶️ ');
                    creep.moveTo(target, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
                } else if (result == OK) {
                    creep.memory.committed = undefined;
                }
                return;
            }
        }
        if (_.sum(creep.store) == creep.store.getCapacity()) {
            creep.say("Full")
            if (creep.room.name != creep.memory.homeRoom) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                creep.moveTo(new RoomPosition(10, 10, creep.memory.homeRoom), { visualizePathStyle: this.lineStyle, maxRooms: 5, maxOps: 1000 })
                creep.say("H")
            }
            return;
        }

        // and if all else fails, let's go mining...
        if (creep.store.getCapacity() > _.sum(creep.store) && this.goMining(creep, roomData)) {
            return;
        }
        //console.log("Checking to move from stores...")
        if (creep.room.terminal && creep.room.storage && _.sum(creep.room.storage.store) > 0 && _.sum(creep.room.terminal.store) < creep.room.terminal.storeCapacity) {
            var resources = _.keys(creep.room.storage.store);
            var resource = ""
            for (var tryResource of resources) {
                //console.log(tryResource)
                if (tryResource === RESOURCE_ENERGY) {
                    //console.log(creep.room.name+" Not moving energy... pointless")
                    continue;
                }
                if (creep.room.terminal.store[tryResource] > 50000) {
                    //console.log(creep.room.name+" Too much "+tryResource+" in the terminal")
                    continue;
                }
                if (tryResource === RESOURCE_OPS && creep.room.terminal.store[tryResource] > 10000) {
                    //console.log(creep.room.name+" Too much "+tryResource+" in the terminal")
                    continue;
                }
                if (creep.room.storage.store[tryResource] == 0) {
                    //console.log(creep.room.name+" Not actually any "+tryResource+" in the storage")
                    continue;
                }
                resource = tryResource
                break
            }
            if (resource === "") {
                //console.log(creep.room.name+" Not moving from stores")
                return;
            }
            //console.log(creep.room.name+" Moving from stores...")
            var res = creep.withdraw(creep.room.storage, resource);
            if (res == ERR_NOT_IN_RANGE) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                creep.moveTo(creep.room.storage, { maxRooms: 1, visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
                creep.say("Fe")
            } else if (res == OK) {
                creep.say("Ca")
            } else {
                console.log("Could not withdraw " + resource + " from storage " + res + " creep is carrying " + JSON.stringify(creep.store) + " in room " + creep.room.name)
            }
        }
        creep.say("😴");

        // console.log(creep.id+": - end");

    },
    goMining: function (creep, roomData) {
        //console.log(creep.room.name+ " Mining?")
        if (!roomData.mine || !roomData.mineral) {
            //console.log(creep.room.name+": No mine or mineral")
            creep.memory.mining = false;
            return false;
        }
        if (roomData.mineral.mineralAmount < 1) {
            //console.log("Not enough mineral "+roomData.mineral.mineralType+" in room "+creep.room.name+" to be worth mining");
            creep.memory.mining = false;
            return false;
        }
        if (!Game.rooms[creep.room.name].terminal) {
            creep.memory.mining = false;
            return false;
        }
        var stock = Game.rooms[creep.room.name].terminal.store[roomData.mineral.mineralType] ? Game.rooms[creep.room.name].terminal.store[roomData.mineral.mineralType] : 0
        stock += Game.rooms[creep.room.name].storage.store[roomData.mineral.mineralType] ? Game.rooms[creep.room.name].storage.store[roomData.mineral.mineralType] : 0

        if (stock > 100000) {
            //console.log("Already have a lot of minerals in "+creep.room.name+"...")
            creep.memory.mining = false;
            return false
        }
        var distanceToMine = creep.pos.getRangeTo(roomData.mine)
        if (distanceToMine < 2 && roomData.mine.cooldown > 0) {
            if (_.sum(creep.store) > 0) {
                creep.memory.sleeping = 1;
                creep.say("⛏️😴")
                //console.log(creep.room.name+" Extractor cooling down for " + roomData.mine.cooldown);
                return true;
            }
            //console.log(creep.room.name+" Extractor cooling down for " + roomData.mine.cooldown);
            return false;
        }
        creep.say("⛏️");

        var result = distanceToMine < 2 ? creep.harvest(roomData.mineral) : ERR_NOT_IN_RANGE;
        creep.memory.mining = true;
        if (result === ERR_NOT_IN_RANGE) {
            //console.log(creep.room.name+" Going to mine...")
            if (creep.fatigue > 0) {
                creep.say("😴💤")
                return true
            }
            creep.moveTo(roomData.mine, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
            return true;
        }
        if (result === OK) {
            //console.log("Mined")

        } else {
            console.log("Can't mine - " + result)
        }
        return true;

    },
    findTarget: function (targets, creep) {
        return creep.pos.findClosestByRange(targets, { maxRooms: 1, maxOps: 1000 });
    }
});

module.exports = roleMulti;