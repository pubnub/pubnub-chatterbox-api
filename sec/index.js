

var LocalStrategy  = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var BasicStrategy  = require('passport-http').BasicStrategy;


module.exports = function(passport, mongoose){


var adminPassword = "pubnubrocks!";
var adminUserName = "pubnubadmin";


	passport.use(new LocalStrategy(
        function(username, password, done) {
            UserProfile.findOne({
                username: username
            }, function(err, user) {
                if (err) {
                    logger.debug('error in strategy');
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Incorrect username.'
                    });
                }
                if (!user.password != password) {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }
                return done(null, user);
            });
        }
    ));

    passport.use(new BearerStrategy(
        {
        },
        
        function(token, done) {
            ApiKey.findOne({"access_token": token }, function(err,result){
                logger.info('access token found: ' + token);
                done();
            });
        }
    ));

    
    passport.use(new BasicStrategy(
 
  		function(userid, password, done) {
  			console.log('username: ' + userid + ' password: ' + password);
  			if((userid === adminUserName) && (password === adminPassword)){
  				console.log('returning a userprofile');
  				done(null,{
  					username: adminUserName,
  					password: adminPassword
  				});
  			}else{
  				done("wrong username/password",null);
  			}
  		}
  	));
    	
  	

}