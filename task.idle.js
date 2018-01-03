module.exports = {
    run: function(creep) {
        if( creep.memory.idle ) {
            if( --creep.memory.idle == 0 ) {
                creep.memory.target = null;
                creep.memory.task = null;
                creep.say("!");
            }
        } else {
            var target = null;
            if( creep.memory.target != null ) {
                target = Game.getObjectById(creep.memory.target);
            } else {
                // find nearest idle flag
                target = creep.pos.findClosestByRange(FIND_FLAGS);
                creep.memory.target = target.id;
                creep.say('Zzz');
                creep.memory.idle = 20;
            }
            
            creep.moveTo(target, {visualizePathStyle: {stroke: '#000033'}});
        }
    }
};