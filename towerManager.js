module.exports = {
    run: function (tower) {
        console.log("==== Tower " + tower.id);
        if (tower.energy == 0) {
            console.log("Tower out of energy");
            return;
        }
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            console.log("ATTACK!");
            tower.attack(closestHostile);
            return;
        }

        if (tower.energy < 210) {
            console.log("Only " + tower.energy + "/" + tower.energyCapacity + " in tower so reserving for defence");
            return;
        }
        var damagedCreeps = tower.room.find(FIND_MY_CREEPS, {
            filter: function (c) {
                return c.hits < c.hitsMax;
            }
        });
        if (damagedCreeps.length > 0) {
            console.log("Healing");
            tower.heal(damagedCreeps.pop());
        }
        if (tower.energy < 410) {
            console.log("Only " + tower.energy + "/" + tower.energyCapacity + " in tower so reserving for defence and healing");
            return;
        }
        var damagedStructures = tower.room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                var structureMax = structure.structureType == STRUCTURE_CONTAINER ? 50000 : (structure.structureType == STRUCTURE_RAMPART ? 10000 : 5000);
                return structure.hits < Math.min(structure.hitsMax, structureMax);
            }
        });
        if (damagedStructures.length > 0) {
            damagedStructures.sort(this.sortDamagedStructures.bind(null, tower));
            var closestDamagedStructure = damagedStructures.pop();
            console.log("Repairing " + closestDamagedStructure.structureType + " " + closestDamagedStructure.id + " which has " + closestDamagedStructure.hits + "/" + closestDamagedStructure.hitsMax);
            var repairResult = tower.repair(closestDamagedStructure);
            if (repairResult !== OK) {
                console.log("Can't repair- error " + repairResult);
            }

        } else {
            console.log("Nothing to repair");
        }


    },
    sortDamagedStructures: function (tower, a, b) {
        var multiplierA = Math.max(a.pos.x, tower.pos.x) - Math.min(a.pos.x, tower.pos.x) > 15 ? 7 : 1;
        var multiplierB = Math.max(b.pos.x, tower.pos.x) - Math.min(b.pos.x, tower.pos.x) > 15 ? 7 : 1;
        var scoreA = a.hits / ((a.structureType == STRUCTURE_RAMPART || a.structureType == STRUCTURE_WALL || a.structureType == STRUCTURE_CONTAINER) ? 2 : 1) * multiplierA;
        var scoreB = b.hits / ((b.structureType == STRUCTURE_RAMPART || b.structureType == STRUCTURE_WALL || b.structureType == STRUCTURE_CONTAINER) ? 2 : 1) * multiplierB;
        if (scoreA > scoreB) {
            return -1;
        }
        if (scoreB > scoreA) {
            return 1;
        }
        return 0;
    }

};