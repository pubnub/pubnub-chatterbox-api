

var Schema = require('mongoose').Schema;

module.exports = function(mongoose){
	

	var UserProfileSchema = new Schema({
		username: {type: String, unique: true, required: true},
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        email: {type: String, required: true},
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
        ,profile_source: String
        ,profile_img_url: String
        ,status: {type: String, required: true}
        ,organization_id: {type: Schema.Types.ObjectId, required: true}
        ,organization: {type: Schema.Types.ObjectId, ref: 'Organization', required: true}
        ,level: {type: String, required: true} //Gold, Silver, Platnium
	});

    var ApiKeySchema = new Schema({
         api_key: String
        ,application: String
        ,contact_email: String
        ,status: String
    });

    var OrganizationSchema = new Schema({
        name: {type: String, required: true, unique: true}
        ,is_active: {type: Boolean, required: true, default: true}
        ,cname: {type: String, required: true, unique: true}
        ,keys: {type: [ApiKeySchema]}
    });


    var RoomSchema = new Schema({
        api_key: String
        ,room_name: String
        ,room_description: String
        ,channel_name: String
        ,is_active: {type: Boolean}
    });



	var UserProfile = mongoose.model('UserProfile', UserProfileSchema);
    var Room = mongoose.model('Room',RoomSchema);
    var Organization = mongoose.model('Organization', OrganizationSchema);



    return {
    	 userProfile: function() { return  UserProfile; }
    	, room: function(){ return Room;}
        , organization: function(){ return Organization;}
    }

}