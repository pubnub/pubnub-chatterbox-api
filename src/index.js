var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    fs = require('fs'),
    path = require('path'),
    passport = require('passport');

module.exports = (function() {

    var app = express();
    var config = require('../config.json');

    //load configuration values depending on environment
    if (process.argv.length < 3) {
        winston.log('error', "must pass a configuration file");
        process.exit();
    }


    var configfile = path.resolve(__dirname, process.argv[2]);
    var config = require(configfile);
    console.log('using config file: %s', configfile);

    var logger = new(winston.Logger)({
        transports: [
            new(winston.transports.Console)({
                colorize: true
            }), new(winston.transports.File)({
                filename: config.logging.log_path + '/debug.log',
                level: 'info'
            })
        ]
    });

    var pubnub = require('pubnub').init({
        subscribe_key: config.pubnub.subscribe_key,
        publish_key: config.pubnub.publish_key,
        secret_key: config.pubnub.secret_key,
        uuid: "chatterbox_api_server_admin",
        ssl: false,
    });

    pubnub.grant({
        channel: 'webinar-chat',
        read: true,
        write: true,
        ttl: 14400,
        callback: function(m) {
            logger.info('channel level grant success: ');
            logger.info(m);
        },
        error: function(m) {
            logger.info('channel level grant failed: ');
            logger.info(m);
        }
    });

    //presence
    pubnub.grant({
        channel: 'webinar-chat-pnpres',
        read: true,
        write: true,
        ttl: 14400,
        callback: function(m) {
            logger.info('channel level grant success: ');
            logger.info(m);
        },
        error: function(m) {
            logger.info('channel level grant failed: ');
            logger.info(m);
        }
    });



    //connect to db, in this case we are using MongoDB hosted on mongolab and mongoose ODM 
    mongoose.connect(config.mongodb.url);

    var models = require('./model')(mongoose);

    //load up passport for security. Using localstrategy and bearer strayegy
    //require('./sec')(passport, models, logger);

    //add some middleware to add pubnub to each request.
    require('./middleware/add_user_to_request')(app, models, logger);

    //add some middleware to add pubnub to each request.
    require('./middleware/add_pubnub_to_request')(app, pubnub, logger, config);

    //send a log message for each request with some useful diagnostic information
    require('./middleware/add_logging_to_request')(app, winston, logger);



    app.set('port', (process.env.PORT || 5000));
    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.json({
        strict: false
    }));


    //CORS Support
    app.use('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELTE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.status(200).end();
        } else {
            next();
        }
    });



    var profile_router = require('./routes/profile')(app, models, passport, logger);
    app.use('/chatterbox/api/v1/:cname/profile', profile_router);


    app.param("cname", function(request, response, next, id) {
        logger.info("inside param(cname) for: " + request.path);
        request.org_id = id;
        next();
    });


    var admin_router = express.Router();
    var apikey_router = require('./routes/apikey')(app, models, passport, logger);
    var rooms_router = require('./routes/rooms')(app, models, passport, logger);
    var organization_router = require('./routes/organization')(app, models, passport, logger);



    admin_router.use('/organization', organization_router);
    admin_router.use('/organization/:cname/apikey', apikey_router);
    admin_router.use('/organization/:cname/rooms', rooms_router);
    app.use("/chatterbox/api/v1/admin", admin_router);

    app.param("cname", function(request, response, next, id) {
        logger.info("inside param(cname) for: " + request.path);
        request.org_id = id;
        next();

    });


    //here is where we go the grant
    function grantPermissions(rooms, profile) {
        try {
            var authk = profile._id.toString().trim();
            var list_of_channel_names = [];

            for (var idx = 0; idx < rooms.length; ++idx) {
                logger.info('granting access to room: ' + rooms[idx].room_name + " channel: " + rooms[idx].channel_name + " to authkey: " + authk);

                pubnub.grant({
                    channel: rooms[idx].channel_name + "," + rooms[idx].channel_name + "-pnres",
                    auth_key: authk,
                    read: true,
                    write: true,
                    ttl: 1440, //24hrs...this is the default
                    callback: function(result) {
                        logger.info(result);
                        response.status(200).json(profile);
                    },

                    error: function(result) {
                        logger.info("grant failed with message: %s" + result);
                        response.status(500).json({
                            "error": result
                        });
                    }
                });

            }
        } catch (e) {
            logger.info("exception caught in grant:" + e);
        }
    }


    app.post('/chatterbox/:cname/login', function(request, response) {
            logger.info('entering login');
            logger.info(request.body);


            if ((!request.body.username) || (!request.body.password)) {
                errorResponse = {
                    "error": "invalid and/or missing user name and password"
                }
                response.status(403)
                        .json(errorResponse)
                        .end();
            }

            
            models.organization().findOne({
                "cname": request.org_id
            }, function(err, org) {
                if ((err) || (!org)) {
                    var error = {
                        "error": "could not find orgnization"
                    };
                    response.status(404).json(error);
                } else {
                    models.userProfile().find({"username": request.body.username},
                        function(errp, profile_results) {
                            if ((errp) || (!profile_results)) {
                                var err = {
                                    "error": errp
                                };
                                response.status(599).json(err);
                            } else {
                                //find all the rooms with this level, grant for each 4 hours
                                models.room().find({
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

                                    grant_access(rooms, profile_results[0]);

                                });


                            }

                        });
                }
            });
        
    });



    //added for webhooks
    app.post("/chatterbox/api/v1/presence/hook", function(request,response){
        var body = request.body
        response.status(200).json(body);
    });



app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

})()