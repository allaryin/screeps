var tasks = {
    "get_energy": require('task.get_energy'),
    "deliver_energy": require('task.deliver_energy'),
    "build": require('task.build'),
    "upgrade": require('task.upgrade'),
    //"idle": require('task.idle'),
    "recycle": require('task.recycle'),
    "repair": require('task.repair')
}

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

function err(obj,e) {
    console.log("!! ",obj,e);
}

var daemons = [ "base" ];

module.exports.loop = function () {
    
    console.log(Game.time);
    
    // tick through daemons
    var state = {};
    for( var daemonIdx in daemons ) {
        var daemonName = daemons[daemonIdx];
        var daemon = null;
        try {
            daemon = require('daemon.'+daemonName);
            daemon.run(state);
            state[daemonName] = daemon.state;
        } catch( e ) {
            err(daemonName,e);
        }
    }

    var rcl = Game.spawns["Spawn1"].room.controller.level;

    var roster = {
        'harvester': {
            'total': 0,
            'target': (rcl == 1 ? 2 : 3),
            'default': 'deliver_energy'
        },
        'builder': {
            'total': 0,
            'target': 2 * rcl,
            'default': 'build'
        },
        'upgrade': {
            'total': 0,
            'target': rcl,
            'default': 'upgrade'
        },
        'repair': {
            'total': 0,
            'target': 1,
            'default': 'repair'
        }
    };

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        
        var role = creep.memory.role;
        //console.log(creep+": "+role);
        ++roster[role].total;

        if( tasks.hasOwnProperty(creep.memory.task) ) {
            if( creep.memory.task == 'get_energy' && creep.carry.energy == creep.carryCapacity ) {
                creep.memory.task = null;
                creep.memory.source = null;
            } else {
                try {
                    tasks[creep.memory.task].run(creep);
                } catch( e ) {
                    err(creep,e);
                }
            }
        } else if( creep.carry.energy < creep.carryCapacity ) {
            creep.memory.task = 'get_energy';
        } else {
            creep.memory.task = roster[role].default;
        }
    }
    
    // see if we need more workers
    for(var name in Game.spawns) {
        var spawn = Game.spawns[name];
        
        // trigger towers
        defendRoom(spawn.room.name);
        
        // only try to spawn from full for now
        if( spawn.spawning ) {
            // spawn.say( spawn.spawning.name );
        
            // run GC    
            for(var name in Memory.creeps) {
                if(!Game.creeps[name]) {
                    delete Memory.creeps[name];
                    console.log(spawn+': collecting non-existent creep', name);
                }
            }
            
        } else if( spawn.room.energyAvailable > 250 ) {
            // check what we need...
            for( var role in roster ) {
                if( roster[role].total < roster[role].target ) {
                    var creepName = role+Game.time;
                    console.log(spawn+": spawning "+creepName+" ("+roster[role].total+"/"+roster[role].target+")");
                    
                    var creepBody = [CARRY,MOVE,WORK];
                    if( spawn.room.energyAvailable > 500 )
                        creepBody = [CARRY,MOVE,MOVE,WORK,WORK,WORK];
                    else if( spawn.room.energyAvailable > 400 )
                        creepBody = [CARRY,MOVE,WORK,WORK];
                    
                    spawn.spawnCreep( creepBody, creepName, {
                        memory: { 'role': role }
                    } );
                    break;
                }
            }
        }
    }
}