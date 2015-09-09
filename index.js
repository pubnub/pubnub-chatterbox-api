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

    //single instance of pubnub
    var pubnub = require('pubnub').init({
        subscribe_key: config.environments['development'].pubnub.subscribe_key,
        publish_key: config.environments['development'].pubnub.publish_key,
        secret_key: config.environments['development'].pubnub.secret_key,
        cipher_key: config.environments['development'].pubnub.cipher_key,
        ssl: true,
    });

    //connect to db, in this case we are using MongoDB hosted on mongolab and mongoose ODM 
    mongoose.connect(config.environments['development'].mongodb.url);
    var models = require('./model')(mongoose);

    //load up passport for security. Using localstrategy and bearer strayegy
    //require('./sec')(passport, models, logger);

   
    //add some middleware to add pubnub to each request.
    require('./middleware/add_pubnub_to_request')(app,pubnub,logger,config);
    
    //send a log message for each request with some useful diagnostic information
    //require('./middleware/add_logging_to_request')(app,winston,logger)


   

    
    app.set('port', (process.env.PORT || 5000));
    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.json({strict: false}));
    app.use(passport.initialize());
    app.use(passport.session());

    //app.use(passport.authenticate('bearer', {session: false})); //authenticate via basic auth
    var profile_router = require('./routes/profile')(app,models, passport,logger);
    app.use('/chatterbox/api/v1/:cname/profile',profile_router);
  
    var idx=0;

    app.param("cname",function(request,response,next,id){
        logger.info("inside param(cname) for: " + ++idx);
        var org = models.organization();
        request.org_id = id;
        next();
      
    });

     //CORS Support
    app.options('*', function(req,res){
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', true); 
        res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELTE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type'); 
    });



    var admin_router = express.Router();
    var apikey_router = require('./routes/apikey')(app,models, passport,logger);
    var rooms_router = require('./routes/rooms')(app,models, passport,logger);
    var organization_router = require('./routes/organization')(app,models, passport,logger);

    admin_router.use('/organization',organization_router);
    admin_router.use('/organization/:organization_id/apikey', apikey_router);
    admin_router.use('/organization/:organization_id/rooms', rooms_router);
    app.use("/chatterbox/api/v1/admin", admin_router);

    var urlencodedParser = bodyParser.urlencoded({ extended: false })
    app.post('/chatterbox/api/v1/authenticate', function(request,response){
       



        response.json(request.user);
    });



    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });

})()