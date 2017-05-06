var creepManager = require('creepManager');
var towerManager = require('towerManager');
// this just means we can serialise errors into notifications with the stack...
if (!('toJSON' in Error.prototype))
    Object.defineProperty(Error.prototype, 'toJSON', {
        value: function () {
            var alt = {};

            Object.getOwnPropertyNames(this).forEach(function (key) {
                alt[key] = this[key];
            }, this);

            return alt;
        },
        configurable: true,
        writable: true
    });
/**
 * TODO 
 * 1. Automatically spawn defenders when attacked
 * 2. Recycle unneeded creeps
 * 3. ~Make builders / collectors / repairers multipurpose~
 * 4. Spawn healers when needed
 * 5. ~Stop non harvesters from harvesting~
 */
module.exports.loop = function () {
    PathFinder.use(true);
    var spawns = {
        W19S5: Game.getObjectById("58e951689f9ea168315dfbea"),
        W19S6: Game.getObjectById("58fa556422b94c634acededb")
    };
    var fromLink = Game.getObjectById("5907bedc0f2f023266938df5");
    if (fromLink.energy > 199) {
        var toLink = Game.getObjectById(Math.random() > 0.5 ? "5907a84a3afd5e543f62a80f" : "590771647f2c853d72183bee");
        if (toLink.energy < toLink.energyCapacity) {
            console.log("Sending " + fromLink.energy + " to " + toLink.id);
            fromLink.transferEnergy(toLink);
        }
    }
    for (var i in spawns) {
        var spawn = spawns[i];
        console.log("========== Cycle start..." + spawn.room.energyAvailable + " / " + spawn.room.energyCapacityAvailable + " in room " + spawn.room.name);
        var towers = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_TOWER;
            }
        });
        for (var tower in towers) {
            try {
                towerManager.run(towers[tower]);
            } catch (e) {
                console.log("ERROR: " + JSON.stringify(e) + " running tower");
                game.notify("ERROR: " + JSON.stringify(e) + " running tower", 5);
            }
        }

        var creepsByType = creepManager.checkCreepsInRoom(spawn);

        if (spawn.spawning) {
            console.log("Already spawning " + Memory.spawnType + " so not checking...");
            continue;
        }
        try {
            if (creepManager.renewCreep(spawn)) {
                continue;
            }
        } catch (e) {
            console.log("ERROR: " + JSON.stringify(e) + " running renew");
            game.notify("ERROR: " + JSON.stringify(e) + " running renew", 5);
        }

        creepManager.spawn(spawn, creepsByType);
    }
    console.log("========== RUNNING CREEPS");
    var count = 0;
    for (var k in Game.creeps) {
        if (Game.creeps.hasOwnProperty(k)) {
            creepManager.runCreep(Game.creeps[k]);
            count++;
        }
    }
    console.log("++++++++ Ran " + count + " creeps");
}