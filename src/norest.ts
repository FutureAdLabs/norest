declare var require: (module: string) => any;

var log = require("winston");
var util = require("util");
var ZSchema = require("z-schema");
var validator = new ZSchema({
  noExtraKeywords: true,
  noTypeless: true
});

function service(app: any, path: string, schema: any, handler: (req: any) => any) {
  validator.compileSchema(schema).then((compiledSchema) => {
    app.get(path, (req) => {
      return validator.validate(req.params, compiledSchema).then((report) => {
        return req.call(handler).catch((error) => {
          if (util.isError(error)) {
            log.error("While handling HTTP request on %j: %s", path, error.stack);
            return {
              status: 500,
              headers: {"Content-Type": "application/json"},
              content: JSON.stringify({
                name: error.name,
                message: error.message,
                description: error.description,
                number: error.number,
                fileName: error.fileName,
                lineNumber: error.lineNumber,
                columnNumber: error.columnNumber,
                stack: error.stack
              })
            };
          } else {
            log.error("While handling HTTP request on %j: %j", path, error);
            return {
              status: 500,
              headers: {"Content-Type": "application/json"},
              content: JSON.stringify({
                error: error,
                inspect: util.inspect(error)
              })
            };
          }
        });
      }).catch((error) => {
        return {
          status: 400,
          headers: {"Content-Type": "application/json"},
          content: JSON.stringify(error)
        };
      });
    });
  }).catch((error) => {
    throw new TypeError("Invalid JSON schema provided for path \"" +
                        path + "\": " + error);
  });
}

export = service;
