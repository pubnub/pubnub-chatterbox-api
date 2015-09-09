


module.exports = function(app,winston,logger){

	 app.use(function(req, res, next) {

        var logmsg = 'time: %j, from: %s, path: %s';
        logger.info(logmsg, new Date().getTime() / 1000, req.ip, req.path);
        winston.profile(req.ip);
        
        if (next) {
            next();
        }else{
            winston.profile(req.ip);
   	        req.pubnub.publish({channel: 'chatterbox_dev-log'
                           ,message: { ip: req.ip
                                   ,for_user: req.headers['user_id']
                  			           ,timestamp: new Date().getTime() / 1000
          		            	       ,statusCode: res.status
                           			   ,duration: req.headers['startTime']
                           			   ,request: req}
                           ,callback: function(){logger.info('log published');}});
        }
    });
}