var baseRole = require("baseRole");
var roleUpgrader = Object.assign({}, baseRole, {
    units: [WORK, MOVE, CARRY],
    myType: "upgrader",
    maxToCreate: function (room) {
        if (!room.controller) return 0;
        if (room.controller.level == 8) {
            return 2;
        }
        return 2;
    },
    lineStyle: {
        stroke: '#ffff00',
        strokeWidth: 0.1,
        opacity: 0.7,
        lineStyle: 'dotted'
    },
    getUnits: function (spawn) {
        var idCodes = Memory.creepIdCodes;

        if (Object.keys(idCodes[this.myType]).length > 0) {
            var units = [];
            for (var i = 0; i < spawn.room.energyCapacityAvailable && i < 2400; i += 400) {
                units = units.concat(this.units);
            }
            console.log("upgrader: " + JSON.stringify(units));
            return units;
        }
        return [WORK, MOVE, CARRY, CARRY];
    },
    spawnInit: function (spawn) {
        return this.getUnits(spawn).length > 4 || spawn.room.energyCapacityAvailable < 301;
    },
    /** @param {Creep} creep **/
    run: function (creep, roomData) {
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("💤");
            creep.memory.sleeping--;
            return;
        }
        if (creep.memory.gotoX && creep.memory.gotoY) {
            console.log(`${creep.name}  doing as commanded and going to ${creep.memory.gotoX},${creep.memory.gotoY}`)
            if (creep.pos.x == creep.memory.gotoX && creep.pos.y == creep.memory.gotoY) {
                creep.memory.gotoX = undefined
                creep.memory.gotoY = undefined
                return false
            }
            creep.say("G")
            var res = creep.moveTo(new RoomPosition(creep.memory.gotoX, creep.memory.gotoY, creep.memory.homeRoom), { visualizePathStyle: this.lineStyle })
            console.log(res)
            return true
        }
        var boosted = this.creepIsBoosted(creep);
        if (!boosted && creep.ticksToLive > 1000) {
            var lab;
            switch (creep.room.name) {
                case "W19S5":
                    //lab = Game.getObjectById("59f910bbe787e81fcd14d6b2");
                    break;
                case "W19S4":
                    //lab = Game.getObjectById("5a8cb4d95312b7482da4677f");
                    break;
                case "W18S5":
                    //lab = Game.getObjectById("5a8cb342c2382c755e05ca1c");
                    break;
                case "W17S3":
                    //lab = Game.getObjectById("5a8db42721801e7a19083075");
                    break;
                case "W19S6":
                    //lab = Game.getObjectById("5a8d1230f3862e6db202f7a2");
                    break;
                case "W19S11":
                    //lab = Game.getObjectById("5a8e4212d3acd03286e5689d");
                    break;
                case "W19S8":
                    //lab = Game.getObjectById("5a08a5dfc8f8c4302e14ecc0");
                    break
                case "W19S9":
                    //lab = Game.getObjectById("5a91a4703efbe14693ae8129")
                    break;
                case "W19S13":
                    //lab = Game.getObjectById("5b2ae8b6e8ff6a588d0f4c86")
                    break
                case "W18S12":
                    //lab = Game.getObjectById("5b3558829c0dee5a78d963c2")
                    break
                case "W18S13":
                    //lab = Game.getObjectById("5b5988a2281a5e31a1f304a4")
                    break
                case "W17S13":
                    //lab = Game.getObjectById("5b9a5a8038f11e0fb616e939")
                    break
                case "W21S12":
                    //lab = Game.getObjectById("5b9ee5f3b6e378223646c259")
                    break
                case "W18S6":
                    lab = Game.getObjectById("5c1f67e117bcfb1a47b033b6");
                    break;
                case "W18S9":
                    lab = Game.getObjectById("5c2258534ea55a0766792eaf");
                    break;
                case "W18S3":
                    lab = Game.getObjectById("5c2d9d70d46a155b9ed79198");
                    break;
                case "W16S8":
                    lab = Game.getObjectById("5c565ee38d8c454ba0da7875");
                    break;
                case "W16S9":
                    lab = Game.getObjectById("5c61cc1227f3470a7888090a");
                    break;
                case "W13S9":
                    lab = Game.getObjectById("5c96d6b469511a2704cd64f7");
                    break;
                case "W13S8":
                    lab = Game.getObjectById("5cbdc624608dea58babdec88");
                    break;
                case "W12S7":
                    lab = Game.getObjectById("5d29d9957435fc2dce7db562")
                    break;
                case "W14S8":
                    lab = Game.getObjectById("5d35909e34b23e2de1f4777c");
                    break
            }
            if (lab && lab.mineralAmount > 100) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return true
                }
                creep.moveTo(lab, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
                if (creep.pos.getRangeTo(lab) < 2) {
                    var boost = lab.boostCreep(creep);
                    if (boost == OK) {
                        creep.say("YAY!");
                    } else {
                        console.log("Can't boost creep " + creep.name + ": " + boost);
                    }
                } else {
                    creep.say("Boost!")
                }
                return;
            }
        } else if (!boosted && creep.ticksToLive < 60) {
            this.handleTtl(creep, roomData);
            return;
        }
        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.memory.committed = undefined;
        }
        if (!creep.memory.upgrading && (creep.carry.energy == creep.carryCapacity)) {
            creep.memory.upgrading = true;
            creep.memory.committed = undefined;
        }

        if (creep.memory.upgrading) {
            if (!creep.room.controller || !creep.room.controller.my) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return true
                }
                creep.moveTo(new RoomPosition(10, 10, creep.memory.homeRoom), { visualizePathStyle: this.lineStyle });
                return;
            }
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE || creep.pos.getRangeTo(creep.room.controller) > 1) {
                if (creep.fatigue > 0) {
                    creep.say("😟");
                    return;
                }
                creep.moveTo(creep.room.controller, { visualizePathStyle: this.lineStyle, maxRooms: 1, maxOps: 1000 });
            } else {
                creep.say('⚡ ')
            }
        } else {
            if (this.doHarvest(creep, roomData) === -999 && creep.carry.energy > 0) {
                creep.memory.upgrading = true;
            }
        }
    }
});

module.exports = roleUpgrader;