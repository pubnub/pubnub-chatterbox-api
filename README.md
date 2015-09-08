# Chatterbox API server

A barebones API to store profiles and perform grants for accesss manager. This simple API is used for demostration purposes in the access_manager webinar. 
it exposes a few rest endpoints that can hit with POSTMAN or from any application environment to authenticate profiles using Basic auth

This application supports the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ git clone git@github.com:pubnub/
$ cd pubnub-chatterbox-api
$ npm install
$ npm start
```

Your app should now be running on [localhost:3000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```

## Documentation



