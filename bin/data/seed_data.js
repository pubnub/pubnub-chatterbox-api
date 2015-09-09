

var chatterbox_org_id = ObjectId();
var acme_corp_id = ObjectId();

db.organizations.remove({});
db.userprofiles.remove({});


var organizations = [

	{"_id": chatterbox_org_id
	,"name":"Chatterbox Org"
	,"is_active":"true"
	,"cname": "pubnub"
	, "keys": [
		{"_id": ObjectId()
		 ,"application":"Chatterbox"
		 ,"contact_email":"fred@pubnub.com"
		 ,"__v":"0"
		,"api_key": "d1cb7b6d-dde4-419c-8fb5-cf11814e52c5"}

	]},

	{"_id": acme_corp_id
	 ,"name":"Acme Corp"
   	 ,"is_active":"true"
   	 ,"cname":"acmecorp"
   	 ,"keys": [
   	 	{"_id": ObjectId()
		 ,"application":"Chatterbox"
		 ,"contact_email":"fred@demo.com"
		 ,"__v":"0" 
		,"api_key": "d1cb7b6d-dde4-419c-8fb5-cf11814e52c6"
	   }
   	 ]}
];


db.organizations.insert(organizations);




var chatterbox_org_users = [{"_id": ObjectId()
			,"organization":{"$ref": "organizations", "$id":chatterbox_org_id, "$db": "chatterbox_dev"} 
			,"organization_id": chatterbox_org_id
			,"firstName": "Frederick"
			,"lastName": "Brock"
			,"email": "fred@pubnub.com"
			,"username":"frederickbrock"
			,"password":"password"
			,"connections":[]
			,"level": "gold"
			,"rooms": []},
			{"_id": ObjectId()
			,"organization" : {"$ref": "organizations", "$id":chatterbox_org_id, "$db": "chatterbox_dev"} 
			,"organization_id": chatterbox_org_id
			,"firstName": "Craig"
			,"lastName": "Conover"
			,"email": "craig@pubnub.com"
			,"username":"cconover"
			,"password":"password"
			,"connections":[]
			,"level": "gold"
			,"rooms": []}]; 


var acme_org_users = [{"_id": ObjectId()
			,"organization" : {"$ref": "organizations", "$id":acme_corp_id} 
			,"organization_id": acme_corp_id
			,"firstName": "Wiley"
			,"lastName": "Coyote"
			,"email": "wcoyote@pubnub.com"
			,"username":"wcoyote"
			,"password":"password"
			,"connections":[]
			,"level": "silver"
			,"rooms": []},
			{"_id": ObjectId()
			,"organization" : {"$ref": "organizations", "$id":acme_corp_id} 
			,"organization_id": acme_corp_id
			,"firstName": "Road"
			,"lastName": "Runner"
			,"email": "rrunner@acme.com"
			,"username":"rrunner"
			,"password":"password"
			,"connections":[]
			,"level": "gold"
			,"rooms": []}]; 



db.userprofiles.insert(chatterbox_org_users);
db.userprofiles.insert(acme_org_users);

