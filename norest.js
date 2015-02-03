var Q = require("q");
var log = require("winston");
var util = require("util");
var url = require("url");
var getRawBody = require('raw-body');
var ZSchema = require("z-schema");
var validator = new ZSchema({
  noExtraKeywords: true,
  noTypeless: true
});

function request(method, path, handler) {
  return function(req, res) {
    if (req.method === method && req.url.split("?")[0] === path) {
      return Q(handler).then(function(handler) {
        handler(req, res);
      }).then(function() {
        return true;
      });
    } else {
      return Q(false);
    }
  }
}
module.exports.request = request;

function select(fns) {
  var args = Array.prototype.slice.call(arguments, 1);
  if (!fns.length) {
    return Q(false);
  }
  var fn = fns[0];
  return fn.apply(this, args).then(function(s) {
    return s ? s : select.apply(this, [fns.slice(1)].concat(args));
  });
}
module.exports.select = select;

function respond(res, status, value, headers) {
  headers = headers || {};
  if (typeof headers === "string") {
    headers = { "Content-Type": headers };
  }
  if (!headers["Content-Type"]) {
    value = JSON.stringify(value, null, 2) + "\n";
    headers["Content-Type"] = "application/json";
  }
  headers["Content-Length"] = Buffer.byteLength(value, 'utf-8');
  res.writeHead(status, headers);
  res.end(value);
}
module.exports.respond = respond;

function describeError(res, error) {
  respond(res, 500, util.isError(error) ? {
    name: error.name,
    message: error.message,
    description: error.description,
    number: error.number,
    fileName: error.fileName,
    lineNumber: error.lineNumber,
    columnNumber: error.columnNumber,
    stack: error.stack
  } : {
    error: error,
    inspect: util.inspect(error)
  });
  log.error(util.isError(error) ? error.stack : error);
}
module.exports.describeError = describeError;


function parseRequest(req){

  if(req.method === "GET"){
    req.params = url.parse(req.url, true).query;
    return Q(true);
  }
  var deferred = Q.defer();

  getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1mb',
    encoding: 'utf-8'
  }, function (err, data) {
    if (err){
      log.error(util.isError(err) ? err.stack : err);
      req.params = {};
      deferred.resolve(true);
    }
    //I am only parsing if data is a JSON.stringify entity!
    req.params = JSON.parse(data);
    deferred.resolve(true);
  })
  return deferred.promise;
}


function service(schema, handler) {
  return validator.compileSchema(schema).then(function(compiledSchema) {
    return function(req, res) {
      parseRequest(req).then(function(){
        validator.validate(req.params, compiledSchema).then(function(report) {
          Q(handler).then(function(handler) { return Q(handler).call(this, req, res)
                                       .catch(describeError.bind(this, res)); });
        }).catch(function(error) {
          respond(res, 400, error);
        });
      });
    };
  }).catch(function(error) {
    throw new TypeError("Invalid JSON schema: " + error);
  });
}
module.exports.service = service;

function run(services) {
  return function(req, res) {
    select(services, req, res).then(function(r) {
      r || respond(res, 404, "404 not found", "text/plain");
    }).catch(describeError.bind(this, res));
  }
}
module.exports.run = run;
