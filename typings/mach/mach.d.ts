/// <reference path="../node/node.d.ts"/>
/// <reference path="../when/when.d.ts"/>

declare module "mach" {
  import http = require("http");
  import when = require("when");

  export var version: string;
  export var defaultPort: number;

  export interface MachApp<A> {
    (request: Request): A;
  }

  export interface Request extends NodeEventEmitter {
    protocolVersion: string;
    method: string;
    remoteHost: string;
    remotePort: number;
    serverName: string;
    serverPort: number;
    pathInfo: string;
    queryString: string;
    scriptName: string;
    date: Date;
    headers: any;
    content: http.ServerRequest;
    error: WritableStream;

    protocol: string;
    isSsl: boolean;
    isXhr: boolean;
    hostWithPort: string;
    host: string;
    port: number;
    baseUrl: string;
    path: string;
    fullPath: string;
    url: string;
    query: any;
    cookies: any;
    contentType: string;
    mediaType: string;
    multipartBoundary: string;
    isForm: boolean;
    canParseContent: boolean;

    apply: <A>(app: MachApp<A>, ...args: any[]) => A;
    call: <A>(app: MachApp<A>) => A;
    accepts: (mediaType: string) => boolean;
    acceptsCharset: (charset: string) => boolean;
    acceptsEncoding: (encoding: string) => boolean;
    acceptsLanguage: (language: string) => boolean;
    parseContent: (maxLength?: number, uploadPrefix?: string) => when.Promise<any>;
    handlePart: (part: any, uploadPrefix: string) => any;
    getParams: (maxLength?: number, uploadPrefix?: string) => when.Promise<any>;
    filterParams: (filterMap: any, maxLength?: number, uploadPrefix?: string) => when.Promise<any>;
  }

  export interface Response {
    status: number;
    headers: any;
    content: any;
  }

  export interface RequestHandler {
    (request: http.ServerRequest, response: http.ServerResponse): void;
  }

  export interface ServeOptions {
    host?: string;
    port?: number;
    socket?: string;
    quiet?: boolean;
    timeout?: number;
    key?: string;
    cert?: string;
  }

  export function bind<A>(app: MachApp<A>, nodeServer): RequestHandler;
  export function serve<A>(app: MachApp<A>, options?: ServeOptions): http.Server;
  export function send(content: any, status: number, headers: any): Response;
  export function text(text: string, status?: number, headers?: any): Response;
  export function html(html: string, status?: number, headers?: any): Response;
  export function json(json: string, status?: number, headers?: any): Response;
  export function redirect(location: string, status?: number, headers?: any): Response;
  export function back(request: Request, defaultLocation?: string): Response;

  export var basicAuth: any;
  // export var catch: any;
  export var contentType: any;
  export var errors: any;
  export var favicon: any;
  export var file: any;
  export var File: any;
  export var headers: any;
  export var gzip: any;
  export var Gzip: any;
  export var logger: any;
  export var Logger: any;
  export var mapper: any;
  export var Mapper: any;
  export var methodOverride: any;
  export var modified: any;
  export var multipart: any;
  export var params: any;
  export var Request: any;
  export var router: any;
  export var Router: any;
  export var session: any;
  export var stack: any;
  export var Stack: any;
  export var token: any;
  export var urlMap: any;
  export var utils: any;
}
