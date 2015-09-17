# Chatterbox API server

A barebones API to store profiles and perform grants for using accesss manager. This simple API is used for demostration purposes in the access_manager webinar. The server exposes a few rest endpoints that can hit with POSTMAN or from any application environment to authenticate profiles using Basic auth. When a user is authenticated they are authorized based on the rooms they have in their profile. 


=======
### Please direct all Support Questions and Concerns to Support@PubNub.com

Chatterbox API

Install with 

> npm install 

Run

$ git clone git@github.com:pubnub/pubnub-chatterbox-api
$ cd pubnub-chatterbox-api
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```

## Documentation


## Rest Endpoints 

| Entity Endpoint                       |Supported VERBS                | Description
---------------------------------------------------------------------------------------------------------------
| chatterbox/api/v1/admin/organizations | POST, GET, GET:id, PUT,DELETE | CRUD operations for an organization |
---------------------------------------------------------------------------------------------------------------
| chatterbox/api/v1/admin/organization/rooms | POST, GET                | CRUD operation to support room creation|


