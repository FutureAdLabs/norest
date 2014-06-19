///<reference path="../typings/tsd.d.ts" />

import mach = require("mach");
import service = require("../src/norest");
import queryString = require("querystring");
import util = require("util");
import assert = require("assert");

var winston = require("winston");
winston.remove(winston.transports.Console);

var utils = mach.utils;

// For convenience in calling apps in tests.
function callApp(app, options, cb) {
  options = options || {};

  // If options is a string it specifies a URL.
  if (typeof options === "string") {
    var parsedUrl = utils.parseUrl(options);
    options = {
      protocol: parsedUrl.protocol,
      serverName: parsedUrl.hostname,
      serverPort: parsedUrl.port,
      pathInfo: parsedUrl.pathname,
      queryString: parsedUrl.query
    };
  }

  // Params may be given as an object.
  if (options.params) {
    var encodedParams = queryString.stringify(options.params);

    if (options.method === "POST" || options.method === "PUT") {
      if (!options.headers) options.headers = {};
      options.headers["Content-Type"] = "application/x-www-form-urlencoded";
      options.content = encodedParams;
    } else {
      options.queryString = encodedParams;
      options.content = "";
    }

    delete options.params;
  }

  var request = new mach.Request(options);

  return request.call(app).then(function (response) {
    return utils.bufferStream(response.content).then((buffer) => {
      response.content = buffer.toString();
      cb(response);
    });
  });
};

function createApp(handler?: (req: any) => any) {
  var app = mach.stack();
  app.use(mach.params);

  service(app, "/lol", {
    type: "object",
    properties: {
      lol: { type: "string" }
    },
    required: ["lol"]
  }, handler || ((req) => {
    return "lol";
  }));

  return app;
}



// Actual tests



it("request with missing required parameter should go 400", (done) => {
  var app = createApp();
  callApp(app, {pathInfo: "/lol"}, (res) => {
    assert.equal(res.status, 400);
    var content = JSON.parse(res.content);
    var error = content.errors[0];
    assert.equal(error.code, "OBJECT_REQUIRED");
    assert.equal(error.params.property, "lol");
    done();
  });
});

it("request with required parameter present should go 200", (done) => {
  var app = createApp();
  callApp(app, {pathInfo: "/lol", params: { "lol": "hai" }}, (res) => {
    assert.equal(res.status, 200);
    assert.equal(res.content, "lol");
    done();
  });
});

it("handler that goes crash should return a 500", (done) => {
  var message = "oh noes";
  var app = createApp((req) => { throw new Error(message); });
  callApp(app, {pathInfo: "/lol", params: { "lol": "hai" }}, (res) => {
    assert.equal(res.status, 500);
    var content = JSON.parse(res.content);
    assert.equal(content.name, "Error");
    assert.equal(content.message, message);
    done();
  });
});
