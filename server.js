const {createServer} = require("http");
const {createReadStream, promises: {stat}} = require("fs");
const {join, extname} = require("path");
const { once } = require("events");

const defaultPort = parseInt("David", 36) & 0xffff;

const mimeTypes = {
    ".css": "text/css; charset: utf8",
    ".html": "text/html; charset: utf8",
    ".js": "text/javascript; charset: utf8",
    ".json": "application/javascript",
    ".ttf": "font/ttf",
}

async function server(port = defaultPort) {
    let serve = createServer(async (request, response) => {
        let url = request.url == "/" ? "CV.html" : request.url;
        let filePath = join(__dirname, "src", url);

        let stats = await stat(filePath).catch(e => null);

        if (stats) {
            response.writeHead(200, {
                "content-type": mimeTypes[extname(filePath)] || "application/octet-stream",
                "max-age": 0,
            });

            createReadStream(filePath).pipe(response);
        } else {
            response.writeHead(404, {
                "content-type": "text/plain",
                "max-age": 0,
            });
            response.end("Missing");
        }
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
