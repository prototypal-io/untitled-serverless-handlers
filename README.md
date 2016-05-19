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



## Getting Started

1. Clone this repo
2. `cd untitled-serverless-handlers`
3. `npm install`
4. `serverless project init` (follow the prompts to initialize the
   project and connect an AWS account)
5. `sls dash deploy` select all functions, events, and endpoints, then
    deploy them.

Once the deployment has completed you should see two URLs similar to:

```
Serverless:   GET - expressModel - https://tsb2awokji.execute-api.us-east-1.amazonaws.com/dev/expressModel  
Serverless:   GET - lambdaModel - https://tsb2awokji.execute-api.us-east-1.amazonaws.com/dev/lambdaModel
```

## The Lambda Model

The `lambdaModel` directory demonstrates the "traditional" Serverless way to program lambda functions.

You can hit this URL to see it in action:

<https://tsb2awokji.execute-api.us-east-1.amazonaws.com/dev/lambdaModel>

Or this one to add an echo param:

<https://tsb2awokji.execute-api.us-east-1.amazonaws.com/dev/lambdaModel?echo=hello>

### API Gateway config

In `lambdaModel/s-function.json` the `requestTemplates` attribute
demonstrates pulling specific data from the API Gateway reqeuest in
order to build the event that will be passed to the Lambda function.

```json
  "requestTemplates": {
    "application/json": {
      "echo": "$input.params('echo')",
      "sourceIp": "$context.identity.sourceIp"
    }
  }
```

Here we're constructing an event that looks like this:

```json
{
    "echo": "hello",
    "sourceIp": "99.90.16.79"
}
```

We're setting the value of the `echo` attribute to be the value for the
`echo` query param, and the `ip` attribute to be the sourceIp as seen by
API Gateway.

In this model the "routing layer" (API Gateway) is responsible for both
executing the correct handler function and for deconstructing the HTTP
request to pass along only the values needed by the handler.

### Lambda function

`lambdaModel/handler.js` shows the basic lambda handler programming
model.

The handler signature is:

```javascript
function(event, context, cb) { ... }
```

The `event` param is the inputs passed along by API Gateway, and
the `cb` param is a callback that the handler should call to pass errors
or data back to the API Gateway.

## The Express.js Model<sup>*</sup>

* Not really Express.js, just a crude approximation for demonstration
  purposes.

`expressModel` demonstrates how we might adapt API Gateway and Lambda to
allow for our handler API to have a more traditional request and
response format.

You can hit this URL to see it in action:

<https://tsb2awokji.execute-api.us-east-1.amazonaws.com/dev/expressModel>

Or this one to add an echo param:

<https://tsb2awokji.execute-api.us-east-1.amazonaws.com/dev/expressModel?echo=hello>


### API Gatway config

Since API Gateway doesn't pass along an entire request object to the
handler we need to reassemble one by pulling absolutely everything that
we can from the API Gateway request.

`expressModel/s-function.json` demonstrates how to pull lots of info
from API Gateway. In order to pull dynamic lists of things from the
request we have to use a velocity template as a single string, which is
ugly, so I'm not including it here. The one in this repo is just for
demonstration and we'll surely need a more robust implementation to
construct a request object that will cover all use cases.

The velocity template generates an event that looks like this:

```json
{
    "body": {},
    "headers": {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, sdch",
        "Accept-Language": "en-US,en;q=0.8",
        "Cache-Control": "max-age=0",
        "CloudFront-Forwarded-Proto": "https",
        "CloudFront-Is-Desktop-Viewer": "true",
        "CloudFront-Is-Mobile-Viewer": "false",
        "CloudFront-Is-SmartTV-Viewer": "false",
        "CloudFront-Is-Tablet-Viewer": "false",
        "CloudFront-Viewer-Country": "US",
        "Host": "tsb2awokji.execute-api.us-east-1.amazonaws.com",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36",
        "Via": "1.1 bacf4777806846760313f3a392450fc4.cloudfront.net (CloudFront)",
        "X-Amz-Cf-Id": "6LwvEUR4bx1ZM963aXfVSSpZkcbUvcMeyLDdH4VEjD3BaaKNZAl2Fw==",
        "X-Forwarded-For": "99.90.16.79, 216.137.42.78",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https"
    },
    "method": "GET",
    "path": {},
    "params": {
        "echo": "hi"
    }
}
```

### Lambda function

In the "Express" model we want our API to involve a request and a
response.

```javascript
endpointLogic = function(req, res) { ... }
```

So, we need to implement a Lambda handler that can take the
`event` and the `callback` and masqurade them to the developer function
as a `request` and `response`.

`expressModel/handler.js` shows a rough implementation of this idea.

The event object passed in from API Gateway is reasonably close to what
we'd expect a `request` object to be in Express.js, so we only need to
do a little manipulation of it to masqurade it as a request (for this
demo).

```javascript
  var req = event;
  req.ip = req.headers["X-Forwarded-For"]
```

To match the Express.js way of returning json we need a `res` object
with a `json` method. When that method is called we can just call the
`cb` that's passed in from Lambda.

```javascript
  var res = {
    json: function(payload){ cb(null, payload); }
  };
```

After massaging the `req` and implementing the `res` we can call the
`endpointLogic` function, passing along our new values.

## Pros/cons of each model

### Lambda model

Pros:
  * Easier to program the Lambda deployment target
  * Handlers are simple functions with inputs and
    outputs, and don't know about HTTP, making them
    easily testable without the need to mock HTTP requests
    and responses

Cons:
  * Exposes details about API Gateway and Lambda
  * Possibly unfamiliar programming model to develoeprs who are used to
    thinking about requests and responses
  * Routing layer has additional responsibility

### Express model

Pros:
  * More familiar programming model for developers who are used to
    reqeuests and responses
  * Masks details about API Gateway and Lambda
  * Routing layer is simpler

Cons:
  * Hanlders are more complex because they deal with HTTP concerns
  * More complicated requirements for Lambda deployment target
