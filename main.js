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
// this is done deliberately after we put the error handler in
var init = require('init');
module.exports.loop = function () {
    console.log("~~~~~~~~~~~~~~~~ BEGIN ~~~~~~~~~~~~~~~~~~~~~")
    PathFinder.use(true);
    var cpuStack = [];
    var cpu = Game.cpu.getUsed();
    var dataCache = init.go(Game);
    var newCpu = Game.cpu.getUsed();
    cpuStack.push("  Init: " + (newCpu - cpu).toFixed(2))
    cpu = newCpu;
    //Game.getObjectById("5a40f76c737e242bd6ae403d").observeRoom("W21S5")
    try {
        doPowerProcessing();
    } catch (e) {
        console.log(e)
    }
    try {
        if (Game.time % 5 == 1) {
            runReactions();
        }
    } catch (e) {
        console.log(e)
    }
    try {
        transferEnergyInLinks();
    } catch (e) {
        console.log(e)
    }
    try {
        if (Game.time % 5 == 2) {
            handleTransfers();
        }
    } catch (e) {
        console.log(e)
    }
    try {
        if (Game.time % 10 == 4) {
            handleEnergyOrders();
        }
    } catch (e) {
        console.log(e)
    }
    try {
        if (Game.time % 10 == 7) {
            divvyUpXGH2O();
        }
    } catch (e) {
        console.log(e)
    }
    try {
        dedupeSources();
    } catch (e) {
        console.log(e)
    }
    newCpu = Game.cpu.getUsed();
    cpuStack.push("  Setup: " + (newCpu - cpu).toFixed(2))
    cpu = newCpu;
    for (var roomKey in Game.rooms) {
        processRoom(roomKey, dataCache)
    }


    newCpu = Game.cpu.getUsed();
    cpuStack.push("  Room loop: " + (newCpu - cpu).toFixed(2))
    cpu = newCpu;
    try {
        var labworker = creepManager.initLabWorker();
        if (Game.time % 10 == 4) {
            runFactory(labworker.factories)
        }
    } catch (e) {
        console.log("ERROR: " + JSON.stringify(e) + " running tower");
        Game.notify("ERROR: " + JSON.stringify(e) + " running tower", 5);
    }
    console.log("===> CREEP LOOP");
    var count = 0;
    for (var k in Game.creeps) {
        if (Game.creeps.hasOwnProperty(k)) {
            creepManager.runCreep(Game.creeps[k], dataCache);
            count++;
        }
    }
    console.log("==== Ran " + count + " creeps");
    newCpu = Game.cpu.getUsed();
    cpuStack.push("  Creep loop: " + (newCpu - cpu).toFixed(2))
    cpuStack.push("  Total: " + newCpu.toFixed(2) + " of " + Game.cpu.limit)
    console.log("===> CPU")
    _.each(cpuStack, e => console.log(e))

    var resources = [
        RESOURCE_CATALYZED_GHODIUM_ACID,
        RESOURCE_GHODIUM,
        RESOURCE_KEANIUM,
        RESOURCE_ZYNTHIUM,
        RESOURCE_LEMERGIUM,
        RESOURCE_UTRIUM,
        RESOURCE_OXYGEN,
        RESOURCE_HYDROGEN,
        RESOURCE_GHODIUM_HYDRIDE,
        RESOURCE_HYDROXIDE,
        RESOURCE_CATALYST,
        RESOURCE_OPS,
        RESOURCE_POWER,
        RESOURCE_PURIFIER,
        RESOURCE_GHODIUM_MELT,
        RESOURCE_OXIDANT,
        RESOURCE_REDUCTANT,
        RESOURCE_KEANIUM_BAR,
        RESOURCE_LEMERGIUM_BAR,
        RESOURCE_ZYNTHIUM_BAR,
        RESOURCE_UTRIUM_BAR,
        RESOURCE_BIOMASS,
        RESOURCE_CELL]
    const wrap = (s, w) => s.replace(
        new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
    );
    var resourceStrings = _.reduce(resources, (k, resource) => {
        var stock = _.reduce(Game.rooms, (i, a) => {
            var toAdd = 0
            if (a.terminal) {
                toAdd += (a.terminal.store[resource] ? a.terminal.store[resource] : 0)
            }
            if (a.storage) {
                toAdd += (a.storage.store[resource] ? a.storage.store[resource] : 0)
            }
            return i + toAdd
        }, 0)
        return `${k}${resource}:${stock}, `
    }, "STOCK: ")
    console.log(wrap(resourceStrings, 90))
    console.log("++> End tick " + Game.time)
}

function dedupeSources() {
    if (typeof Memory.eaters === "undefined") {
        Memory.eaters = {};
    }
    for (var c in Memory.eaters) {
        var creep = Game.creeps[Memory.eaters[c]]
        if (!(creep instanceof Creep)) {
            console.log("Deleting " + c + " from eaters array as creep is gone")
            delete Memory.eaters[c]
            continue
        }
        if (creep.memory.assignedSource !== c) {
            console.log(`Creep is not assigned to source in eaters for ${creep.name} and source ${c}`)
            delete Memory.eaters[c]
        }
    }
}

function processRoom(roomKey, dataCache) {
    if (!Game.rooms.hasOwnProperty(roomKey)) {
        return;
    }
    var room = Game.rooms[roomKey]
    if (!room.controller || !room.controller.my) {
        console.log(`X==> ${room.name} ----> Not ours`)
        return;
    }

    var roomData = dataCache.rooms[room.name];
    if (typeof roomData === "undefined") {
        console.log(" No room data for " + room.name)
        return;
    }
    console.log(`===> ${room.name} ====> Energy: ${room.energyAvailable}/${room.energyCapacityAvailable} Needs: ${roomData.needEnergy.length} (${roomData.needEnergyHighPriority.length} HiPri) total ${roomData.neededEnergy} (${roomData.neededEnergyHighPriority} HiPri) Sources: ${roomData.energySources.length} Construction: ${roomData.construction.length} HiPri: ${roomData.highPriConstruction.length} Repair: ${roomData.repair.length}`)

    for (var tower of roomData.towers) {
        try {
            towerManager.run(tower, roomData);
        } catch (e) {
            console.log("ERROR: " + JSON.stringify(e) + " running tower");
            Game.notify("ERROR: " + JSON.stringify(e) + " running tower", 5);
        }
    }
    try {
        var cbt = creepManager.creepDiscrepancies(room);
        if (cbt.discrepancies) {
            console.log("Discrepancy: " + cbt.discrepancies)
        }
        var first = true;
        for (var spawn of roomData.spawns) {
            first = handleSpawn(spawn, cbt.creepsByType, first)
        }
    } catch (e) {
        console.log("ERROR: " + JSON.stringify(e) + " running room");
        Game.notify("ERROR: " + JSON.stringify(e) + " running room", 5);
    }
}

function handleSpawn(spawn, creepsByType, first) {
    try {
        if (creepManager.renewCreep(spawn)) {
            return first;
        }
    } catch (e) {
        console.log("ERROR: " + JSON.stringify(e) + " running renew");
        Game.notify("ERROR: " + JSON.stringify(e) + " running renew", 5);
    }

    if (!first || Game.time % 5 !== 0) {
        return first;
    }
    if (spawn.spawning) {
        console.log("Already spawning " + Memory.spawnType + " so not checking...");
        return first;
    }

    first = false;
    creepManager.spawn(spawn, creepsByType);
    return first
}

function runFactory(factories) {
    console.log("Running factories...")
    for (var room in factories) {
        var factory = factories[room]
        if (factory.factory.cooldown > 0) {
            console.log(`Factory in ${room} cooling down`)
            return
        }
        for (var commodity of factory.commodities) {
            if (factory.factory.store[commodity] > 1000) {
                continue;
            }
            if (factory.factory.room.storage.store[commodity] + factory.factory.room.terminal.store[commodity] > 50000) {
                continue;
            }
            var res = factory.factory.produce(commodity)
            if (res != OK) {
                console.log(`FACTORY: result ${res} in room ${room} for ${commodity}`)
            } else {
                console.log(`Successfully produced ${commodity} in ${room}`)
                break
            }
        }
    }

}

function doPowerProcessing() {
    console.log("Processing power...")
    var powerSpawns = [
        "59f11b4838f36977c45f9690",
        "59f0cd4f3fdae953e70d0dda",
        "5c55096aecb6d5055a06d7af",
        "5c909e2570ef1b4145390b24",
        "5c904a71986f3f720a3ed95c",
        "5c906734b181a1159c49daed",
        "5c923ea42ae3ec0878ab7a86",
        "5c9035af74fb262dc1977483",
        "5c907c98d7fe2015acc06732",
        "5c90516ba7d43e1584a086a8",
    ]
    _.each(powerSpawns, (i) => {
        var powerSpawn = Game.getObjectById(i);
        if (powerSpawn.power > 0) {
            powerSpawn.processPower();
        }
    })

    var spawn = Game.getObjectById("59f11b4838f36977c45f9690")
    var creep = Game.powerCreeps['operator1']
    if (!creep) {
        console.log("Can't find power creep")
        return
    }
    if (typeof creep.ticksToLive === "undefined" || isNaN(creep.ticksToLive)) {
        console.log(`Trying to respawn power creep with cooldown of ${creep.spawnCooldownTime} vs ${Date.now()}`)
        var result = creep.spawn(spawn)
        console.log(`Result was ${result}`)
        return
    }
    if (creep.ticksToLive < 100) {
        console.log("TTL for power creep")
        var result = creep.renew(spawn)
        if (result != OK) {
            creep.moveTo(spawn)
        } else {
            creep.usePower(PWR_OPERATE_POWER, spawn)
        }
        return
    }
    var terminal = Game.rooms[creep.room.name].terminal
    var storage = creep.room.storage
    var already = terminal.store[RESOURCE_OPS] + storage.store[RESOURCE_OPS]
    if (_.sum(creep.carry) > creep.carryCapacity - 100 && already < 90000) {
        console.log("Power creep nearly full")
        var store = Game.getObjectById("58f642a43c56e38010857444")
        var result = creep.transfer(store, RESOURCE_OPS)
        if (result != OK) {
            creep.moveTo(store)
        }
        return
    }

    if (spawn.effects && spawn.effects.length) {
        if (already < 90000) {
            if (creep.usePower(PWR_GENERATE_OPS) != OK) {
                console.log(`Powercreep cooling down with ${creep.powers[PWR_GENERATE_OPS].cooldown} ticks to next run. Location is ${creep.pos} and ttl is ${creep.ticksToLive}`)
                creep.say("WAIT")
            } else {
                console.log("Generated ops")
            }
        }
        creep.say("zzz")
        return
    }
    var res = creep.usePower(PWR_OPERATE_POWER, spawn)
    if (res == ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn)
        creep.say(">")
        return
    } else if (res == ERR_TIRED) {
        creep.say("zzz")
        return
    }
}



function runReactions() {
    console.log("Running reactions...")

    // H + O -> HO
    Game.getObjectById("59f356c02062530775344c3e").runReaction(Game.getObjectById("59f1a96721d95804a04953de"), Game.getObjectById("59f2f04a4692606c2af8fdde"));
    Game.getObjectById("5a9b67a8b21481635256dc1b").runReaction(Game.getObjectById("5a9b89ac88ee3132e5245a06"), Game.getObjectById("5a9bab6bb315e30994c19498"));
    Game.getObjectById("5aa5f66acde7c90686cd1e48").runReaction(Game.getObjectById("5aa442fbdc6920523bb40f48"), Game.getObjectById("5aa4bec7fade9970ad926bb9"));
    Game.getObjectById("5b0c369084833049053c3fa0").runReaction(Game.getObjectById("5b0c1ca7b83add111ac71ca4"), Game.getObjectById("5b0c4efe9efeec0874c77406"));
    Game.getObjectById("5c08b01826ebec3f7960d94d").runReaction(Game.getObjectById("5c08f4dc4f82f73f9220a750"), Game.getObjectById("5c085346eb040a3f86e27874"));
    // G + H -> GH
    Game.getObjectById("59f49e86fc049e20c3e17c5f").runReaction(Game.getObjectById("59f4401c5758ab183d5f6f87"), Game.getObjectById("59f2f04a4692606c2af8fdde"));
    Game.getObjectById("5aa09edac9229f480f272f55").runReaction(Game.getObjectById("5a9b89ac88ee3132e5245a06"), Game.getObjectById("5a9b434457c12b2e09d520e2"));
    Game.getObjectById("5aa5630dd469ed6449da596d").runReaction(Game.getObjectById("5b075df3c29d8d5d7d2218c3"), Game.getObjectById("5aa442fbdc6920523bb40f48"));
    Game.getObjectById("5b0bbafb101c0c6c2f0feb79").runReaction(Game.getObjectById("5b0badd5c29d8d5d7d2405e7"), Game.getObjectById("5b0c1ca7b83add111ac71ca4"));
    Game.getObjectById("5c087bcddbc73e742f5ffcfb").runReaction(Game.getObjectById("5c079aa6e964fb3fa404c912"), Game.getObjectById("5c08f4dc4f82f73f9220a750"));
    // GH + HO -> GH2O
    Game.getObjectById("59f4c69ace3e9d2052803b8d").runReaction(Game.getObjectById("59f356c02062530775344c3e"), Game.getObjectById("59f49e86fc049e20c3e17c5f"))
    Game.getObjectById("5a9b254ef00bb40db1c1007d").runReaction(Game.getObjectById("5aa09edac9229f480f272f55"), Game.getObjectById("5a9b67a8b21481635256dc1b"))
    Game.getObjectById("5b0641f608fdfb607b2f59c4").runReaction(Game.getObjectById("5aa5630dd469ed6449da596d"), Game.getObjectById("5aa5f66acde7c90686cd1e48"))
    Game.getObjectById("5b0b4640b83add111ac6c32c").runReaction(Game.getObjectById("5b0bbafb101c0c6c2f0feb79"), Game.getObjectById("5b0c369084833049053c3fa0"))
    Game.getObjectById("5b20cd459957ef4a707454f6").runReaction(Game.getObjectById("5b20fc4899179d326211b55c"), Game.getObjectById("5b20a3dfc494895a785725ec"))
    Game.getObjectById("5b213d6f491d656679cd102b").runReaction(Game.getObjectById("5b20d37e5ca73d47268b3d11"), Game.getObjectById("5b204486e5ab773bf9727661"))
    Game.getObjectById("5c07dad723e268647a551abc").runReaction(Game.getObjectById("5c087bcddbc73e742f5ffcfb"), Game.getObjectById("5c08b01826ebec3f7960d94d"))
    // GH2O + X -> GH2OX
    Game.getObjectById("5c071899b67d4066bee41865").runReaction(Game.getObjectById("5c07dad723e268647a551abc"), Game.getObjectById("5c078dd3f579c43d1aa82ecc"))
    Game.getObjectById("5c3a301163a34b5fbc5d4834").runReaction(Game.getObjectById("5c07dad723e268647a551abc"), Game.getObjectById("5c078dd3f579c43d1aa82ecc"))
    Game.getObjectById("59f910bbe787e81fcd14d6b2").runReaction(Game.getObjectById("59f4c69ace3e9d2052803b8d"), Game.getObjectById("59f68ffb0507c90d80a38840"))
    Game.getObjectById("59fa41909833f129f14978ca").runReaction(Game.getObjectById("59f4c69ace3e9d2052803b8d"), Game.getObjectById("59f68ffb0507c90d80a38840"))
    Game.getObjectById("5aa07a34306ae176529d85ca").runReaction(Game.getObjectById("5a9b254ef00bb40db1c1007d"), Game.getObjectById("5a9b0571e2de3048658f635f"))
    Game.getObjectById("5b140c71077300236e521d8e").runReaction(Game.getObjectById("5a9b254ef00bb40db1c1007d"), Game.getObjectById("5a9b0571e2de3048658f635f"))
    Game.getObjectById("5b0b5a6a3ddc136c29347b21").runReaction(Game.getObjectById("5a9b254ef00bb40db1c1007d"), Game.getObjectById("5a9b0571e2de3048658f635f"))
    Game.getObjectById("5a8db42721801e7a19083075").runReaction(Game.getObjectById("5b0641f608fdfb607b2f59c4"), Game.getObjectById("5aa62a283127c70ff40735dd"))
    Game.getObjectById("5b0b354671ad5f48f92d6681").runReaction(Game.getObjectById("5b0641f608fdfb607b2f59c4"), Game.getObjectById("5aa62a283127c70ff40735dd"))
    Game.getObjectById("5b0aeaacb451b05da4245e15").runReaction(Game.getObjectById("5b0b4640b83add111ac6c32c"), Game.getObjectById("5b0be005fc2c9b59234c15f1"))
    Game.getObjectById("5b0b6c8d5b969334d74a705e").runReaction(Game.getObjectById("5b0b4640b83add111ac6c32c"), Game.getObjectById("5b0be005fc2c9b59234c15f1"))
    Game.getObjectById("5b20796e0235d72138943015").runReaction(Game.getObjectById("5b20cd459957ef4a707454f6"), Game.getObjectById("5b2126dc9957ef4a707480eb"))
    Game.getObjectById("5b25ce42f5e9ad760df0ce23").runReaction(Game.getObjectById("5b20cd459957ef4a707454f6"), Game.getObjectById("5b2126dc9957ef4a707480eb"))
    Game.getObjectById("5b25d73cf65f5a1b1a45f405").runReaction(Game.getObjectById("5b20cd459957ef4a707454f6"), Game.getObjectById("5b2126dc9957ef4a707480eb"))

    Game.getObjectById("5b205634861ba4048fff4de9").runReaction(Game.getObjectById("5b20cd459957ef4a707454f6"), Game.getObjectById("5b2126dc9957ef4a707480eb"))
    Game.getObjectById("5b209a23db3cfa090d66a4dd").runReaction(Game.getObjectById("5b213d6f491d656679cd102b"), Game.getObjectById("5b2070ef764a5b0456da7fb4"))
    Game.getObjectById("5b211244568d0128e58d302e").runReaction(Game.getObjectById("5b213d6f491d656679cd102b"), Game.getObjectById("5b2070ef764a5b0456da7fb4"))
    Game.getObjectById("5b27301be9be004a87fe813a").runReaction(Game.getObjectById("5b213d6f491d656679cd102b"), Game.getObjectById("5b2070ef764a5b0456da7fb4"))
    Game.getObjectById("5b26f1ce699b9f1b48e2cb68").runReaction(Game.getObjectById("5b213d6f491d656679cd102b"), Game.getObjectById("5b2070ef764a5b0456da7fb4"))
    //GHODIUM
    var howMuch = Game.rooms.W19S6.terminal.store[RESOURCE_GHODIUM] ? Game.rooms.W19S6.terminal.store[RESOURCE_GHODIUM] : 0
    howMuch += Game.rooms.W19S9.terminal.store[RESOURCE_GHODIUM] ? Game.rooms.W19S9.terminal.store[RESOURCE_GHODIUM] : 0
    if (howMuch < 100000) {
        // U + L -> UL
        Game.getObjectById("59f99ac6f47e7c2fb6592d40").runReaction(Game.getObjectById("59fa93c00346704e61e785f5"), Game.getObjectById("59fa35365913106471fe3309"))
        Game.getObjectById("5a9b9564bc48c24a8a21ae31").runReaction(Game.getObjectById("5a9b5895b134ef3e3bcc9e48"), Game.getObjectById("5a9b1a8c702578653b78b047"))
        // Z + K -> ZK
        Game.getObjectById("59f8d4f56adb2564032f84f4").runReaction(Game.getObjectById("59f71cbd03138d5e5d4b4858"), Game.getObjectById("59f609b47e075b7525991d87"))
        Game.getObjectById("5a9c1e6922c80649aae1844c").runReaction(Game.getObjectById("5a9cba7018ca687bf662ee3c"), Game.getObjectById("5a9c6997cf03087daf339b24"))
        // ZK + UL -> G
        Game.getObjectById("59f8d8ebc525fb4f88eaaa28").runReaction(Game.getObjectById("59f8d4f56adb2564032f84f4"), Game.getObjectById("59f99ac6f47e7c2fb6592d40"))
        Game.getObjectById("5a9bd80d3cea350ccbb39545").runReaction(Game.getObjectById("5a9b9564bc48c24a8a21ae31"), Game.getObjectById("5a9c1e6922c80649aae1844c"))
    } else {
        console.log("We have " + howMuch + " ghodium already so not making any more!")
    }
    // UHO2 + X -> XUH02
    Game.getObjectById("59fa41909833f129f14978ca").runReaction(Game.getObjectById("59fb820926ee1079d54d98de"), Game.getObjectById("59f68ffb0507c90d80a38840"));
}

function handleTransfers() {
    var debug = 0;
    console.log("Checking transfers...")
    var rooms = {
        "W19S5": "boost",
        "W19S4": "boost",
        "W19S6": "ghodium",
        "W17S13": "boost",
        "W18S5": "boostlight",
        "W19S11": "boostlight",
        "W19S8": "boost",
        "W19S9": "ghodium",
        "W17S3": "boost",
    };

    _.each(rooms, (process, room) => {
        if (debug) console.log(`Checking room ${room} of type ${process}`);
        var resources = [];
        if (process === "boost") {
            resources.push(RESOURCE_GHODIUM);
            resources.push(RESOURCE_OXYGEN);
            resources.push(RESOURCE_HYDROGEN);
        }
        if (process === "boostlight") {
            resources.push(RESOURCE_GHODIUM_HYDRIDE);
            resources.push(RESOURCE_HYDROXIDE);
        }
        if (process === "boost" || process === "boostlight") {
            resources.push(RESOURCE_CATALYST);
        }
        if (process === "ghodium") {
            resources.push(RESOURCE_LEMERGIUM);
            resources.push(RESOURCE_ZYNTHIUM);
            resources.push(RESOURCE_UTRIUM);
            resources.push(RESOURCE_KEANIUM);
        }
        _.each(resources, (resource) => handleTransfer(room, resource, debug));
    })
    if (debug) console.log(`Done with transfers. There were ${_.keys(rooms).length} rooms to check`);
}

var producers = {
    W19S5: [RESOURCE_OXYGEN, RESOURCE_GHODIUM_HYDRIDE, RESOURCE_HYDROXIDE],
    W19S13: [RESOURCE_OXYGEN],
    W18S5: [RESOURCE_UTRIUM],
    W18S6: [RESOURCE_LEMERGIUM],
    W19S6: [RESOURCE_HYDROGEN, RESOURCE_GHODIUM],
    W17S3: [RESOURCE_CATALYST],
    W19S4: [RESOURCE_UTRIUM, RESOURCE_GHODIUM_HYDRIDE, RESOURCE_HYDROXIDE],
    W18S3: [RESOURCE_OXYGEN],
    W19S8: [RESOURCE_KEANIUM],
    W19S9: [RESOURCE_KEANIUM, RESOURCE_GHODIUM],
    W18S9: [RESOURCE_ZYNTHIUM],
    W19S11: [RESOURCE_ZYNTHIUM],
    W17S13: [RESOURCE_OXYGEN],
    W18S13: [RESOURCE_HYDROGEN],
    W16S9: [RESOURCE_HYDROGEN],
    W16S8: [RESOURCE_OXYGEN],
    W13S9: [RESOURCE_UTRIUM],
    W13S8: [RESOURCE_HYDROGEN],
    W14S8: [RESOURCE_ZYNTHIUM],
};

function handleTransfer(room, resource, debug) {
    if (debug > 1) console.log(`Handling ${resource} in ${room}`);
    var desired = 5000;
    if (!Game.rooms[room]) {
        console.log(`Can't find room ${room}!`)
    }
    var toTerminal = Game.rooms[room].terminal;
    if (!toTerminal) {
        if (debug) console.log("No terminal to send to");
        return;
    }
    sent = false;
    _.each(producers, (producerResources, producer) => {
        if (sent) {
            return
        }
        if (producer === room) {
            if (debug > 1) console.log(`Not sending resources to myself...`);
            return;
        }
        _.each(producerResources, (producerResource) => {
            if (toTerminal.store[resource] && toTerminal.store[resource] >= desired) {
                if (debug > 1) console.log(`Have enough ${resource} already`);
                sent = true
                return;
            }
            if (producerResource != resource) {
                if (debug > 1) console.log(`Wrong resource ${producerResource} - we want ${resource}`)
                return;
            }
            if (!Game.rooms[producer]) {
                console.log(`Can't find room ${room} as producer! Have ${_.keys(Game.rooms)} - val ${Game.rooms[producer]}`);
                return;
            }
            var fromTerminal = Game.rooms[producer].terminal;
            if (!fromTerminal || fromTerminal.cooldown > 0 || !fromTerminal.store[resource] || fromTerminal.store[resource] < 200) {
                if (debug) console.log(`Not enough ${resource} in ${producer} to transfer or terminal busy with cooldown ${fromTerminal.cooldown} and resource amount ${fromTerminal.store[resource]}`);
                return;
            }
            var freeSpace = toTerminal.storeCapacity - _.sum(toTerminal.store);
            var needed = desired - (toTerminal.store[resource] ? toTerminal.store[resource] : 0);
            var amount = Math.min(fromTerminal.store[resource], needed, freeSpace);
            if (amount < 250) {
                if (debug) console.log(`Amount ${amount} is not big enough to consider transfering ${resource} from ${producer} to ${room}`);
                return;
            }
            if (debug) console.log(`Amount is ${amount} which is min of ${fromTerminal.store[resource]}, ${freeSpace}, ${desired}`);
            var result = fromTerminal.send(resource, amount, room);
            if (result !== OK) {
                console.log(`Can't send ${amount} of ${resource} from ${producer} to ${room} = ${result}`);
            } else {
                console.log(`Sent ${amount} of ${resource} from ${producer} to ${room}`);
                sent = true
            }
        });
    });
    if (debug > 1) console.log(`Done with ${resource} in ${room}`);
}

function handleEnergyOrders() {
    var orders = {
        W19S5: "59fa18189de0586f8268788f",
        W19S4: "5a621dcec9f62c4fcb0781a0",
        W19S6: "59fda46833ab96087e77fdbd",
        W18S5: "59fa17a49de0586f826851ef",
        W17S3: "5a8be416cdbe8b5017a303a1",
        W19S11: "5a118a8b86290b0cb26216c8",
        W19S9: "5a0562c5766a560380590bf1",
        W19S8: "59fa17bc9de0586f82685a62",
        W19S13: "5b2fb19d9dd19a794a183e3a",
        W18S12: "5b354404359bc52d1ef9d26b",
        W18S13: "5b5a082387afb56b55b2290d",
        W17S13: "5b9cdd148b05b45d0d0da2e7",
        W18S6: "5dab08bf8018bf56c71c6782",
        W18S9: "5dac5605496e34457d5d7e00",
        W18S3: "5dad88c8496e34713ddd4673",
        W16S8: "5dad8896496e344917dd3182",
        W16S9: "5dad886b496e341bd8dd1ea3",
        W13S9: "5dad87c2496e347f17dcdbcc",
        W13S8: "5dad87dd496e3464efdce20f",
        W12S7: "5dad8800496e343432dcf0a0",
        W14S8: "5dad880f496e342a74dcf6e4",
    }
    for (o in orders) {
        var term = Game.rooms[o].terminal
        Game.market.changeOrderPrice(orders[o], 0.0205);
        if (!term.store[RESOURCE_ENERGY] || term.store[RESOURCE_ENERGY] < 5000) {
            if (Game.market.orders[orders[o]].remainingAmount < 1000) {
                console.log(`Extending energy order for room ${o}`)
                Game.market.extendOrder(orders[o], 100000);
            }
        }
    }
}

function divvyUpXGH2O() {
    var debug = false;
    console.log("Handling XGH2O distribution...")
    var givers = {
        S3: Game.rooms.W17S3.terminal,
        S5: Game.rooms.W19S5.terminal,
        S8: Game.rooms.W19S8.terminal,
        S4: Game.rooms.W19S4.terminal,
        S185: Game.rooms.W18S5.terminal,
        S11: Game.rooms.W19S11.terminal,
        S13: Game.rooms.W17S13.terminal,
    }
    var receivers = ["W12S7", "W14S8"]
    if (receivers.length < 1) return;
    for (var j in givers) {
        var oterm = givers[j]
        if (debug) console.log("Handing XGH2O distribution for " + oterm.room.name)
        if (oterm.cooldown > 0) {
            if (debug) console.log(">> In cooldown")
            continue;
        }
        if (!oterm.store[RESOURCE_CATALYZED_GHODIUM_ACID] || oterm.store[RESOURCE_CATALYZED_GHODIUM_ACID] < 200) {
            if (debug) console.log(">> Not enough XGH2O")
            continue;
        }
        for (l of _.shuffle(receivers)) {
            if (debug) console.log(">> Considering sending to " + l)
            var term = Game.rooms[l].terminal
            if (!term.store[RESOURCE_CATALYZED_GHODIUM_ACID] || term.store[RESOURCE_CATALYZED_GHODIUM_ACID] < 1000) {
                if (debug) console.log(">> Sending to " + l)
                oterm.send(RESOURCE_CATALYZED_GHODIUM_ACID, 200, l)
                break;
            }
        }
    }
}

function transferEnergyInLinks() {
    console.log("Running link transfers")
    var debug = false;
    var transfers = {
        "590eed92587c9fb629dee2b3": "5911370f079831210aa1c237",
        "5b7dc049abdcb663ee580eb1": "5b7dbb1fabdcb663ee580c52",
        "5b7dbe246aa8e82d9de2ba8c": "5a42bbdc5f4c0608cca742f8",
        "5b7dbf1efb03cc2d7a4af70a": "5b7db9da0ebe9726ca8750a2",
        "5b7dc787bd404e71e2ab098b": "5b7dc6a703c364357fc71188",
        // "5b7dc0958cb9bf0659c5402e": "5b7e0e92688b5d63dccb4b51",
        "5b7dc98834d929065e75524b": "5b7dc6a703c364357fc71188",
        "5b7dc8ca5f8b432d7038d058": "5b7dbb1fabdcb663ee580c52",
        "5b7dcc74772bc10433cd8607": "5b7db9da0ebe9726ca8750a2",
        "5b7dd3dc448ff063e8e4d124": "5b7dda74d6d21b3580d6132f",
        "5b7dcd9515869c71b3062cd3": "5b7dda74d6d21b3580d6132f",
        "5b7dd018e695e4044001d134": "5a42bbdc5f4c0608cca742f8",
        "5b7dbd443afa2171d60fa64d": "5b7dcdd1760c6a501089bc5a",
        //"5b940d20d978cf35ccce729c": "5b7e0e92688b5d63dccb4b51",
        "5b94168988d207516810db01": "5b9476d7b6e3782236424cc0",
        "5bd3c5053bdc376787ace4cf": "5b956044f67193312b0b0c4a",
        "5bd3dddc3bdc376787acee7a": "5b956044f67193312b0b0c4a",
        "5b9808b46c34725155a7ac8f": "5b9476d7b6e3782236424cc0",
        "5b9554f8e9acdc5b8a7aa1b2": "5b956044f67193312b0b0c4a",
        "5c1fcbc9d3e0ca07902c7a48": "5c1fbc2656aa021a4f2eeede",
        "5c23e59656aa021a4f3117fe": "5c23d438b551336efbb76384",
        "5bcb440dfc95b6208603400a": "5b7dcfdb8118af502526a26d",
        "5c53522c420b9f3149b63b8b": "5c5376fb206c5b1d2b94e053",
        "5c50d0e158e321053df98304": "5c53c201a3e1de3153bdce5f",
        "5c54aa77afa76d642b573d86": "5c5376fb206c5b1d2b94e053",
        "5c6188ab0af1a30cbeaf6e06": "5c53c201a3e1de3153bdce5f",
        "5c884f9d298f5a75c618cd2f": "5c88d103f1294475a0dbb828",
        "5c9180585190e4428524419d": "5c88d103f1294475a0dbb828",
        "5b9c0ab01ac62655e68ad6ea": "5b7dcdd1760c6a501089bc5a",
        "5ca6e4f1e6c6984b938e9824": "5ca67f50927dc97e8bf2fc98",
        "5d1c0e224e7e69458656b7b3": "5d1c4e67c90efd36fd6369be",
        "5d2089e65ae10d49839e7873": "5d2098f1e409b912bbc12fbd",
    };

    _.each(transfers, (toLink, fromLink) => {
        if (debug) console.log("Checking " + toLink)
        var from = Game.getObjectById(fromLink)
        var target = Game.getObjectById(toLink)
        if (!from) {
            console.log(`Can't find ${fromLink} as sender`);
            return;
        }
        if (from.cooldown > 0) {
            if (debug) console.log("Cooling off")
            return;
        }
        if (!target) {
            console.log(`Can't find ${toLink} as target`)
            return;
        }
        if (from.energy < 200 || target.energy == target.energyCapacity) {
            return;
        }
        if (debug) console.log("Sending " + from.energy + " to " + target.id);
        var result = from.transferEnergy(target);
        if (result !== OK) {
            if (debug) console.log("Result was " + result)
        }
    });
}