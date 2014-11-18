var norest = require("../norest");
var http = require("http");


var services = [
  norest.request("GET", "/lol", norest.service({
    type: "object",
    properties: {
      lol: { type: "string" }
    },
    required: ["lol"]
  }, function(req, res) {
    return norest.respond(res, 201, "ok");
  })),
  norest.request("POST", "/lol", norest.service({
    type: "array",
    properties: {
      when: { type: "string" },
      type: { type: "string" },
      url: { type: "string" },
      id_campaign: {type: "number"}
    },
    required: ["lol"]
  }, function(req, res) {
    return norest.respond(res, 201, "ok");
  })),
  norest.request("GET", "/crash", function(req, res) {
    throw new Error("oh noes");
  })
];

http.createServer(norest.run(services)).listen(8888);