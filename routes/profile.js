

var express = require('express'),
    uuid = require('node-uuid'),
    _ = require('underscore');

module.exports = function(app,models, passport, logger){


    var router = express.Router();
    var UserProfile = models.userProfile();

   
    router.get('/:id', function(request, response) {
        logger.info('entering find user profile by id: ' + request.params.id);
        var access_token = null;
        
        if(request.params.id === 'me'){
            logger.info('coming from me');
             if(request.params.access_token){
                 access_token = request.params.access_token;
             }else{
                 access_token = request.headers.access_token;
             }
        }else{
            access_token = request.params.id;
        }
        
        logger.info('found access_token: ' + access_token);
        UserProfile.findById(access_token, function(err, result) {
            if(err){
                var errs = "error while retrieving profile for id: " + request.params.id + " " + err;
                response.status(500).json({error: errs});
            }else{
                logger.debug()
                response.json(result);
            }
        });
         
        logger.info('leaving find user profile by id: ' + request.params.id);       
    });

  

    router.put('/:id', function(request, response) {

        if (!request.body) {
            response.sendStatus(400);
            response.send("Invalid request");
            response.end();
            return
        }

        var username = request.body.username;
        var firstName = request.body.firstName;
        var lastName = request.body.lastName;
        var email = request.body.email;
        var password = request.body.password;
        var organization_id = request.body.organization_id;


        logger.info('locating profile: ' + request.params.id);

        UserProfile.findById(request.params.id, function(err, results) {
            if (err) {
                console.log('error while attempting to update profile');
                console.log(err);
                response.sendStatus(400);
            } else {
                results.username = username,
                    results.firstName = firstName,
                    results.lastName = lastName,
                    results.email = email,
                    results.password = password,
                    results.organization_id = request.organization_id,

                    results.save(function(err, results) {
                        response.json(results);
                    });
            }
        });
    });


    router.get('/',function(request,response){

        logger.info('entering get /profiles with orgid: ' + request.org_id);

        var Organization = models.organization();

        Organization.findOne({"cname" : request.org_id}, function(err,result){
            if((err) || (!result)){
                var err = {"error": err};
                logger.info("returning an error from get /profiles");        
                response.status(599).json(err);
            }else{
                var p = result;

                UserProfile.find().exec(function(errp,profile_results){
                    if((errp) || (!profile_results)){
                        var err = {"error": errp};
                        response.status(599).json(err);
                    }else{
                        //MASSIVE TODO::::THIS IS WAY INEFFICIENT, OBJECT REF NOT LOADING
                        var finalArr = [];
                        for(var idx=0;idx <  profile_results.length; ++idx){
                            if(profile_results[idx].organization_id.toString() === p._id.toString()){
                                finalArr.push(profile_results[idx]);
                            }
                        }
                        
                        logger.info("returning 200");
                        response.status(200).json(finalArr);
                    }
                });
            }
        });


    });


    router.post('/:id/connections/:provider', function(request, response) {

        
        if (!request.body) {
            response.sendStatus(400);
            response.done();
        }

        UserProfile.findById(request.params.id, function(err, result) {
            var promise = Q.defer();
            if (err) {
                console.log('unable to find profile: ' + err);
                handleError(request, response, err);
                promise.reject(err, result);
            } else {

                if (result.connections) {
                    _.each(result.connections, function(connection) {
                        if (connection.provider === request.body.provider) {
                            connection.provider_profile_id = request.body.provider_profile_id;

                        }
                    });
                }

                result.connections.push({
                    provider: request.body.provider,
                    provider_profile_id: request.body.provider_id
                });
                result.save(function(err, results) {
                    if (err) {
                        promise.reject(err, results);
                    } else {
                        promise.resolve(results);
                    }
                })
            }

            return promise;
        }).then(function(result) {
            response.json(result);
        }, function(err) {
            handleError(request, response, err);
        });
    });

    
    router.post('/', function(request, response) {

        var username = request.body.email;
        var firstName = request.body.firstName;
        var lastName = request.body.lastName;
        var email = request.body.email;
        var password = request.body.password;
        var location = request.body.location;
        var level = request.body.level;


        var create_new_user_profile = function(org){
            var UserProfile = new models.userProfile();
            var newProfile = new UserProfile();
      

            var save_callback = function(err, profile) {
                if(err){
                    response.status(500).json({error: err});
                }else{
                    response.json(profile);
                }
            }

            newProfile.username = username;
            newProfile.firstName = firstName;
            newProfile.lastName = lastName;
            newProfile.email = email;
            newProfile.password = password;
            newProfile.status = "enabled";  
            newProfile.organization = org;
            newProfile.organization_id = org._id;
            newProfile.level = level;
            newProfile.save(save_callback);
        }


        var Organization = models.organization();

        Organization.findOne({"cname":request.org_id},function(err,result){
             if((err) || (!result)){
                var err = {"error": err};
                logger.info("returning an error from get /profiles");        
                response.status(599).json(err);
             }else{
                 create_new_user_profile(result);   
             }
        });

    });


    router.delete('/:id', function(request, response) {

        var cb = function(err, res) {
            if (err) {
                response.send('error with request: ' + err);
            } else {

            }
        }
    });

    return(router);
}
