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

    var logger = new(winston.Logger)({
        transports: [
            new(winston.transports.Console)
        ]
    });

    var pubnub = require('pubnub').init({
        subscribe_key: config.environments['development'].pubnub.subscribe_key,
        publish_key: config.environments['development'].pubnub.publish_key,
        secret_key: config.environments['development'].pubnub.secret_key,
        cipher_key: config.environments['development'].pubnub.cipher_key,
        ssl: true,
    });


    mongoose.connect('mongodb://chatterbox_dev:chatterbox_dev@ds041387.mongolab.com:41387/chatterbox_dev')

    var models = require('./model')(mongoose);
    require('./sec')(passport, mongoose, models);

   
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

    
    app.locals.error_call =  function(request, response, err) {
        logger.info('error caught');
        response.json({
            error: err,
        });
    };

    var profile_router = require('./routes/profile')(app,models, passport,logger);
    var apikey_router = require('./routes/apikey')(app,models, passport,logger);
    var rooms_router = require('./routes/rooms')(app,models, passport,logger);

    app.use('/chatterbox/api/v1/profile',profile_router);
    app.use('/chatterbox/api/v1/admin/apikey', apikey_router);
    app.use('/chatterbox/api/v1/admin/rooms', rooms_router);


    
    app.post('/chatterbox/v1/api/profile/auth', passport.authenticate('basic',{session: false}), function(request,response){
        response.json(request.user);
    });



    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });

})()