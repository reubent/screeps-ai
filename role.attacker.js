var baseRole = require("baseRole");
module.exports = {
    enabled: false,
    victim: "W21S6",
    units: [
        TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, MOVE,
        ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, ATTACK],
    myType: "attacker",
    maxToCreate: (room) => {
        switch (room.name) {
            case "W18S6":
            case "W18S9":
            case "W19S9":
            case "W18S5":
                if (!this.enabled || !Game.getObjectById("5c4362ee5ec147719c4f2310")) {
                    return 0;
                }
                console.log(`Death comes in ${Game.getObjectById("5c4362ee5ec147719c4f2310").timeToLand} ticks`)
                if (Game.getObjectById("5c4362ee5ec147719c4f2310").timeToLand < 400) {
                    return 1;
                }
            default:
                return 0;
        }
    },
    lineStyle: {
        stroke: '#ff2020',
        strokeWidth: 0.15,
        opacity: 1,
        lineStyle: undefined
    },
    doSpawn: baseRole.doSpawn,
    handleTtl: baseRole.handleTtl,
    run: function (creep) {
        var victim = this.victim;
        if (creep.room.name != victim && creep.room.name !== "W21S5") {
            victim = "W21S5"
        }
        switch (Game.time % 10) {
            case 0:
            case 1:
                creep.say("Walls", true)
                break;
            case 2:
            case 3:
                creep.say("won't help", true)
                break;
            case 4:
            case 5:
                creep.say("you", true)
                break;
            case 6:
            case 7:
                creep.say("💣💣💣", true)
                break;
            case 8:
            case 9:
                creep.say("💖", true)
                break;

        }

        // var victim = this.victim
        // if (!Game.getObjectById("5c43635508f6b563bf99ffe7")) {
        //     victim = "W21S5"
        // }
        // vector = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {});
        // if (vector) {
        //     var result = creep.attack(vector);
        //     creep.moveTo(vector, {visualizePathStyle: this.lineStyle});
        //     if (result == ERR_NOT_IN_RANGE) {

        //     } else if (result == OK) {
        //         creep.say("💣🔥❤️❤️❤️😍",true)
        //     } else {
        //         creep.memory.vector = undefined;
        //     }
        //     return
        // }
        if (creep.room.name == victim) {
            var ve = creep.memory.vector;
            var vector;
            if (ve) {
                vector = Game.getObjectById(ve);
                if (vector && vector.room.name !== victim) {
                    vector = undefined;
                }
                if (vector && Math.random() > 0.85) {
                    vector = undefined;
                }
            }
            if (!vector) {
                vector = Game.getObjectById("5c4a2ea607df9a45fe7bdb7f")
            }

            // if (!vector) {
            //     vector = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            //         filter: function (o) {
            //             return o.structureType == STRUCTURE_RAMPART;
            //         }
            //     });
            // }
            if (!vector) {
                vector = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
                    filter: (e) => {
                        return _.some(e.body, (i) => {
                            return true;//i.type == RANGED_ATTACK || i.type == ATTACK
                        })
                    }
                });
            }
            if (!vector) {
                vector = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: function (o) {
                        return o.structureType == STRUCTURE_TOWER || o.structureType == STRUCTURE_SPAWN;
                    }
                });
            }
            if (!vector) {
                vector = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            }
            if (!vector) {
                vector = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: function (o) {
                        if (o.structureType == STRUCTURE_CONTROLLER || o.structureType == STRUCTURE_CONTAINER || o.structureType == STRUCTURE_WALL || o.structureType == STRUCTURE_ROAD) {
                            return false;
                        }
                        return true;
                    }
                });
            }
            if (!vector) {
                vector = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: function (o) {
                        return o.structureType == STRUCTURE_WALL;
                    }
                });
            }
            if (!vector) {
                var result = creep.signController(creep.room.controller, "Hello! Sorry to have destroyed everything.");
                if (result !== OK) {
                    if (creep.fatigue > 0) {
                        creep.say("😴💤")
                        return true
                    }
                    creep.moveTo(creep.room.controller, { visualizePathStyle: this.lineStyle });
                }
                return;
            }
            if (!vector) {
                return
            }
            creep.memory.vector = vector.id;
            var result = creep.attack(vector);
            creep.moveTo(vector, { visualizePathStyle: this.lineStyle });
            if (result == ERR_NOT_IN_RANGE) {
                creep.rangedAttack(vector)
            } else if (result == OK) {
                creep.say("💣🔥❤️❤️❤️😍", true)
            } else {
                creep.memory.vector = undefined;
            }
            console.log("Attack result " + result);
        } else {
            if (creep.fatigue > 0) {
                creep.say("😴💤")
                return true
            }
            creep.moveTo(new RoomPosition(25, 46, victim), { visualizePathStyle: this.lineStyle, maxOps: 1000 });
        }
    }
};