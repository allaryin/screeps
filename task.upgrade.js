module.exports = {
    run: function(creep) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.say('⚡');
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        } else if( creep.carry.energy == 0 ) {
            creep.memory.task = null;
        }
	}
};
