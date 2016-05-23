'use strict';

const realAccepts = require('accepts');

var endpointLogic = function(req, res) {
  var echo = req.query.echo || "Say something.";
  res.json({
    echo: echo,
    sourceIp: req.ip,
    accepts: req.accepts(['json', 'text']),
    host: req.get('Host')
  });
}

var buildRequest = function(event, context, cb) {
  var req = {};

  // http://expressjs.com/en/api.html#req
  // Properties
  req.app = null; // Not sure this applies in our context...
  req.baseUrl = event.baseUrl;
  req.body = event.body;
  req.cookies = {}; // TODO : Figure out how to get cookies from AWS Gateway
  req.fresh = true; // TODO : Does this apply in our context?
  req.hostname = event.headers.Host;
  req.ip = event.headers["X-Forwarded-For"].split(", ")[0];
  req.ips = event.headers["X-Forwarded-For"];
  req.method = event.method;
  req.originalUrl = ""; // TODO : Figrure out how to reconstruct this
  req.params = event.params;
  req.path = event.baseUrl; // TODO : This isn't quite right...
  req.protocol = event.headers["X-Forwarded-Proto"];
  req.query = event.query;
  req.route = null; // TODO : Does this apply to us?
  req.secure = req.protocol === 'https';
  req.signedCookies = {}; // TODO : ???
  req.stale = false; // TODO : Does this apply in our context?
  req.subdomains = []; // TODO: Does this apply?
  req.xhr = event.headers["X-Requested-With"] === 'XMLHttpRequest';
  
  var accept = realAccepts(req);
  

  // Methods
  req.accepts = function accepts(types){
    // TODO : Fix me!
    return types;
    //return accept.type(types);
  };

  req.acceptsCharsets = function acceptsCharsets(){
    // TODO : Fix me!
  };

  req.acceptsEncodings = function acceptsEncodings(){
    // TODO : Fix me!
  };

  req.acceptsLanguages = function acceptsLanguages(){
    // TODO : Fix me!
  };

  req.get = function get(field){
    return event.headers[field];
  }

  req.is = function is(type){
    // TODO: Fix me!
  }

  return req;
}

var buildResponse = function(event, context, cb) {
  var res = {
    json: function(payload){ cb(null, payload); }
  };
  return res;
}

module.exports.handler = function(event, context, cb) {
  console.log("event------------------");
  console.log(JSON.stringify(event,null,'\t'));
  var req = buildRequest(event,context,cb);
  console.log("req------------------");
  console.log(JSON.stringify(req,null,'\t'));
  var res = buildResponse(event,context,cb);
  endpointLogic(req, res);
};
