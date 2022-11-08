const http = require('http');
const fs = require('fs');
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};

var server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHeader(200, { "Content-Type": "text/html" });
        fs.createReadStream('./src/index.html').pipe(res)
    }
    var filesDepences = req.url.match(/\.js|.css/);
    if (filesDepences) {
        var extetion = mimeTypes[filesDepences[0].toString().split('.')[1]];
        res.writeHead(200, { 'Content-Type': extetion });
        fs.createReadStream(__dirname + "/src" + req.url).pipe(res)
    }
})