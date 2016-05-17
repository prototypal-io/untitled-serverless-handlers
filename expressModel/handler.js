'use strict';

var endpointLogic = function(req, res) {
  var echo = req.params.echo || "Say something.";
  res.json({
    echo: echo,
    sourceIp: req.ip
  });
}

module.exports.handler = function(event, context, cb) {
  return cb(null, {
    message: 'Go Serverless! Your Lambda function executed successfully!'
  });
};
