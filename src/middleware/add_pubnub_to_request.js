


module.exports = function(app, pubnub, logger,config){

	app.use(function(request,response,next){
		   if(pubnub){
		   		request.pubnub = pubnub;
		   }else{
		   		logger.info('could not add pubnub reference to request');
		   }
       	   return next();
	});

}