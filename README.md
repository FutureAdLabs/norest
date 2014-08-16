NoREST
======

This module provides a minimal framework for defining web service
endpoints on top of the Node `http` module, or anything using
compatible request and response objects. It's designed to be as
composable and technology agnostic as possible. It uses promises to
achieve a level of composability, but it doesn't require your own code
to rely on promises or any other async control mechanism.

## Usage


### Hello World

```js
var norest = require("norest");
var http = require("http");

var services = [
  norest.request("GET", "/", function(req, res) {
    norest.respond(res, 200, "omg hai lol\n", "text/plain");
  });
];

http.createServer(norest.run(services)).listen(1337);
```

### Request Handlers

The standard Node `http` module deals with request handlers that are
functions taking two arguments: a `http.IncomingMessage` object, which
we refer to as the request object, and a `http.ServerResponse` object,
which we refer to as the response object. This function is expected to
handle the request by writing to the response object, and has no
return value.

NoREST maintains this pattern throughout, and whenever this
documentation refers to a "request handler," we are referring to a
function with this signature.

### Request Matching

Define a service path using `norest.request(method, path, handler)`.
It matches an incoming request's method and path using simple
equality: no fancy path argument matching. It will ignore the `?` and
anything following it, but that's it. Consider your paths functions,
and the standard URL parameters their arguments.

The `norest.request` function returns a promise for a request handler.
This handler will examine the request, and if it determines a match,
it invokes your provided request handler function (the one you passed
in as the `handler` argument).

The `handler` argument should be either a request handler, or a
promise for one.

### Creating a Request Handler

The function `norest.select(endpoints, ...)` takes an array of
handlers (or promises thereof) as returned by `norest.request` and
goes through them one by one in order until a match is found. It
returns a promise that will yield a boolean value: true if the request
was handled, false if there was no match and you should probably
respond with a 404.

`norest.select` will pass any additional arguments through to the
handlers being processed, which means that normally you should be
calling `norest.select(handlers, request, response)`, but if you're
using custom handlers that take different arguments, this function is
generalised and works on any list of promises for functions that
return promises for boolean values where `true` means stop processing
and `false` means keep going.

There's a convenience function `norest.run(endpoints)` which wraps
`norest.select`, responds with a 404 when necessary (or a 500 if a
handler crashes), and bundles all this up into a function for you.
This function is a request handler, which will handle all your
services in one go, and its common use case is as the argument for
`http.createServer`.

If you want to handle your own errors and 404s, use `norest.select`
directly. It returns a standard Promises/A compliant promise, on which
you can call `.then()` to await a result, and `.catch()` to handle
errors. There's a function `norest.describeError(response, error)` you
can use to generate a standard error response, which `norest.run` also
uses.

### Responding to Requests

NoREST provides a function `norest.respond(response, status, value,
headers)` which will generate a response automatically. The `response`
argument should be the response object you are handling. `status` is
the HTTP status code you want to respond with. `value` is the body of
the response. Finally, `headers` can be either a JS object containing
the HTTP headers you want to set in your response, or, if all you want
to do is set the `Content-Type` header, a string containing the
appropriate MIME type.

If you don't provide a `Content-Type` header, `norest.respond` will
run the contents of the `value` argument through `JSON.stringify`
before writing it to the response, and set the `Content-Type` header
to be `application/json`. If you provide your own `Content-Type` (even
if it's `application/json`) the `value` will be passed through to
`response.end` untouched.

### Argument Parsing

The `norest.service(schema, handler)` function wraps a request handler
with URL argument parsing, validation using a
[JSON schema](http://json-schema.org/examples.html), as well as an
error handler (identical to the one provided by `norest.run` at the
top level) in case your wrapped request handler crashes. It returns a
promise for a standard request handler.

The request's URL arguments will be parsed and added to the request
objects as `request.params`. It will then be validated with the JSON
schema you've provided, and if validation fails, a 400 response will
be returned and your wrapped handler will not be invoked. If
validation succeeds, your handler is invoked as expected, with the
request object enriched with the `params` key containing your
validated arguments.

### Full Example

```js
var norest = require("norest");
var http = require("http");

var services = [
  norest.request("GET", "/processLols", norest.service({
    type: "object", properties: {
      "lol": { type: "string" }
    }, required: ["lol"]
  }, function(req, res) {
    norest.respond(res, 200, "lol " + req.params.lol + "\n", "text/plain");
  });
];

http.createServer(function(req, res) {
  norest.select(services, req, res).then(function(result) {
    if (!result) {
      norest.respond(res, 404, "not found", "text/plain");
    }
  }).catch(function(error) {
    norest.describeError(res, error);
  });
}).listen(1337);
```

# License

Copyright 2014 Future Ad Labs Ltd

Licensed under the Apache License, Version 2.0 (the "License"); you
may not use this file except in compliance with the License. You may
obtain a copy of the License at
[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing
permissions and limitations under the License.
