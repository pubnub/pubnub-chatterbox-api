
var _ = require('underscore'),
	mongoose = require('mongoose');


module.exports = function(app,models,logger){

	
	app.use("*", function(request,response, next){
		var apikeyval = request.headers['apikey'];
		logger.info('entering middleware apikey validation for key: %s', request.headers['apikey']);
		
		if(!apikeyval){
			var err = "api key is required, your request is missing an api key";
			response.status(505).json({error: err});
		}

		var org = models.organization();
		
		org.findOne({"keys" : { $elemMatch: {"api_key": apikeyval}}}, function(err,result){

			if((err) || (!result)){
				var err = "could not find the api key: " + apikeyval;
				response.status(404).json({error: err});
			}else{
				logger.info('keyvalidation found active organization: ' + result.name);
				request.org = result;
				next();
			}
		});
	});

	app.use(passport.)


}