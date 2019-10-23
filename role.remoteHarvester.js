var baseRole = require("baseRole");
var roleFastHarvester = Object.assign({}, baseRole, {
    myType: "remoteHarvester",
    units: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK],
    lineStyle: {
        stroke: '#00cc00',
        strokeWidth: 1,
        opacity: 0.3,
        lineStyle: 'solid'
    },
    returnLineStyle: {
        stroke: '#eeee00',
        strokeWidth: 0.7,
        opacity: 0.6,
        lineStyle: 'solid'
    },
    maxToCreate: (room) => (room.name == "W18S9") ? (Math.random() > 0.99 ? 1 : 0) : 0,
    run: function (creep, roomData) {
        var observeResult = Game.getObjectById("5cb15b9edfe919756f22e698").observeRoom("W18S10")
        //console.log("Observe result "+observeResult)
        if (creep.memory.sleeping > 0) {
            creep.memory.sleeping--;
            creep.say("💤");
            creep.memory.renewing = true;
            return;
        }


        var target = Game.rooms[creep.memory.homeRoom].terminal
        var resource = RESOURCE_BIOMASS //_.keys(target.store).pop()

        if (creep.store.getFreeCapacity() == 0 || creep.ticksToLive < 150) {
            if (creep.fatigue > 0) {
                creep.say("😴💤")
                return
            }
            creep.say("DUMP")
            var result = creep.transfer(target, resource);
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: this.returnLineStyle, ignoreCreeps: false, maxRooms: 20 })

            }
            return
        }

        switch (creep.memory.homeRoom) {
            case "W13S9":
            case "W19S9":
            case "W18S9":
                //target = new RoomPosition(39, 36, "W14S8")
                target = Game.getObjectById("5dad8cf180e391ed125e8835")
                break

            default:
                creep.say("!!!???")
                return
        }
        if (target.cooldown > 0) {

            if (creep.pos.getRangeTo(target) > 1 && Math.random() > 0.9) {
                creep.say("sneak")
                creep.moveTo(target, { visualizePathStyle: this.lineStyle, maxRooms: 20, ignoreCreeps: false })
            } else {
                creep.say("zzz")
            }
            return
        } else {
            var result = creep.harvest(target)
            if (result != OK) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return
                }
                creep.moveTo(target, { visualizePathStyle: this.lineStyle, maxRooms: 20, ignoreCreeps: false })
                creep.say("HARVEST!")
            } else {
                creep.say("Yum")
            }
        }


    },

});
module.exports = roleFastHarvester;