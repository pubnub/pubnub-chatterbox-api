

var LocalStrategy  = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var BasicStrategy  = require('passport-http').BasicStrategy;



module.exports = function(passport, models, logger){

 var UserProfile = models.userProfile();

passport.use(new LocalStrategy({passReqToCallback: true},
  function(request,username, password, done) {
    logger.info('inside authenticate');

    UserProfile.findOne({$and : [{"username": username}, { "$elemMatch" : {"organization._id": request.org._id}}]}, function (err, user) {
      if (err) { 
        logger.info("error in local stratagy" + err);
        return done(err); 
      }
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if (!user.password == password){
          return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user);
    });
  }
));


passport.use(new BearerStrategy({passReqToCallback: true},
   function(request,token, done) {
    logger.info('entering middleware apikey validation for key: %s', token);
    
    if(!token){
      var err = "api key is required, your request is missing an api key";
      response.status(505).json({error: err});
    }

    var org = models.organization();
    
    org.findOne({"keys" : { $elemMatch: {"api_key": token}}}, function(err,result){

      if((err) || (!result)){
        var err = "could not find the api key: " + token;
        done(null,err);
      }else{
        logger.info('keyvalidation found active organization: ' + result.name);
        request.org = result;
        done(null,result);        
      }
    });

}));

}
