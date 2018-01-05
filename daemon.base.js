// all this module does is retrieve a basic scan of rooms and spawns for further use

var daemonState = {
    'rooms': {},
    'spawns': Game.spawns
};

module.exports = {
    state: daemonState,
    run: function(globalState) {
        var state = daemonState;
        for( var spawnName in state.spawns ) {
            var spawn = state.spawns[spawnName];
            // console.log(spawn+": "+spawnName);
            
            var room = spawn.room;
            var rcl = room.controller.level;
            var roomState = {
                'room': room,
                'level': rcl,
                'spawns': []
            };
            
            state.rooms[room.name] = roomState;
        }
    }
};