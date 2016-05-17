# untitled-serverless-handlers

## Objective

We want to build out a simple proof of for the layers of abstraction
needed to accomodate Lambda and API Gateway as one of many deployment targets.

## The challenge

Lambda functions are inherently unaware of the HTTP reqeust/response
cycle and do not directly have acces to objects representing them. The
reason for this is that Lambda functions may be invoked by direct API
calls or in reaction to some events within other AWS infrastructure.

We have to configure API gateway to pass through any informat from the
request that we're interested in. And then our function returns a single
data object to API Gateway, which then must be configured to construct
an appropriate response object from the data returned.

## Handler API Options

There are two general paths we can take for our own handler API:

1.  Mimic something like Express.js where our framework will present
    objects to developer code that mimic requests and responses, masking
    that code from the Lambda API of an event and a callback.

2.  Mimic something like the Lamba API where our framework will present
    objects to developer code that are just an event object and callback
    to be used for returning errors and data. This will abstract the
    handlers away from the request/response cycle and make them really
    "just functions".


