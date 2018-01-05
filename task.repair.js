module.exports = {
    run: function(creep) {
        // determine target for repair
		var target = null;
		if( creep.memory.target != null ) {
			target = Game.getObjectById(creep.memory.target);
		} else {
		    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: function(object){
                    // TODO: Be smarter about repairing walls - they're lower priority than roads and have 300M hp...
                    return (object.structureType === STRUCTURE_ROAD ||
                            object.structureType === STRUCTURE_WALL) 
                                && (object.hits < 2500 /*object.hitsMax / 2*/);
                } 
            });
            
		    if( target != null )
    			creep.memory.target = target.id;
		}
		
		if( target == null || target.hits == target.hitsMax ) {
		    creep.say('?');
		    creep.memory.task = 'upgrade';
		    creep.memory.target = null;
		    return;
		}
        
        var res = creep.repair(target);
        if(res == ERR_NOT_IN_RANGE) {
            // creep.say('@');
            creep.say("🔨");
            creep.moveTo(target, {visualizePathStyle: {stroke: '#66ff66'}});
        } else if( creep.carry.energy == 0 ) {
            // creep.say("%");
            creep.memory.task = 'get_energy';
            creep.memory.target = null;
        } else if( res == OK ) {
            var percent = Math.round( 100.0 * target.hits / target.hitsMax );
            creep.say("🔨 "+percent);
        }
	}
};
