
var express = require('express');

module.exports = function(app,models,passport,logger){
	
	var router = express.Router();

	router.get('/:room_id', function(request,response){
		response.send(200,{completed: yes});
	});

	router.post('/',function(request,response){

	});


	return(router);

}