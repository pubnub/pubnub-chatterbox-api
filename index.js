var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var Q = require('q');

var winston = require('winston');

var passport = require('passport');

var _ = require('underscore');
var uuid = require('node-uuid');

module.exports = (function() {

    var app = express();
    var config = require('./config.json');

    var logger = new(winston.Logger)({
        transports: [
            new(winston.transports.Console)
        ]
    });

    var pubnub = require('pubnub').init({
        subscribe_key: 'sub-c-8bd55596-1f48-11e5-9205-0619f8945a4f',
        publish_key: 'pub-c-27c05fcb-d215-4433-9b95-a6e3fd9f49d7'
    });


    mongoose.connect('mongodb://chatterbox_dev:chatterbox_dev@ds041387.mongolab.com:41387/chatterbox_dev')

    var models = require('./model')(mongoose);
    require('./sec')(passport, mongoose, models);

    var UserProfile = models.userProfile();
    var ApiKey = models.apiKey();

 
    app.use(function(req,res,next){
        req.pubnub = pubnub;
        if(next){ next(); }
    })

    app.use(function(req, res, next) {

        var logmsg = 'rstart: %j, from: %s, path: %s';
        logger.info(logmsg, new Date(), req.ip, req.path);
        winston.profile(req.ip);
        
        if (next) {
            next();
        }
        
        winston.profile(req.ip);

        var logMessage = { ip: req.ip
                           ,bearer: req.access_token 
                           ,date: new Date()
                           ,statusCode: res.status
                           ,duration: req.headers['startTime']
                        };
        if(req.pubnub){
            req.pubnub.publish({channel: 'chatterbox_dev-analytics'
                           ,message: logMessage
                           ,callback: function(){
                                    logger.info('analytics message published');
                            }});
        }
    });

    app.set('port', (process.env.PORT || 5000));
    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.json());
    app.use(passport.initialize());
    app.use(passport.session());


    var handleError = function(request, response, err) {
        logger.info('error caught');
        response.json({
            error: err,
        });
    };



    //app.get('/profile/:id', passport.authenticate('bearer', {session: false}), function(request, response) {
    app.get('/profile/:id', function(request, response) {
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


    app.put('/profile/:id', function(request, response) {

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
                    results.save(function(err, results) {
                        response.json(results);
                    });
            }
        });
    });

    app.post('/profile/:id/connections/:provider', function(request, response) {

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



    app.post('/profile', function(request, response) {

        console.dir(request.body);

        var username = request.body.email;
        var firstName = request.body.firstName;
        var lastName = request.body.lastName;
        var email = request.body.email;
        var password = request.body.password;
        var location = request.body.location;

        var newProfile = models.userProfile();

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

    });


    app.delete('/profile/:id', function(request, response) {

        var cb = function(err, res) {
            if (err) {
                response.send('error with request: ' + err);
            } else {

            }
        }
    });


    app.post('/admin/api_key',passport.authenticate('basic', {session: false}), function(request,response){
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

    app.post('/chatterbox/v1/api/profile/auth', passport.authenticate('basic',{session: false}), function(request,response){
        response.json(request.user);
    });

    




    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });


})()