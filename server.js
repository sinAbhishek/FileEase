const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("node:fs/promises");
const app = express();
const port = 4000;
const { opendir } = require("node:fs/promises");

app.use(cors());
app.use(express.json());
let parentpath;

app.get("/file", async (req, res) => {
  const files = [];
  const defaultpath = "C:\\";
  const filepath = parentpath || defaultpath;
  const requestedpath = req.query.path.length
    ? `${filepath}\\${req.query.path}`
    : filepath;
  const isfile = (await fs.stat(requestedpath)).isFile();
  if (!isfile) {
    const dir = await opendir(requestedpath);
    parentpath = dir.path;

    for await (const dirent of dir) {
      files.push(dirent.name);
    }
    res.send(files);
  } else {
    req.pause();
    const range = req.headers.range;
    console.log(range);
    const filehandle = await fs.open(requestedpath, "r");
    const filestat = await fs.stat(requestedpath);

    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : filestat.size - 1;
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${filestat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
    const readstream = filehandle.createReadStream({ start, end });

    res.writeHead(206, headers);

    readstream.pipe(res);
    readstream.on("end", () => {
      console.log("the file was successfully uploaded");
      res.end();
      filehandle.close();
    });
  }
});
app.get("/back", async (req, res) => {
  const files = [];
  parentpath = path.dirname(parentpath);
  const dir = await opendir(parentpath);

  for await (const dirent of dir) {
    files.push(dirent.name);
  }
  res.send(files);
});
app.get("/download", async (req, res) => {
  req.pause();
  const requestedpath = `${parentpath}\\${req.query.path}`;
  const filestat = await fs.stat(requestedpath);
  const filehandle = await fs.open(requestedpath, "r");
  const readstream = filehandle.createReadStream();
  const headers = {
    "Content-Length": filestat.size,
  };
  res.writeHead(200, headers);
  readstream.pipe(res);
  readstream.on("end", () => {
    console.log("the file was successfully uploaded");
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
