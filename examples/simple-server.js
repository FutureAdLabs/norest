var norest = require("./norest");
var http = require("http");

var services = [
  norest.request("GET", "/lol", norest.service({
    type: "object", properties: {
      "lol": { type: "string" },
      "wat": { type: "string" }
    }, required: ["lol"]
  }, function(req, res) {
    norest.respond(res, 200, "hai lol", {"Cache-Control": "lol"});
  }))
];

http.createServer(norest.run(services)).listen(1337);
