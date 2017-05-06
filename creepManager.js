var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleDefender = require('role.defender');
var roleHealer = require('role.healer');
var roleRepairer = require('role.repairer');
var roleCollector = require('role.collector');
var roleTowerRenewer = require('role.towerRenewer');
var roleAttacker = require('role.attacker');
var roleClaimer = require('role.claimer');
var roleMulti = require('role.multi');
var roleFetcher = require('role.fetcher');

module.exports = {
    renewCreep: function (spawn) {
        var near = spawn.pos.findInRange(FIND_MY_CREEPS, 1);

        near.sort(this.sortCreepsForRenewal);
        try {
            while (near.length > 0) {
                var renewVal = this.renewACreep(spawn, near.pop());
                if (renewVal > 0) {
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
        var creepInfo = creepToRenew.name + " (" + creepToRenew.ticksToLive + "/" + creepToRenew.memory.role + "): ";
        console.log("Creep has " + creepToRenew.carry.energy + " and there is " + spawn.energy + " in the spawn");
        if (creepToRenew.carry && creepToRenew.carry.energy > 0 && spawn.energy < 300) {
            console.log("Hand over energy... it's only polite");
            var amount = Math.min(spawn.energyCapacity - spawn.energy, creepToRenew.carry.energy);
            var result = creepToRenew.transfer(spawn, RESOURCE_ENERGY, amount);
            console.log("Transfer result " + result);
        }
        if (spawn.energyAvailable < 100) {
            creepToRenew.memory.sleeping = 0;
            console.log(creepInfo + "Not renewing - no energy");
            return false;
        }
        if (creepToRenew.ticksToLive > 1320) {
            creepToRenew.memory.sleeping = 0;
            console.log(creepInfo + "Long TTL");
            return;
        }
        if (typeof creepToRenew.memory.renewable !== "undefined" && creepToRenew.memory.renewable === false) {
            console.log(creepInfo + "Basic creep - not renewable");
            return false;
        }
        if (creepToRenew.memory.role == "harvester" && creepToRenew.ticksToLive > 1000) {
            creepToRenew.memory.sleeping = 0;
            console.log(creepInfo + "Harvester with long TTL... skipping");
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
            console.log(creepInfo + "Can't renew..." + this.getRenewReason(renewVal));
            return renewVal;
        }
        console.log(creepInfo + "Creep TTL is now " + creepToRenew.ticksToLive);
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
        console.log("Extant creeps: " + JSON.stringify(creepsByType));
        if (roleHarvester.doSpawn(spawn, creepsByType[roleHarvester.myType])) {
            return;
        }
        if (creepsByType.harvester < 1) {
            console.log("No harvesters so not trying other types");
            return;
        }

        if (creepsByType.upgrader > 0 && creepsByType.harvester > 0 && creepsByType.multi > 0) {
            if (roleTowerRenewer.doSpawn(spawn, creepsByType[roleTowerRenewer.myType])) {
                return;
            }

            if (roleHealer.doSpawn(spawn, creepsByType[roleHealer.myType])) {
                return;
            }

            if (roleDefender.doSpawn(spawn, creepsByType[roleDefender.myType])) {
                return;
            }

            if (roleClaimer.doSpawn(spawn, creepsByType[roleClaimer.myType])) {
                return;
            }
        } else if (creepsByType.harvester > 0) {
            console.log("Using limited spawn list until we have an upgrader and a multi");
            if (creepsByType.upgrader == 0) {
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

        if (roleBuilder.doSpawn(spawn, creepsByType[roleBuilder.myType])) {
            return;
        }

        if (roleRepairer.doSpawn(spawn, creepsByType[roleRepairer.myType])) {
            return;
        }

        if (creepsByType.harvester == roleHarvester.maxToCreate && creepsByType.upgrader == roleUpgrader.maxToCreate && creepsByType.defender == roleDefender.maxToCreate) {
            if (roleAttacker.doSpawn(spawn, creepsByType[roleAttacker.myType])) {
                return;
            }
            if (roleCollector.doSpawn(spawn, creepsByType[roleCollector.myType])) {
                return;
            }
        }
    },
    checkCreepsInRoom: function (spawn) {
        var creepsByType = {
            harvester: 0,
            multi: 0,
            repairer: 0,
            upgrader: 0,
            builder: 0,
            healer: 0,
            defender: 0,
            collector: 0,
            towerRenewer: 0,
            attacker: 0,
            claimer: 0,
            fetcher: 0
        };

        var creepIdCodes = {
            harvester: {},
            multi: {},
            repairer: {},
            upgrader: {},
            builder: {},
            healer: {},
            defender: {},
            collector: {},
            towerRenewer: {},
            attacker: {},
            claimer: {},
            fetcher: {}
        }

        var names = {};
        var lowestTtl = 1500;
        var lowestTtlName;

        for (var name in Game.creeps) {
            names[name] = true;
            var creep = Game.creeps[name];
            if (creep.room.name !== spawn.room.name) {
                continue;
            }
            creepsByType[creep.memory.role]++;
            if (creep.ticksToLive < lowestTtl) {
                lowestTtl = creep.ticksToLive;
                lowestTtlName = creep.name;
            }

            if (typeof creepIdCodes[creep.memory.role] !== "undefined") {
                creepIdCodes[creep.memory.role][creep.memory.creepIndex] = 1;
            }
        }
        console.log("lowest ttl is " + lowestTtl + " for creep " + lowestTtlName);

        for (var i in Memory.creeps) {
            if (!names.hasOwnProperty(i)) {
                console.log(i + " is gone... killing");
                delete Memory.creeps[i];
            }
        }
        Memory.creepIdCodes = creepIdCodes;
        return creepsByType;
    },
    runCreep: function (creep) {
        try {
            if (creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            if (creep.memory.role == 'fetcher') {
                roleFetcher.run(creep);
            }
            if (creep.memory.role == 'attacker') {
                roleAttacker.run(creep);
            }
            if (creep.memory.role == 'collector') {
                roleCollector.run(creep);
            }
            if (creep.memory.role == 'multi') {
                roleMulti.run(creep);
            }
            if (creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            if (creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
            if (creep.memory.role == 'repairer') {
                roleRepairer.run(creep);
            }
            if (creep.memory.role == 'healer') {
                roleHealer.run(creep);
            }
            if (creep.memory.role == 'defender') {
                roleDefender.run(creep);
            }
            if (creep.memory.role == 'towerRenewer') {
                roleTowerRenewer.run(creep);
            }
            if (creep.memory.role == 'claimer') {
                roleClaimer.run(creep);
            }
        } catch (e) {
            console.log("ERROR: " + JSON.stringify(e) + " running creep " + creep.name + " of type " + creep.memory.role);
            Game.notify("ERROR: " + JSON.stringify(e) + " running creep " + creep.name + " of type " + creep.memory.role, 5);
        }
    }
};