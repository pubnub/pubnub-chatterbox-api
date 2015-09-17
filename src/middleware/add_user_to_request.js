
var _ = require('underscore'),
	mongoose = require('mongoose');


module.exports = function(app,models,logger){

	
	app.use("/chatterbox/api/v1/profile/*", function(request,response, next){
		var access_token = request.headers['access_token'];
		logger.info('entering middleware apikey validation for key: %s', request.headers['access_token']);
		
		if(!access_token){
			var err = "access_token is required, your request is missing an api key";
			response.status(505).json({error: err});
		}

		var UserProfile = models.userProfile();
		 UserProfile.findById(access_token, function(err, result) {
            if(err){
                var errs = "error while retrieving profile for id: " + request.params.id + " " + err;
                response.redirect("/");
            }else{
            	logger.info('adding user to the request');
                request.user = result;
                next();
            }
        });
	});

	


}