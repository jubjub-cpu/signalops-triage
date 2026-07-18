import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
let root = resolve(fileURLToPath(new URL("..", import.meta.url)));
let port = 4174;

for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--root" && args[index + 1]) {
    root = resolve(args[index + 1]);
    index += 1;
  } else if (args[index] === "--port" && args[index + 1]) {
    port = Number.parseInt(args[index + 1], 10);
    index += 1;
  }
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Port must be a number from 1 to 65535.");
}

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"]
]);

function resolveRequestPath(requestUrl) {
  const parsedUrl = new URL(requestUrl, "http://127.0.0.1");
  const requestedPath = decodeURIComponent(parsedUrl.pathname);
  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
  let filePath = resolve(join(root, relativePath));

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (filePath !== root && !filePath.startsWith(rootPrefix)) {
    return null;
  }

  return filePath;
}

const server = createServer(async (request, response) => {
  try {
    const filePath = resolveRequestPath(request.url ?? "/");
    if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes.get(extname(filePath).toLowerCase()) ?? "application/octet-stream",
      "Content-Length": file.length,
      "Cache-Control": "no-store"
    });
    response.end(file);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}/`);
});
