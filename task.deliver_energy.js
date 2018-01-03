module.exports = {
    run: function(creep) {
		// determine target for delivery
		var target = null;
		if( creep.memory.target != null ) {
			target = Game.getObjectById(creep.memory.target);
		} else {
			var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_EXTENSION ||
							structure.structureType == STRUCTURE_SPAWN ||
							structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
				}
			});
			if( targets.length == 0 ) {
				// no targets for delivery - need to idle
				creep.memory.target = null;
				creep.memory.task = 'build';
				return;
			}
			
			var idx = Game.time % targets.length;
			target = targets[idx];
			creep.memory.target = target.id;
		}

		if( creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE ) {
			creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
		} else {
			creep.say('⚡');
			creep.memory.target = null;
			creep.memory.task = null;
		}
    }
};
