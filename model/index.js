

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
        rooms: [{
            room_id: {type: Schema.Types.ObjectId}
            ,permissions: {
                read: {type: Boolean}
                ,write: {type: Boolean}
                ,manage: {type: Boolean}
            }
        }]
        ,authkey: String
        ,profile_img_url: String
        ,status: String
        ,api_key: String
	});

    var ApiKeySchema = new Schema({
         api_key: String
        ,application: String
        ,contact_email: String
        ,status: String
    });


    var RoomSchema = new Schema({
        api_key: String
        ,room_name: String
        ,room_description: String
        ,channel_name: String
        ,is_active: {type: Boolean}
    });



	var UserProfile = mongoose.model('UserProfile', UserProfileSchema);
    var ApiKey = mongoose.model('ApiKey', ApiKeySchema);
    var Room = mongoose.model('Room',RoomSchema);
    
    return {
    	 userProfile: function() { return mongoose.model('UserProfile'); }
    	, apiKey: function() { return ApiKey; }
        , room: function(){ return Room;}
    }

}