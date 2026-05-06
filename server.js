const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = path.join(__dirname);

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

http
  .createServer((req, res) => {
    let urlPath = req.url.split("?")[0].replace(/\/+$/, "") || "/";

    const candidates = [
      path.join(ROOT, urlPath),
      path.join(ROOT, urlPath + ".html"),
      path.join(ROOT, urlPath, "index.html"),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, {
          "Content-Type": MIME[ext] || "application/octet-stream",
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    // 404 fallback
    const notFound = path.join(ROOT, "blog/404.html");
    res.writeHead(404, { "Content-Type": "text/html" });
    fs.createReadStream(notFound).pipe(res);
  })
  .listen(PORT, () => console.log(`http://localhost:${PORT}`));
