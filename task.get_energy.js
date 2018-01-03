module.exports = {
    run: function(creep) {
        if( creep.carry.energy < creep.carryCapacity ) {
            if( creep.carry.energy == 0 ) {
                if( creep.ticksToLive < 150 ) {
                    console.log(creep+": suiciding because empty and ttl = "+creep.ticksToLive);
                    creep.suicide();
                    return;
                } else {
                    creep.say('🔄');
                }
            }
            
            // determine source to use
            var source = null;
            if( creep.memory.source != null ) {
                source = Game.getObjectById(creep.memory.source);
                //console.log(creep+": heading to source "+source);
            } else {
                var sources = null;
                // for non-harvesters, try to extract from spawn instead
                if( creep.memory.role != "harvester" && creep.room.energyAvailable > 250 ) {
                    // console.log(creep+": looking for energy structure to withdraw");
                    sources = creep.room.find(FIND_MY_STRUCTURES, {
        				filter: (structure) => {
        					return (structure.structureType == STRUCTURE_SPAWN);
        				}
        			});
    			}
                if( sources == null || sources.length == 0 )
                    sources = creep.room.find(FIND_SOURCES);
                
                var idx = Game.time % sources.length;
                source = sources[idx];
                // console.log(creep+": found energy source "+source);
                creep.memory.source = source.id;
            }
            
            // try to harvest
            var res;
            if( source instanceof Structure ) {
                if( source.energy < 50 ) {
                    // bail if we don't have enough energy
                    creep.memory.source = null;
                    return;
                }
                res = creep.withdraw(source, RESOURCE_ENERGY);
                // if( res == OK ) console.log(creep+": withdrew energy from "+source);
            } else {
                res = creep.harvest(source);
            }
                
            if( res == ERR_NOT_IN_RANGE ) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};
