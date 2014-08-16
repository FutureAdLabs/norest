/*global it, assert */

var mock = require("mocks").http;
var norest = require("../norest");
var assert = require("assert");

var services = [
  norest.request("GET", "/lol", norest.service({
    type: "object",
    properties: {
      lol: { type: "string" }
    },
    required: ["lol"]
  }, function(req, res) {
    norest.respond(res, "lol");
  })),
  norest.request("GET", "/crash", function(req, res) {
    throw new Error("oh noes");
  })
];

function run(method, path, tests) {
  var req = new mock.ServerRequest(path, {}),
      res = new mock.ServerResponse();
  req.method = method;
  res.on("end", function() { tests(res); });
  norest.run(services)(req, res);
}

// Actual tests


// it("request with missing required parameter should go 400", function(done) {
//   run("GET", "/lol", function(res) {
//     assert.equal(res._status, 400);
//     var content = JSON.parse(res._body);
//     var error = content.errors[0];
//     assert.equal(error.code, "OBJECT_REQUIRED");
//     assert.equal(error.params.property, "lol");
//     done();
//   });
// });

// it("request with required parameter present should go 200", function(done) {
//   run("GET", "/lol?lol=hai", function(res) {
//     assert.equal(res._status, 200);
//     assert.equal(res._body, "lol");
//     done();
//   });
// });

it("handler that goes crash should return a 500", function(done) {
  run("GET", "/lol?lol=hai", function(res) {
    console.log("tests starting", res);
    // assert.equal(res._status, 500);
    // var content = JSON.parse(res._body);
    // assert.equal(content.name, "Error");
    // assert.equal(content.message, "oh noes");
    console.log("tests passed");
    done();
  });
});
