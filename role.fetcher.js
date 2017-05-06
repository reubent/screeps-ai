var baseRole = require("baseRole");
var roleFetcher = {
    units: [
        WORK,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY
    ],
    myType: "fetcher",
    maxToCreate: 3,
    lineStyle: {
        stroke: '#3aff0a',
        strokeWidth: 0.2,
        opacity: 1,
        lineStyle: undefined
    },
    spawnInit: function (spawn) {
        return true;
    },
    doSpawn: baseRole.doSpawn,
    handleTtl: function (creep) {
        if (creep.room.name === "W19S5") {
            return baseRole.handleTtl(creep);
        }
        creep.moveTo(new RoomPosition(2, 2, "W19S5"));
        return false;
    },
    /** @param {Creep} creep **/
    run: function (creep) {
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("Wait!");
            creep.memory.sleeping--;
            return;
        }
        if (creep.ticksToLive < 200) {
            this.handleTtl(creep);
            return;
        }
        if (creep.memory.fleeing) {
            creep.say("Flee!");
        }
        if (creep.carry.energy < creep.carryCapacity && !creep.memory.fleeing) {
            if (creep.room.name == "W19S5") {
                creep.moveTo(new RoomPosition(11, 46, "W19S4"), {visualizePathStyle: this.lineStyle, reusePath: 20});
                creep.say("travel");
                return;
            }
            if (creep.room.find(FIND_HOSTILE_CREEPS).length > 0) {
                creep.memory.fleeing = true;
            } else {
                var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                var result = creep.harvest(source);
                if (result === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: this.lineStyle, reusePath: 20});
                }
                return;
            }
        }

        if (creep.room.name !== "W19S5") {
            creep.moveTo(new RoomPosition(7, 2, "W19S5"), {visualizePathStyle: this.lineStyle, reusePath: 20});
            creep.say("travel");
            return;
        }
        var target = Game.getObjectById("5907bedc0f2f023266938df5");
        if (800 - target.energy < creep.carry.energy) {
            target = Game.getObjectById("58f642a43c56e38010857444");
        }
        var result = creep.transfer(target, RESOURCE_ENERGY);
        if (result == ERR_NOT_IN_RANGE) {
            if (creep.fatigue > 0) {
                creep.say("Tired 😟");
                return;
            }
            creep.say('▶️ move');
            creep.moveTo(target, {visualizePathStyle: this.lineStyle, reusePath: 20});
            return;
        }
        creep.memory.fleeing = false;
    },
    findTarget: function (targets, creep) {
        return creep.pos.findClosestByPath(targets);
    }
};

module.exports = roleFetcher;