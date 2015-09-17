
var uuid = require('node-uuid'),
	  _  = require('underscore'),
 express = require('express');

module.exports = function(app,models, passport, logger){
	

	 var router = express.Router();

	 router.post('/api_key',passport.authenticate('basic', {session: false}), function(request,response){
        if(!request.body){
            handleError(request,response,"body not present in request");
            return;
        }

        var vrequest = function(request){
            if(  (_.isEmpty(request.body.application)) ||
                 (_.isEmpty(request.body.contact_email)) || 
                 (_.isEmpty(request.body.company)) ){
                    return false;
                }else{
                    return true;
                }
        }

        if(vrequest(request)){
            var newApiKey = uuid.v4();
            var apiKey = models.apiKey();
            apiKey.application = request.body.application;
            apiKey.contact_email = request.body.contact_email;
            apiKey.api_key = newApiKey;
            apiKey.status = "enabled";
            apiKey.save(function(err,result){
                if(err){
                    handleError(request,response,err);
                }else{
                    response.json(result);
                }
            });
        }

    });

	return router;
}