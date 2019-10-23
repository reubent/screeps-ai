var baseRole = require("baseRole");
var roleLabWorker = Object.assign({}, baseRole, {
    debug: false,
    endProducts: {},
    labs: {},
    terminal: {},
    factories: {},
    init: function () {
        this.factories = {
            W19S6: {
                factory: Game.getObjectById("5daba43ccf0611f61336ae51"),
                commodities: [
                    RESOURCE_REDUCTANT,
                    RESOURCE_GHODIUM_MELT
                ],
                inputs: [
                    RESOURCE_HYDROGEN,
                    RESOURCE_GHODIUM,
                    RESOURCE_ENERGY
                ],
            },
            W19S5: {
                factory: Game.getObjectById("5daca6703ba4c47e3994aba8"),
                commodities: [
                    RESOURCE_OXIDANT
                ],
                inputs: [
                    RESOURCE_OXYGEN,
                    RESOURCE_ENERGY
                ],
            },
            W17S3: {
                factory: Game.getObjectById("5dae267801482b0d7f4d0b38"),
                commodities: [
                    RESOURCE_PURIFIER
                ],
                inputs: [
                    RESOURCE_CATALYST,
                    RESOURCE_ENERGY
                ],
            },
            W18S3: {
                factory: Game.getObjectById("5dadc3433f593475db367acf"),
                commodities: [
                    RESOURCE_OXIDANT
                ],
                inputs: [
                    RESOURCE_OXYGEN,
                    RESOURCE_ENERGY
                ],
            },
            W18S12: {
                factory: Game.getObjectById("5dadad9d258cdb08a633574a"),
                commodities: [
                    RESOURCE_UTRIUM_BAR
                ],
                inputs: [
                    RESOURCE_UTRIUM,
                    RESOURCE_ENERGY
                ],
            },
            W19S4: {
                factory: Game.getObjectById("5dadd5abeb8db788138cb542"),
                commodities: [
                    RESOURCE_UTRIUM_BAR
                ],
                inputs: [
                    RESOURCE_UTRIUM,
                    RESOURCE_ENERGY
                ],
            },
            W19S9: {
                factory: Game.getObjectById("5daca4002287ad267d033667"),
                commodities: [
                    RESOURCE_KEANIUM_BAR,
                    RESOURCE_GHODIUM_MELT
                ],
                inputs: [
                    RESOURCE_KEANIUM,
                    RESOURCE_GHODIUM,
                    RESOURCE_ENERGY
                ],
            },
            W18S9: {
                factory: Game.getObjectById("5dade8100e591a1abe50d619"),
                commodities: [
                    RESOURCE_ZYNTHIUM_BAR,
                    RESOURCE_LEMERGIUM_BAR,
                    RESOURCE_CELL,
                ],
                inputs: [
                    RESOURCE_ZYNTHIUM,
                    RESOURCE_LEMERGIUM,
                    RESOURCE_LEMERGIUM_BAR,
                    RESOURCE_BIOMASS,
                    RESOURCE_ENERGY
                ],
            }
        }
        this.endProducts = {
            "W19S5": {
                XGH2O: Game.getObjectById("59f910bbe787e81fcd14d6b2"),
                XGH2O2: Game.getObjectById("59fa41909833f129f14978ca"),
                oxidant: Game.getObjectById("5daca6703ba4c47e3994aba8"),
            },
            "W19S6": {
                G: Game.getObjectById("59f8d8ebc525fb4f88eaaa28"),
                "ghodium_melt": Game.getObjectById("5daba43ccf0611f61336ae51"),
                "reductant": Game.getObjectById("5daba43ccf0611f61336ae51"),
            },
            "W17S3": {
                XGH2O: Game.getObjectById("5a8db42721801e7a19083075"),
                XGH2O2: Game.getObjectById("5b05bfdb431e1c7f9d9bfc3a"),
                XGH2O3: Game.getObjectById("5b0b354671ad5f48f92d6681"),
                purifier: Game.getObjectById("5dae267801482b0d7f4d0b38")

            },
            "W19S4": {
                XGH2O2: Game.getObjectById("5b0aeaacb451b05da4245e15"),

                XGH2O3: Game.getObjectById("5b0b6c8d5b969334d74a705e"),
                XGH2O: Game.getObjectById("5a8cb4d95312b7482da4677f"),
                "utrium_bar": Game.getObjectById("5dadd5abeb8db788138cb542"),
            },
            "W18S5": {
                XGH2O2: Game.getObjectById("5b209a23db3cfa090d66a4dd"),
                XGH2O3: Game.getObjectById("5b211244568d0128e58d302e"),
                XGH2O4: Game.getObjectById("5b27301be9be004a87fe813a"),
                XGH2O5: Game.getObjectById("5b26f1ce699b9f1b48e2cb68"),
                XGH2Oa: Game.getObjectById("5a8cb342c2382c755e05ca1c")
            },
            "W19S8": {
                XGH2O4: Game.getObjectById("5aa07a34306ae176529d85ca"),
                XGH2O2: Game.getObjectById("5b140c71077300236e521d8e"),
                XGH2O3: Game.getObjectById("5b0b5a6a3ddc136c29347b21"),

            },
            "W19S9": {
                G: Game.getObjectById("5a9bd80d3cea350ccbb39545"),
                "keanium_bar": Game.getObjectById("5daca4002287ad267d033667")
            },
            "W19S11": {
                XGH2O2: Game.getObjectById("5b205634861ba4048fff4de9"),
                XGH2O3: Game.getObjectById("5b20796e0235d72138943015"),
                XGH2O4: Game.getObjectById("5b25d73cf65f5a1b1a45f405"),
                XGH2O5: Game.getObjectById("5b25ce42f5e9ad760df0ce23"),
                XGH2O: Game.getObjectById("5a8e4212d3acd03286e5689d")
            },
            "W19S13": {

            },
            "W18S12": {

            },
            "W18S13": {},
            "W17S13": {
                XGH2O: Game.getObjectById("5b9a5a8038f11e0fb616e939"),
                XGH2O2: Game.getObjectById("5c071899b67d4066bee41865"),
                XGH2O3: Game.getObjectById("5c3a301163a34b5fbc5d4834"),

            },
            "W18S6": {},
            "W18S9": {
                cell: Game.getObjectById("5dade8100e591a1abe50d619"),
                zynthium_bar: Game.getObjectById("5dade8100e591a1abe50d619")
            },
            "W18S3": {
                oxidant: Game.getObjectById("5dadc3433f593475db367acf")
            },
            "W16S8": {},
            "W16S9": {},
            "W13S9": {},
            "W13S8": {},
            "W12S7": {},
            "W14S8": {},
        };
        this.labs = {
            "W17S13": {
                XGH2O: Game.getObjectById("5b9a5a8038f11e0fb616e939"),
                H: Game.getObjectById("5c08f4dc4f82f73f9220a750"),
                OH: Game.getObjectById("5c08b01826ebec3f7960d94d"),
                G: Game.getObjectById("5c079aa6e964fb3fa404c912"),
                O: Game.getObjectById("5c085346eb040a3f86e27874"),
                GH: Game.getObjectById("5c087bcddbc73e742f5ffcfb"),
                GH2O: Game.getObjectById("5c07dad723e268647a551abc"),
                X: Game.getObjectById("5c078dd3f579c43d1aa82ecc"),
                XGH2O2: Game.getObjectById("5c071899b67d4066bee41865"),
            },
            "W18S13": {
                XGH2O: Game.getObjectById("5b5988a2281a5e31a1f304a4")
            },
            "W19S5": {
                H: Game.getObjectById("59f2f04a4692606c2af8fdde"),
                O: Game.getObjectById("59f1a96721d95804a04953de"),
                OH: Game.getObjectById("59f356c02062530775344c3e"),
                G: Game.getObjectById("59f4401c5758ab183d5f6f87"),
                GH: Game.getObjectById("59f49e86fc049e20c3e17c5f"),
                GH2O: Game.getObjectById("59f4404e115ab71de875f611"),
                X: Game.getObjectById("59f68ffb0507c90d80a38840"),
                XGH2O: Game.getObjectById("59f910bbe787e81fcd14d6b2"),
                XUHO2: Game.getObjectById("59fb820926ee1079d54d98de"),
                XGH2O2: Game.getObjectById("59fa41909833f129f14978ca"),
                power: Game.getObjectById("59f11b4838f36977c45f9690")
            },
            "W19S6": {
                L: Game.getObjectById("59fa93c00346704e61e785f5"),
                U: Game.getObjectById("59fa35365913106471fe3309"),
                UL: Game.getObjectById("59f99ac6f47e7c2fb6592d40"),
                K: Game.getObjectById("59f609b47e075b7525991d87"),
                Z: Game.getObjectById("59f71cbd03138d5e5d4b4858"),
                ZK: Game.getObjectById("59f8d4f56adb2564032f84f4"),
                G: Game.getObjectById("59f8d8ebc525fb4f88eaaa28"),
                power: Game.getObjectById("59f0cd4f3fdae953e70d0dda"),
                XGH2O: Game.getObjectById("5a8d1230f3862e6db202f7a2")
            },
            "W18S5": {
                GH: Game.getObjectById("5b204486e5ab773bf9727661"),
                OH: Game.getObjectById("5b20d37e5ca73d47268b3d11"),
                X: Game.getObjectById("5b2070ef764a5b0456da7fb4"),
                GH2O: Game.getObjectById("5b213d6f491d656679cd102b"),
                power: Game.getObjectById("5c923ea42ae3ec0878ab7a86"),
                //XGH2O2: Game.getObjectById("5b209a23db3cfa090d66a4dd"),
                //XGH2O3: Game.getObjectById("5b211244568d0128e58d302e"),

            },
            "W19S8": {
                O: Game.getObjectById("5a9bab6bb315e30994c19498"),
                H: Game.getObjectById("5a9b89ac88ee3132e5245a06"),
                OH: Game.getObjectById("5a9b67a8b21481635256dc1b"),
                G: Game.getObjectById("5a9b434457c12b2e09d520e2"),
                GH: Game.getObjectById("5aa09edac9229f480f272f55"),
                GH2O: Game.getObjectById("5a9b254ef00bb40db1c1007d"),
                X: Game.getObjectById("5a9b0571e2de3048658f635f"),
                //XGH2O: Game.getObjectById("5aa07a34306ae176529d85ca")
            },
            "W19S4": {
                O: Game.getObjectById("5b0c4efe9efeec0874c77406"),
                H: Game.getObjectById("5b0c1ca7b83add111ac71ca4"),
                OH: Game.getObjectById("5b0c369084833049053c3fa0"),
                G: Game.getObjectById("5b0badd5c29d8d5d7d2405e7"),
                GH: Game.getObjectById("5b0bbafb101c0c6c2f0feb79"),
                GH2O: Game.getObjectById("5b0b4640b83add111ac6c32c"),
                X: Game.getObjectById("5b0be005fc2c9b59234c15f1"),
                XGH2O2: Game.getObjectById("5b0aeaacb451b05da4245e15"),
                XGH2O: Game.getObjectById("5a8cb4d95312b7482da4677f"),
                XGH2O3: Game.getObjectById("5b0b6c8d5b969334d74a705e"),
                power: Game.getObjectById("5c909e2570ef1b4145390b24"),
            },
            "W17S3": {
                OH: Game.getObjectById("5aa5f66acde7c90686cd1e48"),
                G: Game.getObjectById("5b075df3c29d8d5d7d2218c3"),
                H: Game.getObjectById("5aa442fbdc6920523bb40f48"),
                O: Game.getObjectById("5aa4bec7fade9970ad926bb9"),
                GH: Game.getObjectById("5aa5630dd469ed6449da596d"),
                GH2O: Game.getObjectById("5b0641f608fdfb607b2f59c4"),
                X: Game.getObjectById("5aa62a283127c70ff40735dd"),
                XGH2O: Game.getObjectById("5a8db42721801e7a19083075"),
                power: Game.getObjectById("5c906734b181a1159c49daed"),
            },
            "W19S9": {
                XGH2O2: Game.getObjectById("5a91a4703efbe14693ae8129"),
                G: Game.getObjectById("5a9bd80d3cea350ccbb39545"),
                Z: Game.getObjectById("5a9cba7018ca687bf662ee3c"),
                K: Game.getObjectById("5a9c6997cf03087daf339b24"),
                ZK: Game.getObjectById("5a9c1e6922c80649aae1844c"),
                UL: Game.getObjectById("5a9b9564bc48c24a8a21ae31"),
                U: Game.getObjectById("5a9b5895b134ef3e3bcc9e48"),
                L: Game.getObjectById("5a9b1a8c702578653b78b047"),
                power: Game.getObjectById("5c90516ba7d43e1584a086a8"),
            },
            "W19S11": {
                GH: Game.getObjectById("5b20fc4899179d326211b55c"),
                OH: Game.getObjectById("5b20a3dfc494895a785725ec"),
                X: Game.getObjectById("5b2126dc9957ef4a707480eb"),
                GH2O: Game.getObjectById("5b20cd459957ef4a707454f6"),
                XGH2O2: Game.getObjectById("5b20796e0235d72138943015"),
                XGH2O: Game.getObjectById("5a8e4212d3acd03286e5689d"),
                XGH2O4: Game.getObjectById("5b25d73cf65f5a1b1a45f405"),
                XGH2O5: Game.getObjectById("5b25ce42f5e9ad760df0ce23")
            },
            "W19S13": {
                XGH2O: Game.getObjectById("5b2ae8b6e8ff6a588d0f4c86")
            },
            "W18S12": {
                XGH2O: Game.getObjectById("5b3558829c0dee5a78d963c2")
            },
            "W18S6": {
                XGH2O: Game.getObjectById("5c1f67e117bcfb1a47b033b6"),
                power: Game.getObjectById("5c9035af74fb262dc1977483"),
            },
            "W18S9": {
                XGH2O: Game.getObjectById("5c2258534ea55a0766792eaf"),
                power: Game.getObjectById("5c55096aecb6d5055a06d7af"),
            },
            "W18S3": {
                XGH2O: Game.getObjectById("5c2d9d70d46a155b9ed79198"),
                power: Game.getObjectById("5c904a71986f3f720a3ed95c"),
            },
            "W16S8": {
                XGH2O: Game.getObjectById("5c565ee38d8c454ba0da7875")
            },
            "W16S9": {
                XGH2O: Game.getObjectById("5c61cc1227f3470a7888090a")
            },
            "W13S9": {
                XGH2O: Game.getObjectById("5c96d6b469511a2704cd64f7")
            },
            "W13S8": {
                XGH2O: Game.getObjectById("5cbdc624608dea58babdec88")
            },
            "W12S7": {
                XGH2O: Game.getObjectById("5d29d9957435fc2dce7db562")
            },
            "W14S8": {
                XGH2O: Game.getObjectById("5d35909e34b23e2de1f4777c")
            }
        };
        this.terminal = {
            "W19S5": Game.getObjectById("5907456c3b177b5b603ff71b"),
            "W19S6": Game.getObjectById("59f22519a9b8f466c4a16e88"),
            "W18S5": Game.getObjectById("593e35266ff45f6c2cc90e33"),
            "W19S8": Game.rooms.W19S8.terminal,
            "W17S3": Game.getObjectById("5a8377bf98c4a847ba45c241"),
            "W19S4": Game.getObjectById("5a531f0449d6a5425c1a2e8e"),
            "W19S9": Game.getObjectById("5a0494e6616a2d1bbdd24845"),
            "W19S11": Game.getObjectById("5a1118bb405cf36ef1a15ad2"),
            "W19S13": Game.getObjectById("5b2f76523a9e9203b57eded7"),
            "W18S12": Game.getObjectById("5b344f6975f8a11243a40035"),
            "W18S13": Game.getObjectById("5b554a25e18b8e03a921cd93"),
            "W17S13": Game.rooms.W17S13.terminal,
            "W18S6": Game.rooms.W18S6.terminal,
            "W18S9": Game.rooms.W18S9.terminal,
            "W18S3": Game.rooms.W18S3.terminal,
            "W16S8": Game.rooms.W16S8.terminal,
            "W16S9": Game.rooms.W16S9.terminal,
            "W13S9": Game.rooms.W13S9.terminal,
            "W13S8": Game.rooms.W13S8.terminal,
            "W12S7": Game.rooms.W12S7.terminal,
            "W14S8": Game.rooms.W14S8.terminal,
        };
    },
    units: [CARRY, MOVE, CARRY],
    myType: "labWorker",
    maxToCreate: (room) => {
        switch (room.name) {
            case "W19S5":
            case "W19S6":
            case "W19S4":
            case "W18S5":
            case "W17S3":
            case "W19S9":
            case "W19S8":
            case "W19S11":
            case "W19S13":
            case "W18S12":
            case "W18S13":
            case "W17S13":
            case "W18S6":
            case "W18S9":
            case "W18S3":
            case "W16S8":
            case "W16S9":
            case "W13S8":
            case "W12S7":
            case "W13S9":
            case "W14S8":
                return 1;
            default:
                return 0;
        }
    },
    getUnits: function (spawn) {
        var units = [WORK, MOVE];
        for (var i = 0; i < spawn.room.energyCapacityAvailable && i < 1200; i += 450) {
            units = units.concat(this.units);
        }
        //console.log("labWorker: " + JSON.stringify(units));
        return units;
    },
    lineStyle: {
        stroke: '#aaaaff',
        strokeWidth: 0.1,
        opacity: 1,
        lineStyle: undefined
    },
    doBoringStuff: function (creep, roomData) {
        //console.log(JSON.stringify(this.labs))
        if (!creep.room.controller || !creep.room.controller.owner || creep.room.controller.owner.username != "ReubenT") {
            if (creep.fatigue > 0) {
                creep.say("😴💤")
                return true
            }
            creep.moveTo(new RoomPosition(20, 20, creep.memory.homeRoom), { visualizePathStyle: this.lineStyle });
            creep.say("go home");
            return true;
        }
        // if we're being renewed, wait
        if (typeof creep.memory.sleeping !== "undefined" && creep.memory.sleeping > 0) {
            creep.say("Wait!");
            creep.memory.sleeping--;
            return true;
        }
        // if we've got < 100 ttl then let's get renewed
        if (creep.ticksToLive < 120 && this.handleTtl(creep, roomData)) {
            return true;
        }
        return false;
    },
    chooseResourceAsCarried: function (creep) {
        for (var resource in creep.carry) {
            if (creep.carry[resource] > 0) {
                if (this.debug) console.log("Already carrying " + resource);
                return resource;
            }
        }
    },
    chooseResourceFromTerminal: function (creep) {
        var name = creep.room.name;
        var factory;
        if (typeof this.factories[creep.room.name] !== "undefined") {
            factory = this.factories[creep.room.name]
        }
        for (var resource in this.terminal[name].store) {
            if (resource === RESOURCE_ENERGY) {
                continue;
            }

            var lab = this.labs[name][resource];
            var terminalAmount = this.terminal[name].store[resource];
            if (this.debug) {
                console.log(name + " Trying " + resource);
                console.log("There is " + terminalAmount);
                console.log(lab ? "Lab - contains " + (resource == RESOURCE_POWER ? "power" : lab.mineralAmount) : "no lab");
            }
            if (terminalAmount < 1) {
                continue;
            }

            if (factory && factory.inputs.includes(resource)) {
                if (factory.factory.store.getUsedCapacity(resource) < 1000) {
                    if (this.debug) console.log("Resource to factory " + resource)
                    return resource;
                }
            }
            if (!lab) {
                continue
            }
            if (resource === RESOURCE_POWER && lab.power > lab.powerCapacity - 50) {
                continue;
            }
            if (resource !== RESOURCE_POWER) {
                if (lab.mineralAmount > lab.mineralCapacity - 200) {
                    continue;
                }
                if (typeof this.endProducts[name][resource] !== "undefined" && lab.mineralAmount > 199) {
                    if (this.debug) console.log("Not filling " + resource + " as end product is already quite full");
                    continue;
                }
            }
            return resource;
        }
    },
    fetchEndProduct: function (creep) {
        var creepCapacity = creep.carryCapacity - _.sum(creep.carry);
        var name = creep.room.name;
        var chosenResourceSource
        var chosenResourceAmount = 0
        var chosenResourceType
        for (var resource in this.endProducts[name]) {
            var endProduct = this.endProducts[name][resource];
            var amount
            if (endProduct instanceof StructureFactory) {
                amountToLeave = 500
                amount = Math.min(creepCapacity, endProduct.store[resource] - amountToLeave)

                if (amount < 50) {
                    continue;
                }
            } else {
                var amountToLeave = endProduct.mineralType == resource ? 200 : 0
                resource = endProduct.mineralType
                if (endProduct.mineralAmount < amountToLeave + 50) {
                    continue;
                }
                amount = Math.min(creepCapacity, endProduct.mineralAmount - amountToLeave)
            }
            if (creep.room.terminal.store[resource] && creep.room.terminal.store[resource] > 50000) {
                if (this.debug) console.log("Already have " + creep.room.terminal.store[resource] + " of " + resource + " in " + creep.room.name + " so not fetching endproduct")
                continue;
            }

            chosenResourceSource = endProduct
            chosenResourceAmount = amount
            chosenResourceType = resource
            break

        }
        if (chosenResourceSource && chosenResourceAmount > 0) {
            var oRes = creep.withdraw(chosenResourceSource, chosenResourceType, chosenResourceAmount)
            if (oRes === ERR_NOT_IN_RANGE) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return true
                }
                creep.say("🗑️" + chosenResourceType)
                creep.moveTo(chosenResourceSource, { visualizePathStyle: this.lineStyle, maxRooms: 1 })
            } else if (oRes == OK) {
                creep.say("🆗")
            } else {
                creep.say("🛫" + chosenResourceType)
            }
            return true;
        }
        return false;
    },
    returnExcessToTerminal: function (creep, resource, roomData) {
        var factory;
        if (typeof this.factories[creep.room.name] !== "undefined") {
            factory = this.factories[creep.room.name]
        }
        var name = creep.room.name;
        var lab = this.labs[name][resource];
        if (factory && factory.inputs.includes(resource) && factory.factory.store.getUsedCapacity(resource) < 1000) {
            if (this.debug) console.log("Factory needs " + resource)
            return false
        }
        if (!lab) {
            if (this.debug) console.log("Bad lab for " + resource + " in " + creep.room.name)
            if (resource === RESOURCE_GHODIUM && _.sum(creep.carry) == creep.carryCapacity && roomData.nuker.ghodium < roomData.nuker.ghodiumCapacity) {
                if (this.debug) console.log("Carry ghodium to nuker")
                return false
            }
            var oRes = creep.transfer(this.terminal[name], resource);
            if (oRes === ERR_NOT_IN_RANGE) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return true
                }
                creep.say("🗑️" + resource)
                creep.moveTo(this.terminal[name], { visualizePathStyle: this.lineStyle, maxRooms: 1 })
            } else if (oRes !== OK) {
                if (this.debug) console.log("Lab worker can't transfer " + creep.carry[resource] + " of " + resource + " with result :" + oRes + " in " + name)
                return false;
            }
            return true;
        }
        if (resource === RESOURCE_POWER) {
            if (lab.power < lab.powerCapacity - 50) {
                if (this.debug) console.log("Lab needs power")
                return false;
            }
        } else {
            var overage = typeof this.endProducts[name][resource] !== "undefined" ? 2800 : 100;
            if (lab.mineralAmount < (lab.mineralCapacity - overage)) {
                if (this.debug) console.log("Lab for " + resource + " needs input as within " + overage)
                return false;
            }
            if (resource === RESOURCE_GHODIUM && _.sum(creep.carry) == creep.carryCapacity && roomData.nuker.ghodium < roomData.nuker.ghodiumCapacity) {
                if (this.debug) console.log("Carry ghodium to nuker")
                return false
            }
            if (this.debug) console.log("Done in overage loop with overage " + overage)
        }
        if (!creep.carry[resource] || creep.carry[resource] == 0) {
            if (this.debug) console.log("Not carrying any " + resource)
            return false;
        }
        var iRes = creep.transfer(this.terminal[name], resource);
        if (iRes === ERR_NOT_IN_RANGE) {
            if (creep.fatigue > 0) {
                creep.say("😴💤")
                return true
            }
            creep.say("🗑️" + resource)
            creep.moveTo(this.terminal[name], { visualizePathStyle: this.lineStyle, maxRooms: 1 })
        } else if (iRes !== OK) {
            creep.say("!")
            if (this.debug) console.log("Can't transfer " + creep.carry[resource] + " of " + resource + " with result :" + oRes + " in " + name)
            return false;
        }
        if (this.debug) console.log("Transfer is good - " + iRes)
        return true;
    },
    tryFetchFromTerminal: function (creep, resource) {
        var name = creep.room.name;
        var terminal = this.terminal[name];
        if (!this.terminal[name].store[resource]) {
            return false;
        }
        var res = creep.withdraw(terminal, resource, Math.min(creep.carryCapacity - _.sum(creep.carry), terminal.store[resource]));
        if (res == ERR_NOT_IN_RANGE) {
            if (creep.fatigue > 0) {
                creep.say("😴💤")
                return true
            }
            creep.say("⚗️" + resource)
            creep.moveTo(terminal, { visualizePathStyle: this.lineStyle, maxRooms: 1 });
        } else if (res !== OK) {
            if (this.debug) console.log("Error on withdraw - " + res)
        }
        return true;
    },
    collectGoods: function (creep) {
        if (_.sum(creep.carry) === creep.carryCapacity) {
            return false;
        }
        var resource = this.chooseResourceAsCarried(creep);

        if (!resource) {
            resource = this.chooseResourceFromTerminal(creep);
        }
        if (!resource) {
            if (!this.fetchEndProduct(creep)) {
                creep.say("Bleurgh");
            } else {
                return true;
            }
        }

        if (resource && this.returnExcessToTerminal(creep, resource)) {
            return true;
        }

        return this.tryFetchFromTerminal(creep, resource)

    },
    depositCarried: function (creep, roomData) {
        var factory;
        if (typeof this.factories[creep.room.name] !== "undefined") {
            factory = this.factories[creep.room.name]
        }
        if (_.keys(creep.carry).length == 0 || _.sum(creep.carry) == 0) {
            return false;
        }
        var resource = _.keys(creep.carry).pop();
        var amountInCreep = creep.carry[resource];
        if (this.debug) console.log("In room " + creep.room.name + " carrying " + amountInCreep + " of " + resource)
        if (creep.carry[resource] == 0) {
            return false;
        }
        if (this.returnExcessToTerminal(creep, resource, roomData)) {
            return true;
        }
        var lab = this.labs[creep.room.name][resource];
        if (factory && factory.inputs.includes(resource)) {
            // console.log("Found factory")
            if (factory.factory.store.getUsedCapacity(resource) < 1000) {
                amount = amountInCreep
                var result = creep.transfer(factory.factory, resource, amount);
                if (result == ERR_NOT_IN_RANGE) {
                    if (creep.fatigue > 0) {
                        creep.say("😴💤")
                        return true
                    }
                    creep.say("⚗️F" + resource);
                    var result = creep.moveTo(factory.factory, { visualizePathStyle: this.lineStyle, maxRooms: 1 });
                    if (result != OK) {
                        creep.say(result)
                    }
                } else if (result !== OK) {
                    if (this.debug) console.log("Err transferring amount " + amount + " of resource " + resource + " result " + result)
                    creep.say("⁉️")
                }
                return true;
            } else {
                //console.log("Found factory but don't need "+resource)
            }
        }
        if (!lab) {
            return false;
        }
        var amount;
        if (resource == RESOURCE_POWER) {
            amount = Math.min(amountInCreep, lab.powerCapacity - lab.power - 1)
        } else if (lab.structureType == STRUCTURE_TERMINAL) {
            amount = amountInCreep
        } else {
            amount = Math.min(amountInCreep, lab.mineralCapacity - lab.mineralAmount - 1);
        }
        if (amount < 1) {
            return false;
        }
        if (resource == RESOURCE_GHODIUM && roomData.nuker.ghodium < roomData.nuker.ghodiumCapacity) {
            return false;
        }
        var result = creep.transfer(lab, resource, amount);
        if (result == ERR_NOT_IN_RANGE) {
            if (creep.fatigue > 0) {
                creep.say("😴💤")
                return true
            }
            creep.say("⚗️" + resource);
            creep.moveTo(lab, { visualizePathStyle: this.lineStyle, maxRooms: 1 });
        } else if (result !== OK) {
            if (this.debug) console.log("Err transferring amount " + amount + " of resource " + resource + " result " + result)
            creep.say("⁉️")
        }
        return true;

    },
    fillUpNuker: function (creep, roomData) {
        if (!roomData.nuker || roomData.nuker.ghodium == roomData.nuker.ghodiumCapacity) {
            //console.log("No nuker or nuker full in "+creep.room.name+ " "+JSON.stringify(roomData.nuker))
            return false;
        }
        if (creep.carry[RESOURCE_GHODIUM]) {
            var res = creep.transfer(roomData.nuker, RESOURCE_GHODIUM)
            if (res == ERR_NOT_IN_RANGE) {
                if (creep.fatigue > 0) {
                    creep.say("😴💤")
                    return true
                }
                creep.moveTo(roomData.nuker, { visualizePathStyle: this.lineStyle, maxRooms: 1 })
                creep.say("💣")
            } else if (res !== OK) {
                console.log("Res was " + result)
                return false;
            }
            return true;
        }
        if (!creep.room.terminal.store[RESOURCE_GHODIUM] || creep.room.terminal.store[RESOURCE_GHODIUM] < creep.carryCapacity) {
            return false;
        }
        var result = creep.withdraw(creep.room.terminal, RESOURCE_GHODIUM)
        if (result == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.terminal, { visualizePathStyle: this.lineStyle, maxRooms: 1 })
        }
        creep.say("💣💣")
        return true;

    },
    getEnergyFromContainer: function (creep, roomData) {
        if (!creep.room.storage) {
            console.log("No storage in room")
            return false
        }
        var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (x) => {
                if (x.structureType !== STRUCTURE_CONTAINER) {
                    return false
                }
                return x.storeCapacity == _.sum(x.store)
            }
        })
        if (!source) {
            //console.log(`No source in ${creep.room.name}`)
            return false
        }

        var result = creep.withdraw(source, RESOURCE_ENERGY)
        creep.say("Container")
        if (result == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {
                visualizePathStyle: this.lineStyle
            })
        }
        return true
    },
    run: function (creep, roomData) {
        if (this.doBoringStuff(creep, roomData)) {
            //console.log("Boring...")
            return;
        }

        if (this.collectGoods(creep)) {
            return;
        }

        if (this.depositCarried(creep, roomData)) {
            return;
        }

        if (this.fillUpNuker(creep, roomData)) {
            return;
        }
        if (this.getEnergyFromContainer(creep, roomData)) {
            return;
        }
        creep.say("🤢");
    }

});
module.exports = roleLabWorker;