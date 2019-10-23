module.exports = {
    run: function (tower, roomData) {

        if (tower.energy < 10) {
            return;
        }
        var closestHostile = tower.room.controller.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            console.log("ATTACK!");
            tower.attack(closestHostile);
            return;
        }

        if (tower.energy < 210) {
            return;
        }
        var damagedCreeps = tower.room.find(FIND_MY_CREEPS, {
            filter: function (c) {
                return c.hits < c.hitsMax;
            }
        });
        if (damagedCreeps.length > 0) {
            tower.heal(damagedCreeps.pop());
        }
        damagedCreeps = tower.room.find(FIND_MY_POWER_CREEPS, {
            filter: function (c) {
                return c.hits < c.hitsMax;
            }
        });
        if (damagedCreeps.length > 0) {
            tower.heal(damagedCreeps.pop());
        }
        if (tower.energy < 410) {
            return;
        }
        if (roomData.repair.length > 0) {
            roomData.repair.sort(this.sortDamagedStructures.bind(null, tower));

            var closestDamagedStructure = roomData.repair.pop();

            var repairResult = tower.repair(closestDamagedStructure);
            if (repairResult !== OK) {
                console.log("Can't repair- error " + repairResult);
            }

        } else {
            // console.log("Nothing to repair");
        }


    },
    sortDamagedStructures: function (tower, a, b) {
        var distance = tower.pos.getRangeTo(a)
        var distanceB = tower.pos.getRangeTo(b)
        var multiplierA = a.hits / (a.structureType == STRUCTURE_RAMPART || a.structureType == STRUCTURE_WALL ? 25000 : a.hitsMax);
        var multiplierB = b.hits / (b.structureType == STRUCTURE_RAMPART || b.structureType == STRUCTURE_WALL ? 25000 : b.hitsMax);
        var scoreA = distance * multiplierA;
        var scoreB = distanceB * multiplierB;
        if (scoreA > scoreB) {
            return -1;
        }
        if (scoreB > scoreA) {
            return 1;
        }
        return 0;
    }

};