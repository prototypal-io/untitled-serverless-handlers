'use strict';

module.exports.handler = function(event, context, cb) {
  console.log(JSON.stringify(event,null,'\t'));
  var echo = event.echo || "Say something.";
  return cb(null, {
    echo: echo,
    sourceIp: event.sourceIp
  });
};
