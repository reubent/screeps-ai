function initWorld(Game) {
    function getBasicRoomDataStructure(room) {
        return {
            spawns: room.find(FIND_MY_SPAWNS),
            mine: undefined,
            mineral: undefined,
            nuker: undefined,
            dropped: [],
            droppedEnergy: [],
            construction: room.find(FIND_MY_CONSTRUCTION_SITES),
            highPriConstruction: room.find(FIND_MY_CONSTRUCTION_SITES, { filter: (o) => (o.structureType == STRUCTURE_TOWER || o.structureType == STRUCTURE_SPAWN) }),
            creeps: [],
            repair: [],
            labs: [],
            factories: [],
            towers: [],
            tombstones: room.find(FIND_TOMBSTONES),
            needEnergy: [],
            needEnergyHighPriority: [],
            neededEnergy: 0,
            neededEnergyHighPriority: 0,
            energySources: room.find(FIND_SOURCES, {
                filter: filterValidEnergySources
            })
        }
    }

    function filterValidEnergySources(thisSource) {
        return thisSource.energy > 0 || thisSource.ticksToRegeneration < 5;
    }

    function filterDroppedResources(toReturn, dropped) {
        toReturn.roomData.dropped.push(dropped)
        if (dropped.resourceType == RESOURCE_ENERGY) {
            if (dropped.amount > 50) {
                toReturn.roomData.energySources.push(dropped)
            }
            toReturn.roomData.droppedEnergy.push(dropped)
        }
    }

    function filterStructures(toReturn, structure) {
        if (needsRepair(structure)) {
            toReturn.roomData.repair.push(structure)
        }
        switch (structure.structureType) {
            case STRUCTURE_LAB:
                if (structure.my) {
                    toReturn.roomData.labs.push(structure);
                }
            // fall through
            case STRUCTURE_EXTENSION:
            case STRUCTURE_SPAWN:
                if (structure.my && structure.energy < structure.energyCapacity) {
                    toReturn.roomData.needEnergy.push(structure);
                    toReturn.roomData.needEnergyHighPriority.push(structure);
                    toReturn.roomData.neededEnergy += structure.energyCapacity - structure.energy;
                    toReturn.roomData.neededEnergyHighPriority += structure.energyCapacity - structure.energy;
                }
                break;
            case STRUCTURE_POWER_SPAWN:
                if (structure.my && structure.energy < structure.energyCapacity - 500) {
                    toReturn.roomData.needEnergy.push(structure);
                    toReturn.roomData.neededEnergy += structure.energyCapacity - structure.energy;
                }
                break;
            case STRUCTURE_STORAGE:
            case STRUCTURE_CONTAINER:
            case STRUCTURE_TERMINAL:
                if (structure.store[RESOURCE_ENERGY] > 0 && (structure.structureType !== STRUCTURE_TERMINAL || structure.store[RESOURCE_ENERGY] > 500)) {
                    toReturn.roomData.energySources.push(structure)
                }
                break;
            case STRUCTURE_FACTORY:
                toReturn.roomData.factories.push(structure)
                if (structure.store[RESOURCE_ENERGY] < 2000) {
                    toReturn.roomData.needEnergy.push(structure)
                    toReturn.roomData.neededEnergy += 1000 - structure.store[RESOURCE_ENERGY]
                }
                break;
            case STRUCTURE_LINK:
                if (structure.my && structure.energy > 0) {
                    toReturn.roomData.energySources.push(structure)
                }
                break;
            case STRUCTURE_TOWER:
                if (structure.my) {
                    toReturn.roomData.towers.push(structure);
                    if (structure.energy < structure.energyCapacity - 100) {
                        toReturn.roomData.needEnergy.push(structure);
                        toReturn.roomData.neededEnergy += structure.energyCapacity - structure.energy;
                    }
                }
                break;
            case STRUCTURE_NUKER:
                if (structure.my && structure.energy < structure.energyCapacity) {
                    toReturn.roomData.needEnergy.push(structure);
                    toReturn.roomData.neededEnergy += structure.energyCapacity - structure.energy;
                }
                toReturn.roomData.nuker = structure;
                break;
            case STRUCTURE_EXTRACTOR:
                toReturn.roomData.mine = structure;
                break;
        }
    }

    function getRoomData(Game, room) {
        var toReturn = {
            roomData: getBasicRoomDataStructure(room),
            tasks: []
        };
        _.each(room.find(FIND_DROPPED_RESOURCES), filterDroppedResources.bind(null, toReturn));

        var mineral = room.find(FIND_MINERALS).pop();
        if (typeof mineral !== "undefined") {
            toReturn.roomData.mineral = mineral;
        }
        _.each(room.find(FIND_STRUCTURES), filterStructures.bind(null, toReturn));
        return toReturn;
    }
    function needsRepair(structure) {
        var structureMax = structure.hitsMax
        if (structure.structureType === STRUCTURE_CONTAINER) {
            structureMax = 50000
            if (structure.room.controller.level > 6) {
                structureMax = 250000
            }
        }
        if (structure.structureType === STRUCTURE_RAMPART || structure.structureType === STRUCTURE_WALL) {
            structureMax = 25000;
            switch (structure.room.name) {
                case "W19S4":
                case "W17S3":
                case "W18S5":
                case "W19S5":
                case "W19S6":
                case "W19S11":
                case "W18S12":
                case "W19S13":
                case "W19S9":
                    structureMax = 6500000;
                    break;
                default:
                    structureMax = structure.room.controller.level > 6 ? 3000000 : 25000;
            }
        }
        return structure.hits < structureMax;
    }
    return {
        go: function (Game) {
            var rooms = {};
            var tasks = [];
            for (room in Game.rooms) {
                if (!Game.rooms[room].controller || !Game.rooms[room].controller.my) {
                    console.log("Room " + Game.rooms[room].name + " is not ours")
                    continue;
                }
                var roomData = getRoomData(Game, Game.rooms[room]);
                rooms[Game.rooms[room].name] = roomData.roomData;
                tasks = tasks.concat(roomData.tasks)
            }

            return {
                rooms: rooms,
                tasks: tasks
            }
        }
    }
}

module.exports = initWorld();