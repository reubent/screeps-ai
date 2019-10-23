var roleHarvester = require('role.harvester');
var roleFastHarvester = require('role.fastHarvester');
var roleUpgrader = require('role.upgrader');
var roleDefender = require('role.defender');
var roleTowerRenewer = require('role.towerRenewer');
var roleAttacker = require('role.attacker');
var roleClaimer = require('role.claimer');
var roleMulti = require('role.multi');
var roleLabWorker = require("role.labWorker");
var roleLugger = require('role.lugger');
var roleUnclaimer = require('role.unclaimer');
var roleHealer = require('role.healer')
var roleRemoteHarvester = require('role.remoteHarvester')
var roleTipper = require('role.tipper')

module.exports = {
    initLabWorker: function () {
        roleLabWorker.init();
        return roleLabWorker;
    },
    renewCreep: function (spawn) {
        var near = spawn.pos.findInRange(FIND_MY_CREEPS, 1);

        near.sort(this.sortCreepsForRenewal);
        try {
            while (near.length > 0) {
                var creep = near.pop()
                if (this.creepIsBoosted(creep)) {
                    console.log("Not renewing as boosted")
                    continue
                }
                var renewVal = this.renewACreep(spawn, creep);
                if (renewVal > 0) {
                    //console.log("Renewed creep")
                    break;
                }
            }
        } catch (e) {
            console.log("Not renewing any creeps... " + e.message);
        }
        return false;
    },
    sortCreepsForRenewal: function (a, b) {
        if (a.ticksToLive > b.ticksToLive) {
            return -1;
        } else if (b.ticksToLive > a.ticksToLive) {
            return 1;
        }
        return 0;
    },
    renewACreep: function (spawn, creepToRenew) {
        //var creepInfo = creepToRenew.name + " (" + creepToRenew.ticksToLive + "/" + creepToRenew.memory.role + "): ";
        //console.log("Creep has " + creepToRenew.carry.energy + " and there is " + spawn.energy + " in the spawn");
        if (creepToRenew.carry && creepToRenew.carry.energy > 0 && spawn.energy < 300) {
            // console.log("Hand over energy... it's only polite");
            var amount = Math.min(spawn.energyCapacity - spawn.energy, creepToRenew.carry.energy);
            var result = creepToRenew.transfer(spawn, RESOURCE_ENERGY, amount);
            // console.log("Transfer result " + result);
        }
        if (spawn.energyAvailable < 100) {
            creepToRenew.memory.sleeping = 0;
            // console.log(creepInfo + "Not renewing - no energy");
            return false;
        }
        if (creepToRenew.ticksToLive > 1420) {
            creepToRenew.memory.sleeping = 0;
            //  console.log(creepInfo + "Long TTL");
            return;
        }
        if (typeof creepToRenew.memory.renewable !== "undefined" && creepToRenew.memory.renewable === false) {
            //  console.log(creepInfo + "Basic creep - not renewable");
            return false;
        }
        if (creepToRenew.memory.role == "harvester" && creepToRenew.ticksToLive > 1000) {
            creepToRenew.memory.sleeping = 0;
            //  console.log(creepInfo + "Harvester with long TTL... skipping");
            return false;
        }
        var renewVal = spawn.renewCreep(creepToRenew);
        if (renewVal == ERR_NOT_ENOUGH_ENERGY) {
            throw new Error("Not enough energy in room");
        }
        if (renewVal == ERR_FULL) {
            creepToRenew.memory.sleeping = 0;
        }
        if (renewVal != OK) {
            // console.log(creepInfo + "Can't renew..." + this.getRenewReason(renewVal));
            return renewVal;
        }
        //console.log(creepInfo + "Creep TTL is now " + creepToRenew.ticksToLive);
        creepToRenew.say("Thanks!");
        creepToRenew.memory.sleeping = Math.round((1300 - creepToRenew.ticksToLive) / 100);
        return true;
    },
    getRenewReason: function (renewVal) {
        switch (renewVal) {
            case ERR_NOT_OWNER:
                return "Not my creep";
            case ERR_BUSY:
                return "Spawn busy";
            case ERR_NOT_ENOUGH_ENERGY:
                return "Not enough energy";
            case ERR_INVALID_TARGET:
                return "Not a creep";
            case ERR_FULL:
                return "Already at max TTL";
            case ERR_NOT_IN_RANGE:
                return "Out of range";
            default:
                return "Unknown reason";
        }
    },
    spawn: function (spawn, creepsByType) {
        //console.log("Should have "+roleFastHarvester.maxToCreate(spawn.room)+" of selected");
        if (roleLugger.doSpawn(spawn, creepsByType[roleLugger.myType])) {
            return;
        }
        if (roleDefender.doSpawn(spawn, creepsByType[roleDefender.myType])) {
            return;
        }
        if (roleHarvester.doSpawn(spawn, creepsByType[roleHarvester.myType])) {
            return;
        }
        if (creepsByType.harvester < 1) {
            console.log("No harvesters so not trying other types");
            return;
        }

        if (roleFastHarvester.doSpawn(spawn, creepsByType[roleFastHarvester.myType])) {
            return;
        }

        if (creepsByType.upgrader > 0 && creepsByType.harvester > 0 && creepsByType.multi > 0) {
            if (roleTowerRenewer.doSpawn(spawn, creepsByType[roleTowerRenewer.myType])) {
                return;
            }

            if (roleClaimer.doSpawn(spawn, creepsByType[roleClaimer.myType])) {
                return;
            }
            
            if (roleUnclaimer.doSpawn(spawn, creepsByType[roleClaimer.myType])) {
                return;
            }
        } else if (creepsByType.harvester > 0) {
            console.log("Using limited spawn list until we have an upgrader and a multi");
            if (creepsByType.upgrader === 0) {
                if (roleUpgrader.doSpawn(spawn, creepsByType[roleUpgrader.myType])) {
                    return;
                }
            } else {
                if (roleMulti.doSpawn(spawn, creepsByType[roleMulti.myType])) {
                    return;
                }
            }
            return;
        }

        if (roleMulti.doSpawn(spawn, creepsByType[roleMulti.myType])) {
            return;
        }

        if (roleUpgrader.doSpawn(spawn, creepsByType[roleUpgrader.myType])) {
            return;
        }
        if (roleHealer.doSpawn(spawn, creepsByType[roleHealer.myType])) {
            return;
        }
        if (roleLabWorker.doSpawn(spawn, creepsByType[roleLabWorker.myType])) {
            return;
        }
        if (roleRemoteHarvester.doSpawn(spawn, creepsByType[roleRemoteHarvester.myType])) {
            return;
        }
        if (roleTipper.doSpawn(spawn, creepsByType[roleTipper.myType])) {
            return;
        }
        if (roleAttacker.doSpawn(spawn, creepsByType[roleAttacker.myType])) {
            return;
        }

        if (creepsByType.harvester === roleHarvester.maxToCreate && creepsByType.upgrader === roleUpgrader.maxToCreate && creepsByType.defender === roleDefender.maxToCreate) {
            if (roleAttacker.doSpawn(spawn, creepsByType[roleAttacker.myType])) {
                return;
            }
        }
    },
    checkCreepsInRoom: function (room) {
        var creepsByType = {
            harvester: 0,
            fastHarvester: 0,
            multi: 0,
            upgrader: 0,
            defender: 0,
            towerRenewer: 0,
            attacker: 0,
            claimer: 0,
            healer: 0,
            lugger: 0,
            claimer: 0,
            unclaimer: 0,
            labWorker: 0,
            remoteHarvester: 0,
            tipper: 0
        };

        var creepIdCodes = {
            harvester: {},
            fastHarvester: {},
            multi: {},
            upgrader: {},
            defender: {},
            towerRenewer: {},
            attacker: {},
            healer: {},
            claimer: {},
            unclaimer: {},
            lugger: {},
            labWorker: {},
            remoteHarvester: {},
            tipper: {},
        }
        var creepsByRoom = {};

        var names = {};
        var lowestTtl = 1500;
        var lowestTtlName;

        for (var name in Game.creeps) {
            names[name] = true;
            var creep = Game.creeps[name];
            if (creep.room.name !== room.name) {
                continue;
            }
            creepsByType[creep.memory.role]++;
            if (creep.ticksToLive < lowestTtl) {
                lowestTtl = creep.ticksToLive;
                lowestTtlName = creep.name;
            }

            if (typeof creepIdCodes[creep.memory.role] !== "undefined") {
                creepIdCodes[creep.memory.role][creep.memory.creepIndex] = 1;
                if (!creepsByRoom[creep.memory.role]) {
                    creepsByRoom[creep.memory.role] = 0
                }
                creepsByRoom[creep.memory.role]++
            }
        }
        //console.log("lowest ttl is " + lowestTtl + " for creep " + lowestTtlName);
        if (typeof Memory.eaters === "undefined") {
            Memory.eaters = {};
        }

        for (var i in Memory.creeps) {
            if (!names.hasOwnProperty(i)) {
                console.log(i + " is gone... killing");
                delete Memory.creeps[i];
                for (var k in Memory.eaters) {
                    if (Memory.eaters.hasOwnProperty(k) && Memory.eaters[k] == i) {
                        console.log("Removing entry for " + k + " from eaters");
                        delete Memory.eaters[k];
                    }
                }
            }
        }
        Memory.creepIdCodes = creepIdCodes;
        var creepVals = Memory.creepsByRoom
        if (!creepVals) {
            creepVals = {};
        }
        creepVals[room.name] = creepsByRoom
        Memory.creepsByRoom = creepVals;
        //console.log("Extant creeps: " + JSON.stringify(creepsByType));
        return creepsByType;
    },
    creepDiscrepancies: function(room) {
        var creepsByType = this.checkCreepsInRoom(room);
        var discrepancies = "";
        for (var i in creepsByType) {
            var needed = 0;
            try {
                var neededObj = this.getCreepRunner(i).maxToCreate;
                needed = typeof neededObj === "function" ? neededObj(room) : neededObj;
            } catch(e) {
                console.warn(e)
            }
            if (needed != creepsByType[i]) {
                discrepancies += `${i}: ${creepsByType[i]} vs ${needed} `
            }
        }
        return {discrepancies, creepsByType}
    },
    getCreepRunner: function(creepType) {
        switch (creepType) {
            case 'harvester':
                return roleHarvester
            case 'fastHarvester':
                return roleFastHarvester
            case 'attacker':
                return roleAttacker
            case 'multi':
                return roleMulti
            case 'upgrader':
                return roleUpgrader
            case 'defender':
                return roleDefender
            case 'towerRenewer':
                return roleTowerRenewer
            case 'claimer':
                return roleClaimer
            case 'unclaimer':
                return roleUnclaimer
            case 'labWorker':
                return roleLabWorker
            case 'lugger':
                return roleLugger
            case 'healer':
                return roleHealer
            case 'remoteHarvester':
                return roleRemoteHarvester
            case 'tipper':
                return roleTipper;
            default:
                throw "Error - unknown type "+creepType
        }
    },
    runCreep: function (creep, baseData) {
        if (creep.spawning) {
            console.log(`Creep ${creep.name} in room ${creep.room.name} is still being spawned...`)
            return;
        }
        var cpu = Game.cpu.getUsed();
        var roomData = baseData.rooms[creep.room.name]
        if (
            (creep.memory.role != "claimer" && creep.memory.role !== "unclaimer" && creep.memory.role !== "healer" && creep.memory.role !== "attacker" && creep.memory.role != "lugger" && creep.memory.role != "remoteHarvester") 
            && creep.room.name != creep.memory.homeRoom) {
            creep.moveTo(new RoomPosition(20, 20, creep.memory.homeRoom), {visualizePathStyle: {
                    stroke: '#ff2020',
                    strokeWidth: 0.1,
                    opacity: 0.5,
                    lineStyle: undefined
                }});
            creep.say("🏠", true);
            return true;
        }
        try {
            this.getCreepRunner(creep.memory.role).run(creep, roomData);
            var endcpu = Game.cpu.getUsed();
            var totalCpu = endcpu - cpu;
            if (totalCpu > 2) {
                console.log("Creep " + creep.name + " in room " + creep.room.name + " used " + totalCpu.toFixed(2) + " CPU")
            }

        } catch (e) {
            console.log("ERROR: " + JSON.stringify(e) + " running creep " + creep.name + " of type " + creep.memory.role);
            Game.notify("ERROR: " + JSON.stringify(e) + " running creep " + creep.name + " of type " + creep.memory.role, 5);
        }
    },
    creepIsBoosted: function (creep) {
        return _.reduce(_.map(creep.body, (i, j) => i.boost != undefined), (memo, input) => (memo || input), false)
    }
};