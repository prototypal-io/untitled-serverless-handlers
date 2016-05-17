'use strict';

var endpointLogic = function(req, res) {
  var echo = req.params.echo || "Say something.";
  res.json({
    echo: echo,
    sourceIp: req.ip
  });
}

module.exports.handler = function(event, context, cb) {
  var req = event;
  var res = {
    json: function(payload){ cb(null, payload); }
  };
  endpointLogic(req, res);
};
