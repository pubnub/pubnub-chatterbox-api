var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Q = require('q'),
    winston = require('winston'),
    passport = require('passport'),
    _ = require('underscore'),
    uuid = require('node-uuid');



module.exports = (function() {

    var app = express();
    var config = require('./config.json');

    //winston logger
    var logger = new(winston.Logger)({
        transports: [
            new(winston.transports.Console)
        ]
    });


    logger.info('initalizing pubnub with key: \n publish: %s \n subscribe: %s,\n secret_key: %s', config.environments['development'].pubnub.publish_key,
                                                                                                  config.environments['development'].pubnub.subscribe_key,
                                                                                                  config.environments['development'].pubnub.secret_key);
    //single instance of pubnub
    var pubnub = require('pubnub').init({
        subscribe_key: config.environments['development'].pubnub.subscribe_key,
        publish_key: config.environments['development'].pubnub.publish_key,
        secret_key: config.environments['development'].pubnub.secret_key,
        uuid: "chatterbox_api_server_admin",
        origin: 'ps5.pubnub.com',
        ssl: false,
    });

    //connect to db, in this case we are using MongoDB hosted on mongolab and mongoose ODM 
    mongoose.connect(config.environments['development'].mongodb.url);
    var models = require('./model')(mongoose);

    //load up passport for security. Using localstrategy and bearer strayegy
    require('./sec')(passport, models, logger);


    //add some middleware to add pubnub to each request.
    require('./middleware/add_pubnub_to_request')(app, pubnub, logger, config);

    //send a log message for each request with some useful diagnostic information
    require('./middleware/add_logging_to_request')(app, winston, logger)



    app.set('port', (process.env.PORT || 5000));
    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.json({
        strict: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    //app.use(passport.authenticate('bearer', {session: false})); //authenticate via basic auth
    var profile_router = require('./routes/profile')(app, models, passport, logger);


    app.use('/chatterbox/api/v1/:cname/profile', profile_router);


    app.param("cname", function(request, response, next, id) {
        logger.info("inside param(cname) for: " + request.path);
        request.org_id = id;
        next();

    });



    //CORS Support
    app.options('*', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELTE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
    });



    var admin_router = express.Router();
    var apikey_router = require('./routes/apikey')(app, models, passport, logger);
    var rooms_router = require('./routes/rooms')(app, models, passport, logger);
    var organization_router = require('./routes/organization')(app, models, passport, logger);

    admin_router.use('/organization', organization_router);
    admin_router.use('/organization/:cname/apikey', apikey_router);
    admin_router.use('/organization/:cname/rooms', rooms_router);
    app.use("/chatterbox/api/v1/admin", admin_router);

    admin_router.param("cname", function(request, response, next, id) {
        logger.info("inside param(cname) for: " + request.path);
        request.org_id = id;
        next();

    });

    var urlencodedParser = bodyParser.urlencoded({
        extended: false
    });

    app.post('/chatterbox/:cname/login', function(request, response) {

        if (request.org_id) {
            if ((!request.body.username) || (!request.body.password)) {
                response.status(403).json({
                    "error": "invalid and/or missing user name and password"
                });

            } else {
                var Organization = models.organization();
                var UserProfile = models.userProfile();
                var Room = models.room();

                Organization.findOne({
                    "cname": request.org_id
                }, function(err, org) {
                    if ((err) || (!org)) {
                        var error = {
                            "error": "could not find orgnization"
                        };
                        response.status(404).json(error);
                    } else {
                        UserProfile.find({
                            "username": request.body.username
                        }, function(errp, profile_results) {
                            if ((errp) || (!profile_results)) {
                                var err = {
                                    "error": errp
                                };
                                response.status(599).json(err);
                            } else {
                                //MASSIVE TODO::::THIS IS WAY INEFFICIENT, OBJECT REF NOT LOADING
                                var final_user = [];
                                for (var idx = 0; idx < profile_results.length; ++idx) {
                                    if (profile_results[idx].organization_id.toString() === org._id.toString()) {
                                        final_user.push(profile_results[idx]);
                                    }
                                }


                                //here is where we go the grant
                                var grant_access = function(rooms, auth_key) {
                                    try {
                                        logger.debug('granting for authkey: ' + auth_key);
                                        var list_of_channel_names = [];
                                        for (var idx = 0; idx < rooms.length; ++idx) {
                                            logger.info('granting access to room: ' + rooms[idx].room_name + " channel: " + rooms[idx].channel_name + " to authkey: " + auth_key);

                                            
                                            pubnub.time( function(r){
                                                    var myLocalTime = new Date().getTime() * 1000;
                                                    logger.info('server time: ' + r + " actual time: " + new Date(r / 10000));
                                                    logger.info('local time: ' + myLocalTime + ' actual time: ' + new Date());
                                            });

                                            pubnub.grant({
                                                channel: rooms[idx].channel_name,
                                                auth_key: auth_key,
                                                read: true,
                                                write: true,
                                                ttl: 1440,
                                                callback: function(result) {
                                                    logger.info(result);
                                                    response.redirect("/chatterbox/api/v1/" + request.org_id + "/profile/me");
                                                }
                                                ,error: function(result) {
                                                    logger.info("grant failed with message: %s" + result);
                                                    logger.info(result);
                                                    response.redirect("/chatterbox/api/v1/" + request.org_id + "/profile/me");
                                                }

                                            });


                                            pubnub.grant({
                                                channel: rooms[idx].channel_name + "-pnpres",
                                                auth_key: auth_key,
                                                read: true,
                                                write: true,
                                                ttl: 1440,
                                                callback: function(result) {
                                                    logger.info(result);
                                                    response.redirect("/chatterbox/api/v1/" + request.org_id + "/profile/me");
                                                }
                                                ,error: function(result) {
                                                    logger.info("grant failed with message: %s" + result);
                                                    logger.info(result);
                                                    response.redirect("/chatterbox/api/v1/" + request.org_id + "/profile/me");
                                                }

                                            });
                                        }
                                    } catch (e) {
                                        logger.info("exception caught in grant:" + e);
                                    }
                                }


                            
                                //find all the rooms with this level, grant for each 4 hours
                                Room.find({
                                    "level": profile_results[0].level
                                }, function(request, rooms) {

                                    //HACK, org is referenced as a dbref, mongoose has issues with dbref
                                    //This pulls ALL rooms for ALL orgs and filters
                                    var final_rooms = [];
                                    for (var idx = 0; idx < rooms.length; ++idx) {
                                        if (rooms[idx].organization_id.toString() === org._id.toString()) {
                                            final_rooms.push(rooms[idx]);
                                        }
                                    }

                                    grant_access(rooms, final_user[0]._id);

                                });

                                
                            }

                        });
                    }
                });
            }
        }
    });



    app.post('/chatterbox/:cname/login', urlencodedParser, passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: "/403"
    }));

    app.get('/chatterbox/loginfailed', function(request, response) {
        response.json(403, {
            "error": "login failed"
        });
    })



    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });

})()