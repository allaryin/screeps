module.exports = {
	run: function(creep) {
		// make sure we have energy
		if( creep.carry.energy == 0 ) {
			// bail and switch to harvest mode
			creep.memory.target = null;
			creep.memory.task = null;
			return;
		} else {
			creep.say('🚧');
		}

		//var err = "";
		
		// determine target for building
		var target = null;
		if( creep.memory.target != null ) {
			//err += "0";
			target = Game.getObjectById(creep.memory.target);
			if( target == null ) {
				creep.memory.target = null;
				return;
			}
		} else {
			//err += "1";
			target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
			if( target != null ) {
				creep.memory.target = target.id;
			} else {
				// we were unable to find a target to build, cycle tasks...
				creep.memory.task = "repair";
				creep.memory.target = null;
				return;
			}
		}

		// try to build
		if( target != null ) {
			//err += "2";
			var res = creep.build(target);
			if( res == ERR_NOT_IN_RANGE) {
				//err += "3";
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
			} else if( res == OK) {
				var progress = Math.floor(100.0 * target.progress / target.progressTotal);
				creep.say( progress );
			} else {
				creep.say(res);
			}
		} else {
			//err += "4";
			console.log(creep+": is trying to build null structure");
		}

		//console.log(creep,err);
	}
};
