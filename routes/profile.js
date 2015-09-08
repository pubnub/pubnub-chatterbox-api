

var express = require('express'),
    Q = require('q'),
    uuid = require('node-uuid');

module.exports = function(app,models, passport, logger){


    var router = express.Router();
    var UserProfile = models.userProfile();

    router.get('/:id', function(request, response) {
        var promise = Q.defer();

        UserProfile.findById(request.params.id, function(err, response) {
         
            if (err) {
                promise.reject(err,result);
            }else{
                promise.resolve(result);
            }
            return promise;
        });

        promise.then(function(result){
            request.json(result);
        }, function(err,result){
            handleError(request,response,err);
        })
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


        console.log('locating profile: ' + request.params.id);

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


    router.get('/', function(request,response){

        UserProfile.find(function(err,results){
            if(!err){
                response.status(200).json(results);
            }else{
                app.locals.error(request,response,err);
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

        var newProfile = models.userProfile();
        console.dir(newProfile);

        var save_callback = function(err, profile) {
            response.json(profile);
        }

        newProfile.username = username;
        newProfile.firstName = firstName;
        newProfile.lastName = lastName;
        newProfile.email = email;
        newProfile.password = password;
        newProfile.status = "enabled";  
        newProfile.authKey = uuid.v4();

        newProfile.save(save_callback);

        //response.json({done:"yes"});

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
