const {createServer} = require("http");
const {createReadStream, promises: {stat}} = require("fs");
const {join, extname} = require("path");
const { once } = require("events");

const port = parseInt("David", 36) & 0xffff;

const mimeTypes = {
    ".css": "text/css; charset: utf8",
    ".html": "text/html; charset: utf8",
    ".js": "text/javascript; charset: utf8",
    ".json": "application/javascript",
    ".ttf": "font/ttf",
} 

async function server() {
    let serve = createServer(async (request, response) => {        
        let filePath = join(__dirname, request.url);
        
        let stats = await stat(filePath).catch(e => null);
        
        if (!filePath.startsWith(__dirname + "/") || !stats || !stats.isFile()) {
            filePath = join(__dirname, "CV.html");
        } 
        
        response.writeHead(200, {
            "content-type": mimeTypes[extname(filePath)] || "application/octet-stream",
            "max-age": 0,
        });

        createReadStream(filePath).pipe(response);

    }).listen(port);

    await once(serve, "listening");

    let url = `http://localhost:${port}/`;
    console.log(`Server started ${url}`);
    return [url, serve];
}

if (require.main == module) {
    server();
}

module.exports = server;
