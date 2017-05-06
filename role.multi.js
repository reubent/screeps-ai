var baseRole = require("baseRole");
var roleMulti = {
    units: [WORK, MOVE, MOVE, CARRY],
    myType: "multi",
    maxToCreate: 2,
    findLinkAsSource: baseRole.findLinkAsSource,
    isTarget: function (structure) {
        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                structure.energy < structure.energyCapacity;
    },
    lineStyle: {
        stroke: '#ffc0ff',
        strokeWidth: 0.2,
        opacity: 1,
        lineStyle: undefined
    },
    getUnits: function (spawn) {
        var units = [];
        for (var i = 0; i < spawn.room.energyCapacityAvailable; i += 450) {
            units = units.concat(this.units);
        }
        console.log("multi: " + JSON.stringify(units));
        return units;
    },
    spawnInit: function (spawn) {
        return true;
    },
    doSpawn: baseRole.doSpawn,
    doHarvest: baseRole.doHarvest,
    handleTtl: baseRole.handleTtl,
    findStoreAsSource: baseRole.findStoreAsSource,
    findGameSource: baseRole.findGameSource,
    findStorage: baseRole.findStorage,
    findDroppedResources: function (creep, energyOnly) {
        return creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: function (resource) {
                return (!energyOnly || resource.resourceType === RESOURCE_ENERGY) && resource.amount > 25;
            }
        });
    },
    findEnergySource: function (creep) {
        var source;
        // 10% chance of uncommitting to prevent logjams
        if (typeof creep.memory.committed !== "undefined" && Math.random() < 0.95) {
            //console.log("Creep "+creep.name+" is committed to "+creep.memory.committed);
            source = Game.getObjectById(creep.memory.committed);
        } else {
            source = this.findDroppedResources(creep, false);
            if (!source) {
                source = this.findLinkAsSource(creep);
            }
            if (!source) {
                //console.log("Using stores");
                source = this.findStoreAsSource(creep);
            }
            if (!source && creep.room.name == "W19S5") {
                //console.log("Using game source");
                source = this.findGameSource(creep);
            }
            if (source === null || typeof source === "undefined") {
                creep.say("No path");
                creep.move(TOP);
                return;
            }
            // console.log("Committing "+creep.name+" to source "+source.id);
            creep.memory.committed = source.id;
        }
        return source;
    },
    hasNonEnergyResource: function (creep) {
        for (var i in creep.carry) {
            if (creep.carry.hasOwnProperty(i) && i !== RESOURCE_ENERGY && creep.carry[i] > 0) {
                return i;
            }
        }
        return false;
    },
    /** @param {Creep} creep **/
    run: function (creep) {

        // if we're being renewed, wait
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("Wait!");
            creep.memory.sleeping--;
            return;
        }
        //creep.memory.mining = false;
        // if we've got < 100 ttl then let's get renewed
        if (creep.ticksToLive < 120) {
            this.handleTtl(creep);
            return;
        }
        if (_.sum(creep.carry) < creep.carryCapacity && creep.memory.mining) {
            this.goMining(creep);
            return;
        } else {
            creep.memory.mining = false;
        }
        // if we're empty, go find some energy
        if (_.sum(creep.carry) < 1 || creep.memory.harvesting) {
            //console.log(creep.id+": - harvesting");
            var result = this.doHarvest(creep);
            if (_.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.harvesting = false;

            } else if (result == ERR_NO_PATH || result === -999) {
                if (this.goMining(creep) === false) {
                    console.log("Mining as no path");
                    creep.say("No path");
                    creep.move(TOP);
                }
            }
            return;
        }
        // if we're carrying something that's not energy, get rid of it
        var resource = this.hasNonEnergyResource(creep);
        if (resource !== false) {
            //console.log(creep.id+": - depositing resource");
            var target = this.findStorage(creep);
            if (target) {
                creep.say("Store " + resource);
                var result = creep.transfer(target, resource);
                if (result === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: this.lineStyle});
                } else if (result != OK) {
                    console.log("Error storing - " + result);
                }
                return;
            }
        }
        // otherwise, find something useful to do...
        if (this.handleTtl(creep)) {
            //console.log(creep.id+": - renewing");
            return;
        }
        // find targets with less than full health as long as they have less than 1000 hit points
        var towers = creep.room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_TOWER;
            }
        });
        var repairers = 0;
        for (var i in towers) {
            if (towers[i].energy > 410) {
                repairers++;
            }
        }
        if (repairers < 1) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    return structure.hits < Math.min(structure.hitsMax, 1000);
                }
            });
            if (targets.length) {
                //console.log(creep.id+": - repairing");
                var target = creep.pos.findClosestByPath(targets);
                if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                    creep.say("REPAIR");
                    console.log("Repairing " + target.id + " which is of type " + target.structureType);
                    creep.moveTo(target, {visualizePathStyle: this.lineStyle});
                }
                return;
            }
        } else {
            //console.log("Other repairers available");
        }
        // failing that, is there something to build?
        targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: function (site) {
                return site.structureType == STRUCTURE_ROAD;//true || site.structureType === STRUCTURE_WALL || site.structureType === STRUCTURE_RAMPART;
            }
        });
        if (!targets.length) {
            targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        }
        if (targets.length) {
            //console.log(creep.id+": - building");
            var target = creep.pos.findClosestByPath(targets);
            if (typeof target !== "undefined") {
                creep.say("Building");
                var result = creep.build(target);
                if (result === ERR_NOT_IN_RANGE) {
                    var moveTo = creep.moveTo(target, {visualizePathStyle: this.lineStyle});
                    if (moveTo !== OK) {
                        creep.say("Stuck!");
                    }
                    return;
                }
                if (result === OK) {
                    return;
                }
            }
        }
        // if there are empty extensions, fill them...
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return (structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
            }
        });
        if (targets.length < 1) {
            // and if there's nothing useful to do, store what we have. this may result in repeatedly storing/unstoring but that's better than losing the collector work
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    var spaceUsed = _.sum(structure.store);
                    return (structure.structureType == STRUCTURE_CONTAINER) && spaceUsed < structure.storeCapacity;
                }
            });
        }
        if (targets.length < 1) {
            // and if there's nothing useful to do, store what we have. this may result in repeatedly storing/unstoring but that's better than losing the collector work
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    var spaceUsed = _.sum(structure.store);
                    return (structure.structureType == STRUCTURE_STORAGE) && spaceUsed < structure.storeCapacity;
                }
            });
        }
        if (targets.length > 0) {
            //console.log(creep.id+": - depositing");
            var target = this.findTarget(targets, creep);
            var result = creep.transfer(target, RESOURCE_ENERGY);
            if (result == ERR_NOT_IN_RANGE) {
                if (creep.fatigue > 0) {
                    creep.say("Tired 😟");
                    return;
                }
                creep.say('▶️ move');
                creep.moveTo(target, {visualizePathStyle: this.lineStyle});
            } else if (result == OK) {
                creep.memory.committed = undefined;
            }
            return;
        }
        // and if all else fails, let's go mining...
        if (creep.carryCapacity > _.sum(creep.carry)) {
            this.goMining(creep);
        }


        // console.log(creep.id+": - end");

    },
    goMining: function (creep) {
        //console.log(creep.room.name+" shall we go mining?");
        var mines = creep.room.find(FIND_MINERALS);
        if (mines.length > 0) {
            var mine = mines.pop();
            var extractor = mine.pos.lookFor(LOOK_STRUCTURES).pop();
            if (!extractor) {
                //console.log("No extractor");
                return;
            }
            creep.say("Mining");
            creep.moveTo(mine, {visualizePathStyle: this.lineStyle});
            if (extractor.cooldown > 0) {
                creep.memory.sleeping = 1;
                console.log("Extractor cooling down for " + extractor.cooldown);
                return true;
            }
            var result = creep.harvest(mine);

            if (result === OK) {
                creep.memory.mining = true;
            } else {
                //console.log("Mining result "+result);
            }
            return true;
        } else {
            //console.log(creep.room.name+" Nothing to mine");
            creep.memory.mining = false;
            return false;
        }
    },
    findTarget: function (targets, creep) {
        return creep.pos.findClosestByPath(targets);
    }
};

module.exports = roleMulti;