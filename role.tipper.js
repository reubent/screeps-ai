var baseRole = require("baseRole");
var roleHarvester = Object.assign({}, baseRole, {
    units: [CARRY, MOVE, MOVE, CARRY],
    myType: "tipper",
    maxToCreate: (room) => {
        return room.terminal && _.sum(room.terminal.store) > 220000 ? 1 : 0
    },

    lineStyle: {
        stroke: '#aa00aa',
        strokeWidth: 0.7,
        opacity: 0.35,
        lineStyle: 'solid'
    },
    getUnits: function (spawn) {

        return [CARRY, MOVE, MOVE, CARRY, CARRY, MOVE, MOVE, CARRY, CARRY, MOVE, MOVE, CARRY];
    },
    /** @param {Creep} creep **/
    run: function (creep, roomData) {
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("🕗");
            creep.memory.sleeping--;
            return;
        }
        if (this.handleTtl(creep, roomData)) {
            return;
        }
        if (_.sum(creep.room.storage.store) == creep.room.storage.storeCapacity) {
            creep.say("!!!!!!!!!")
            return
        }
        if (_.sum(creep.room.terminal.store) < 175000) {
            creep.suicide()
        }
        if (_.sum(creep.store) > 0) {
            var resource = ""
            for (var tryResource of _.keys(creep.store)) {
                if (creep.store[tryResource] > 0) {
                    resource = tryResource
                    break
                }
            }
            if (resource == "") {
                return
            }
            var result = creep.transfer(creep.room.storage, resource)
            if (result == ERR_NOT_IN_RANGE) {
                creep.say(">" + resource)
                creep.moveTo(creep.room.storage, { visualizePathStyle: this.lineStyle })
            }
            return
        }
        var resources = _.keys(creep.room.terminal.store)
        var done = false;
        for (var key of resources) {
            if (key == RESOURCE_ENERGY && creep.room.terminal.store[key] < 90000) {
                continue
            }
            if (key !== RESOURCE_OPS && key !== RESOURCE_ENERGY && creep.room.terminal.store[key] < 50000) {
                continue
            }
            if (key === RESOURCE_OPS && creep.room.terminal.store[key] < 10000) {
                continue
            }
            var result = creep.withdraw(creep.room.terminal, key, creep.store.getFreeCapacity())
            if (result == ERR_NOT_IN_RANGE) {
                creep.say("<" + key)
                creep.moveTo(creep.room.terminal, { visualizePathStyle: this.lineStyle })
            } else if (result != OK) {
                creep.say(result)
            }
            done = true
            break;
        }
        if (!done) {
            creep.say("Tzzz")
        }
    }
});

module.exports = roleHarvester;