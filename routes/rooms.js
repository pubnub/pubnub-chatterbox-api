
var express = require('express');

module.exports = function(app,models,passport,logger){
	
	var router = express.Router();

	router.get('/:room_id', function(request,response){
		response.send(200,{completed: yes});
	});

	router.post('/',function(request,response){

		  var roomName = request.body.room_name;
		  var room_description = request.body.room_description;
		  var organization_id = request.organization_id;
	      var newRoom = new models.room();
     	  
        	var save_callback = function(err, room) {
            	response.json(profile);
        	}

        new_room.name = room_name,
        new_room.description = room_description,
        new_room.organization_id = organization_id,
        new_room.save(save_callback);
	});


	return(router);

}