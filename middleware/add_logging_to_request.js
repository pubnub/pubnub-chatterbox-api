


module.exports = function(app,winston,logger){

	 app.use(function(req, res, next) {

        var logmsg = 'rstart: %j, from: %s, path: %s';
        logger.info(logmsg, new Date(), req.ip, req.path);
        winston.profile(req.ip);
        
        if (next) {
            next();
        }else{
            winston.profile(req.ip);
   	        req.pubnub.publish({channel: 'chatterbox_dev-log'
                           ,message: { ip: req.ip
		                               ,apikey: req.headers['Authorization']
                			           ,timestamp: new Date()
          		            	       ,statusCode: res.status
                           			   ,duration: req.headers['startTime']
                           			   ,request: req}
                           ,callback: function(){logger.info('log published');}});
        }
    });
}