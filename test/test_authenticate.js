
var chai = require('chai'),
    mocha = require('mocha'),
    request = require('request'),
    minimist = require('minimalist');

var assert = chai.assert;
var org = 'cbox'

describe('auth a user for chatterbox api access calls', function() {

  var config = {

    'development': {
      'api':{
        host: 'localhost'
        ,port: 5000
        ,org: 'cbox'
      }
    }
  };

  var environment = config[process.env.NODE_ENV];
  var baseURL = 'http://' + environment.api.host + ":" + environment.api.port + "/chatterbox/api/v1"; 

  before(function(){
      
  })

  it('should return an error when you auth a user that does not exists',function(done) {
      
      var test_uri = baseURL + "/" + environment.api.org + "/authenticate";
      var options = {
        url: test_uri
        ,method: 'POST',
        body: {
          username: 'donald',
          password: 'password'
        },
        json: true
      };

      request(options, function(err, response, body) {

        console.log('this is the body');
        console.log(body);


        assert.isTrue(response.statusCode != 200, "statusCode should have been set but was not");
        assert.isTrue((body != null), "body was null when it shouldn't be" );
        assert.isTrue((body.error != null), "body should contain a property called 'error'");
        done();
      });
    });

  it('should return a valid profile with good credentials', function(done) {
    var test_uri = baseURL + "/" + environment.api.org + "/authenticate";
    var options = {
      url: test_uri
      ,method: 'POST',
      body: {
        username: 'frederickbrock',
        password: 'password'
      },
      json: true
    };

    request(options, function(err, response, body) {
      assert.isTrue((err === null), 'there was an error reported');
      assert.isTrue((response.statusCode != 404), 'this should return a 404');
      assert.isTrue(body.username === 'frederickbrock','body should be a profile, but did not have field username');  
      done();

    });
  });
});