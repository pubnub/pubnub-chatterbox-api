
var express = require('express');

module.exports = function(app,models,passport,logger){
	
	var router = express.Router();

	router.get('/:room_id', function(request,response){
		response.send(200,{completed: yes});
	});


	router.get('/', function(request,response){

        logger.info('entering get /rooms with orgid: ' + request.org_id);

        var Organization = models.organization();
        var Rooms = models.room();

        Organization.findOne({"cname" : request.org_id}, function(err,result){
            if((err) || (!result)){
                var err = {"error": err};
                logger.info("returning an error from get /rooms");        
                response.status(599).json(err);
            }else{
                var p = result;

                Rooms.find().exec(function(errp,rooms){
                    if((errp) || (!rooms)){
                        var err = {"error": errp};
                        response.status(599).json(err);
                    }else{
                        //MASSIVE TODO::::THIS IS WAY INEFFICIENT, OBJECT REF NOT LOADING
                        var finalArr = [];
                        for(var idx=0;idx <  rooms.length; ++idx){
                            if(rooms[idx].organization_id.toString() === p._id.toString()){
                                finalArr.push(rooms[idx]);
                            }
                        }
                        
                        response.status(200).json(finalArr);
                    }
                });
            }
        });


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