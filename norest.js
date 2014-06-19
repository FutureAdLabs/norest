///<reference path="../typings/tsd.d.ts" />
var log = require("winston");
var util = require("util");
var ZSchema = require("z-schema");
var validator = new ZSchema({
    noExtraKeywords: true,
    noTypeless: true
});

function service(app, path, schema, handler) {
    validator.compileSchema(schema).then(function (compiledSchema) {
        app.get(path, function (req) {
            return validator.validate(req.params, compiledSchema).then(function (report) {
                return req.call(handler).catch(function (error) {
                    if (util.isError(error)) {
                        log.error("While handling HTTP request on %j: %s", path, error.stack);
                        return {
                            status: 500,
                            headers: { "Content-Type": "application/json" },
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
                            headers: { "Content-Type": "application/json" },
                            content: JSON.stringify({
                                error: error,
                                inspect: util.inspect(error)
                            })
                        };
                    }
                });
            }).catch(function (error) {
                return {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                    content: JSON.stringify(error)
                };
            });
        });
    }).catch(function (error) {
        throw new TypeError("Invalid JSON schema provided for path \"" + path + "\": " + error);
    });
}

module.exports = service;
//# sourceMappingURL=norest.js.map
