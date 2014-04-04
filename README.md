NoREST
======

This module provides a mechanism for defining web service endpoints on
a Mach server.

## Usage

```js
var service = require("norest");
var mach = require("mach");

var app = mach.app();

// JSON schema used to validate req.params on incoming requests
// see http://json-schema.org/examples.html
var schema = {
  type: "object",
  properties: {
    "lol": { type: "string" },
    "wat": { type: "number" }
  },
  required: ["lol"]
};

service(app, schema, function(req) {
  return { omg: req.params.lol };
});
```

Call `service()` with a path, a
[JSON schema](http://json-schema.org/examples.html) and a handler
function. The schema will be verified before the request is passed on
to the handler function, which will not be called in case the request
parameters fail to validate. The handler function should return a
value or the promise of a value, which will be converted to JSON and
passed as the response.

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
