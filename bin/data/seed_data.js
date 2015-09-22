var chatterbox_org_id = ObjectId();
var acme_corp_id = ObjectId();

db.organizations.remove({});
db.userprofiles.remove({});
db.rooms.remove({});
db.securityGroups.remove({});


var organizations = [

  {
    "_id": chatterbox_org_id,
    "name": "Chatterbox Org",
    "is_active": "true",
    "cname": "cbox",
    "keys": [{
        "_id": ObjectId(),
        "application": "Chatterbox",
        "contact_email": "fred@pubnub.com",
        "__v": "0",
        "api_key": "d1cb7b6d-dde4-419c-8fb5-cf11814e52c5"
      }

    ]
  },

  {
    "_id": acme_corp_id,
    "name": "Acme Corp",
    "is_active": "true",
    "cname": "acmecorp",
    "keys": [{
      "_id": ObjectId(),
      "application": "Chatterbox",
      "contact_email": "fred@demo.com",
      "__v": "0",
      "api_key": "d1cb7b6d-dde4-419c-8fb5-cf11814e52c6"
    }]
  }
];


db.organizations.insert(organizations);

var readOnlyUserId = ObjectId();
var adminUserId    = ObjectId();
var publicUser     = ObjectId();


var sec_role_cbox = [{
    "_id": readOnlyUserId
    ,"name": "ReadOnlyUser"
    ,"description": "all users have this group, rooms associated with this group will be accessible to all"
    ,"organization_id": chatterbox_org_id
    ,"permissions": {
      "read": true
      ,"write": false
      ,"manage": false
    }
  }, 
  {
    "_id": adminUserId
    ,"name": "Admin"
    ,"descriptions": "restricted access"
    ,"organization_id": chatterbox_org_id
    ,"permissions": {
      "read": true
      ,"write": true
      ,"manage": true
    }
  }, {
    "_id": publicUser
    ,"name": "PublicUser"
    ,"descriptions": "restricted access"
    ,"organization_id": chatterbox_org_id
    ,"permissions": {
      "read": true
      ,"write": true
      ,"manage": false
    }
  }
];


var publicGroup = ObjectId();

var public_sec_group = [{
    "_id": publicGroup
    ,"name": "Public"
    ,"security_roles": [publicUser]
}];

db.securityGroups.insert(public_sec_group);      

var rooms = [{
  "_id": ObjectId()
  ,"room_name": "Main"
  ,"room_description": "The default main room"
  ,"organization_id": chatterbox_org_id
  ,"channel_name": ObjectId()
  ,"is_active": true
  ,"security_group_id": publicGroup
  ,"use_presence": true
  },
  {
    "_id": ObjectId()
    ,"room_name":"Main Webinar Chat"
    ,"description":"This is the main room of the webinar"
    ,"organization_id": chatterbox_org_id
    ,"channel_name": "webinar-chat"
    ,"is_active": true
    ,"security_group_id": publicGroup
    ,"use_presence": true

  }

]

db.rooms.insert(rooms);


var chatterbox_org_users = [{
  "_id": ObjectId(),
  "organization_id": chatterbox_org_id,
  "firstName": "Frederick",
  "lastName": "Brock",
  "email": "fred@pubnub.com",
  "username": "frederickbrock",
  "password": "password",
  "connections": [],
  "level": "gold",
  "security_group_id": [publicGroup]
}, {
  "_id": ObjectId(),
  "organization_id": chatterbox_org_id,
  "firstName": "Craig",
  "lastName": "Conover",
  "email": "craig@pubnub.com",
  "username": "cconover",
  "password": "password",
  "connections": [],
  "security_group_id":[publicGroup],
  "level": "gold",
  "rooms": []
}];


var acme_org_users = [{
  "_id": ObjectId(),
  "organization_id": acme_corp_id,
  "firstName": "Wiley",
  "lastName": "Coyote",
  "email": "wcoyote@pubnub.com",
  "username": "wcoyote",
  "password": "password",
  "connections": [],
  "level": "silver",
  "security_group_id":[publicGroup]
}, {
  "_id": ObjectId(),
  "organization_id": acme_corp_id,
  "firstName": "Road",
  "lastName": "Runner",
  "email": "rrunner@acme.com",
  "username": "rrunner",
  "password": "password",
  "connections": [],
  "level": "gold",
  "security_group_id":[publicGroup]
}];



db.userprofiles.insert(chatterbox_org_users);
db.userprofiles.insert(acme_org_users);