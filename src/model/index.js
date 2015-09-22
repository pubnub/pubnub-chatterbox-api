

var Schema = require('mongoose').Schema;

module.exports = function(mongoose){
	
	/**
     * This replaces level
     **/
    var SecurityRoleSchema = new Schema({
         name: {type: String, required: true}
        ,description: {type: String}
        ,organization_id: {type: Schema.Types.ObjectId, required: true}
        ,permissions: {
             read:   {type: Boolean, required: true, default: false}
            ,write:  {type: Boolean, required: true, default: false}
            ,manage: {type: Boolean, required: true, default: false}
        }
    });


    var SecuirtyGroupSchema = new Schema({
        name: {type: String, required: true}
        ,roles: {type: [SecurityRoleSchema]}
    });

    /**
     * UserProfile is a "user". 
     * User profile has a one-to-many relationship with Organization
     **/
    var UserProfileSchema = new Schema({
		username: {type: String, unique: true, required: true}
        ,firstName: {type: String, required: true}
        ,lastName: {type: String, required: true}
        ,email: {type: String, required: true}
        ,connections: [{
            provider: String,
            provider_data: {type: String}
        }]
        ,user_groups: {type: [SecuirtyGroupSchema]}
        ,profile_source: String
        ,profile_img_url: String
        ,status: {type: String, required: true}
        ,organization_id: {type: Schema.Types.ObjectId, required: true}
        ,level: {type: String, required: true} //Gold, Silver, Platnium
    });

    /**
     * a join collection that creates an edge -> users to an organization
     **/
    var OrganizationUserProfileSchema = new Schema({
        profile_id: {type: Schema.Types.ObjectId}
        ,organization_id: {type: Schema.Types.ObjectId}
    });

   
    var ApiKeySchema = new Schema({
        api_key: String
        ,client_id: String
        ,client_secret: String
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
        room_name: {type: String, required: true}
        ,room_description: {type: String, required: false}
        ,channel_base_name: {type: String, required: true}
        ,is_active: {type: Boolean}
        ,user_level: {type: String, required: true}
        ,organization_id: {type: Schema.Types.ObjectId, required: true} //don't know if I need this anymore
    });

     /**
     * a reference to a room, Organization, User, System, UserGroup
     **/
    var RoomReference = new Schema({
        room_id: {type: Schema.Types.ObjectId}
        ,target_id: {type: Schema.Types.ObjectId}
        ,reference_type: {type: String, required: true}
    });


	  var UserProfile      = mongoose.model('UserProfile', UserProfileSchema);
    var Room             = mongoose.model('Room',RoomSchema);
    var Organization     = mongoose.model('Organization', OrganizationSchema);
    var OrganizationProfile = mongoose.model('OrganizationProfile',OrganizationUserProfileSchema);
    var SecuirtyGroup    = mongoose.model('SecurityGroup', SecuirtyGroupSchema);
    
    return {
    	    userProfile:  function() { return  UserProfile; }
    	  , room:         function(){ return Room;}
        , organization: function(){ return Organization;}
        , organizationUsers: function() { return OrganizationProfile; }
        , secuirtyGroup:function() { return SecuirtyGroup; }
    }

}