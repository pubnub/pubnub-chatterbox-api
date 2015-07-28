

var Schema = require('mongoose').Schema;

module.exports = function(mongoose){
	

	var UserProfileSchema = new Schema({
		 username: String,
        firstName: String,
        lastName: String,
        email: String,
        connections: [{
            provider: String,
            provider_profile_id: String
        }],
         authkey: String
        ,profile_img: String
        ,status: String
	});

    var ApiKeySchema = new Schema({
         api_key: String
        ,application: String
        ,contact_email: String
        ,status: String
    });




	var UserProfile = mongoose.model('UserProfile', UserProfileSchema);
    var ApiKey = mongoose.model('ApiKey', ApiKeySchema);
    
    return {
    	 userProfile: function() { return UserProfile; }
    	, apiKey: function() { return ApiKey; }
    }

}