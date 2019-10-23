var baseRole = require("baseRole");
var roleFastHarvester = Object.assign({}, baseRole, {
    myType: "lugger",
    units: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, MOVE, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
    lineStyle: {
        stroke: '#0000aa',
        strokeWidth: 0.1,
        opacity: 0.7,
        lineStyle: 'dotted'
    },
    maxToCreate: (room) => ( /*room.name == "W18S9" ||*/ room.name == "W13S8") ? 0 : 0,
    run: function (creep, roomData) {
        if (creep.memory.sleeping > 0) {
            creep.memory.sleeping--;
            creep.say("💤");
            creep.memory.renewing = true;
            return;
        }

        if (creep.store.getFreeCapacity() == 0 || ((creep.store.getFreeCapacity() < 100) && creep.room.name == creep.memory.homeRoom)) {


            var target = Game.rooms[creep.memory.homeRoom].terminal
            var resource = RESOURCE_ENERGY //_.keys(target.store).pop()
            amount = Math.min(target.store[resource], creep.store.getFreeCapacity());
            if (amount == 0) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                creep.say(":(")
                creep.moveTo(target, { visualizePathStyle: this.lineStyle, ignoreCreeps: false, maxRooms: 20 })
                return
            }
            var result = creep.withdraw(target, resource, amount);

            //console.log("Lugger: Trying to lug " + amount + " of " + resource + " Result is " + result)
            if (result != OK) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                result = creep.moveTo(target, { visualizePathStyle: this.lineStyle, ignoreCreeps: false, maxRooms: 20 })

                creep.say("LUG")
            }
            return;
        }
        var resource = _.keys(creep.store).pop()

        var target
        switch (creep.memory.homeRoom) {
            case "W13S8":
                //target = new RoomPosition(39, 36, "W14S8")
                target = Game.getObjectById("5d18f404de815b458008c8d1")
                break

            default:
                creep.say("!!!???")
                return
        }
        if (target instanceof RoomPosition) {
            if (creep.pos.x != target.x || creep.pos.y != target.y || creep.pos.roomName != target.roomName) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                result = creep.moveTo(target, { visualizePathStyle: this.lineStyle, ignoreCreeps: false, maxRooms: 20 })
                creep.say("LUG! " + result)
                return
            }
            creep.drop(RESOURCE_ENERGY)
        } else {
            var result = creep.transfer(target, resource)
            if (result != OK) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                creep.moveTo(target, { visualizePathStyle: this.lineStyle, maxRooms: 20, ignoreCreeps: false })
                creep.say("LUG!")
            }
        }

    },

});
module.exports = roleFastHarvester;