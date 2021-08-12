//dependencies 
const http = require("http")
const stringDecoder = require("string_decoder").StringDecoder;
const url = require("url")
const handler = require("./lib/handlers")
const helpers = require("./lib/helpers")





removeSlashes = (ch) =>{
    return ch.replace(/\//g,"");
}

//init the server 
const server = http.createServer((req,res)=>{
   var Url = req.url;
   var parsedUrl = new URL(Url,"http://example.com/");
   var pathName = removeSlashes(parsedUrl.pathname);
   var headers = req.headers;
   var queries = url.parse(req.url,true).query;
   var method = req.method.toUpperCase();

 buffer = '';
 var decoder = new stringDecoder('utf-8')
 req.on('data',(data)=>{
     buffer += data;
 })
 req.on("end",()=>{
    buffer += decoder.end();
    var chosenHander = typeof(router[pathName])!='undefined' ? router[pathName] : handler.error;
    data = {
        "parsedUrl" : pathName,
        "headers" : headers,
        "queries" : queries,
        "method" : method,
        "payload" : helpers.parseJsonToObject(buffer),
    };
    chosenHander(data,(statusCode,payload)=>{
        var statusCode = typeof(statusCode)=='number' ? statusCode : 200;
        var payload = typeof(payload)=='object' ? payload : {};
        var stringObject = JSON.stringify(payload)
        res.setHeader('Content-Type','application/json');
        res.writeHead(statusCode);
        res.end(stringObject);
    });
 });
});







var router = {
    "ping" : handler.test,
    "users" : handler.users,
    "tokens" : handler.tokens,
    "checks" : handler.checks
};
server.listen(3000,()=>{
    console.log("Listenning on port 3000")
});