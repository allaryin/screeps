module.exports = {
    run: function(creep) {
		// head back to the nearest spawn for recycling
		var spawn = null;
		if( creep.memory.spawn != null ) {
			spawn = Game.getObjectById(creep.memory.spawn);
		} else {
			spawn = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
				filter: function(object){
					return (object.structureType === STRUCTURE_SPAWN);
				}
			});
			if( spawn != null )
				creep.memory.spawn = spawn.id;
		}
		
		if( spawn == null ) {
			// something horrible went wrong, suicide
			console.log(creep+": was unable to find spawn for recycling, suiciding");
			creep.say('💣');
			creep.memory = null;
			creep.suicide();
			return;
		}
	
		creep.say('♻️');

		var res = spawn.recycleCreep(creep);
		if( res == ERR_NOT_IN_RANGE ) {
			creep.moveTo(spawn, {visualizePathStyle: {stroke: '#006600'}});
		} else if( res == OK ) {
		    console.log(spawn+": recycled "+creep);
		}
	}
};
