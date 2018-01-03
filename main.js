var tasks = {
    "get_energy": require('task.get_energy'),
    "deliver_energy": require('task.deliver_energy'),
    "build": require('task.build'),
    "upgrade": require('task.upgrade'),
    //"idle": require('task.idle'),
    "recycle": require('task.recycle'),
    "repair": require('task.repair')
}

module.exports.loop = function () {

    var roster = {
        'harvester': {
            'total': 0,
            'target': 2,
            'default': 'deliver_energy'
        },
        'builder': {
            'total': 0,
            'target': 4,
            'default': 'build'
        },
        'upgrade': {
            'total': 0,
            'target': Game.spawns["Spawn1"].room.controller.level,
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
        // TODO: garbage collection

        var role = creep.memory.role;
        if( role == null || role == 'harvest' ) {
            role = creep.memory.role = 'harvester';
        }
        //console.log(creep+": "+role);
        ++roster[role].total;

        if( tasks.hasOwnProperty(creep.memory.task) ) {
            if( creep.memory.task == 'get_energy' && creep.carry.energy == creep.carryCapacity ) {
                creep.memory.task = null;
                creep.memory.source = null;
            } else {
                tasks[creep.memory.task].run(creep);
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
                    console.log(spawn+": spawning "+creepName);
                    
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