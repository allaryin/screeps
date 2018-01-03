module.exports = {
    run: function(creep) {
        if( creep.carry.energy < creep.carryCapacity ) {
            if( creep.carry.energy == 0 ) {
                if( creep.ticksToLive < 150 ) {
                    console.log(creep+": recycling because empty and ttl = "+creep.ticksToLive);
                    creep.memory.task = 'recycle';
                    return;
                } else {
                    creep.say('🔄');
                }
            }
            
            // determine source to use
            var source = null;
            if( creep.memory.source != null ) {
                source = Game.getObjectById(creep.memory.source);
                if( source == null ) {
                    creep.say('?!');
                    // console.log(creep+": unable to find expected energy source");
                    creep.memory.source = null;
                    return;
                }
                // console.log(creep+": heading to source "+source);
            } else {
                creep.say('🔍');
				// check for dropped resources first
                var sources = null;
                if( creep.memory.role != "harvester" && creep.room.energyAvailable > 250 ) {
                	// for non-harvesters, try to extract from spawn instead
                    // console.log(creep+": looking for energy structure to withdraw");
                    sources = creep.room.find(FIND_MY_STRUCTURES, {
        				filter: (structure) => {
        					return (structure.structureType == STRUCTURE_SPAWN) && structure.energy > 50;
        				}
        			});
    			} 
                if( sources == null || sources.length == 0 ) {
                    sources = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 8);
					if( sources.length ) {
                        for( var srcidx in sources ) {
                            var src = sources[srcidx];
                            console.log(src+": "+src.amount+" "+src.resourceType+" @ "+src.pos);
                        }
                    } else {
                        sources = creep.room.find(FIND_SOURCES);
                    }
				}
				
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
                creep.memory.source = null;
                // if( res == OK ) console.log(creep+": withdrew energy from "+source);
			} else if( source instanceof Resource ) {
				res = creep.pickup(source);
				if( res == OK ) console.log(creep+": picked up energy from the ground");
				creep.memory.source = null;
            } else {
                res = creep.harvest(source);
            }
                
            if( res == ERR_NOT_IN_RANGE ) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};
