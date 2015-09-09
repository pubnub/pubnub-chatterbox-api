
var express = require('express');

module.exports = function(app,models,passport,logger){
	
	var router = express.Router();

	router.get('/:organization_id', function(request,response){

		var org = models.organization();
		org.find({'_id':request.params.organization_id}, function(err,result){
			if((err) || (!result)){
				response.status(500).json({error: err});
			}else{
				response.status(200).json(result);
			}
		});

	});

	router.get('/', function(request,response){

		var org = models.organization();
		org.find(function(err,result){
			if((err) || (!result)){
				logger.info("error in get organizations: " + err);
				response.status(500).json({error: err});
			}else{
				response.status(200).json(result);
			}
		});

	});

	router.post('/',function(request,response){
		  logger.info('entering save organization');
		  var org_name = request.body.name;
		  var org_isactive = true;
		  var org_cname = request.body.cname;
		  var keys = request.body.keys;
		  
		  var Organization = models.organization();
	      var new_organization = new Organization();
     	  
          var save_callback = function(err, result) {
          	if((err) || (!result)){
          		var err = "exception while saving organization: "  + err;
          		response.status(500).json({error: err});

          	}else{
            	response.status(200).json(result);
          	}
          };

          new_organization.name = org_name;
          new_organization.is_active = org_isactive;
          new_organization.cname = org_cname;
          new_organization.keys = keys;
          new_organization.save(save_callback);
	});


	return(router);

}