// all this module does is retrieve a basic scan of rooms and spawns for further use

var daemonState = {
    'hostiles': {},
    'towers': {}
};

/**
 * Lifted directly from http://docs.screeps.com/defense.html
 */
function defendRoom(roomName) {
    var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
    if(hostiles.length > 0) {
        var username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${roomName}`);
        var towers = Game.rooms[roomName].find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.attack(hostiles[0]));
    }
}

module.exports = {
    state: daemonState,
    run: function(globalState) {
        
        // TODO: store most of this in room memory instead
        
        var state = daemonState;
        for( var roomName in globalState['base'].rooms ) {
            var room = Game.rooms[roomName];
            
            var hostiles = room.find(FIND_HOSTILE_CREEPS);
            var towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            
            for( var towerIdx in towers ) {
                var tower = towers[towerIdx];
                if( hostiles.length > 0 ) {
                    // if hostiles present, shoot the first thing on the list still alive
                    for( var hostileIdx in hostiles ) {
                        var hostile = hostiles[hostileIdx];
                        if( hostile != null && hostile.hits > 0 ) {
                            tower.attack(hostile);
                            break;
                        }
                    }
                } else if( tower.energy > 749 ) {
                    // if no hostiles and energy > 75%, repair something
                    var structures = room.find(FIND_STRUCTURES, {
                        filter: function(object){
                            return (object.structureType === STRUCTURE_ROAD ||
                                    object.structureType === STRUCTURE_SPAWN ||
                                    object.structureType === STRUCTURE_EXTENSION) 
                                        && (object.hits < object.hitsMax / 2);
                        } 
                    });
                    if( structures.length > 0 ) {
                        tower.repair( structures[0] );
                    }
                }
            }
            
            state.hostiles[roomName] = hostiles;
            state.towers[roomName] = towers;
        }
    }
};