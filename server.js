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
  const defaultpath = "C:\\Users\\escap\\Downloads";
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

    const filehandle = await fs.open(requestedpath, "r");
    const filestat = await fs.stat(requestedpath);
    const readstream = filehandle.createReadStream();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", filestat.size);
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
app.post("/download", async (req, res) => {
  req.pause();
  const filePath = path.join("C:\\Users\\escap\\Downloads\\walle", "walle.mkv");
  const basename = path.basename(filePath);
  console.log(basename);
  const filehandle = await fs.open(filePath, "r");
  const readstream = filehandle.createReadStream();

  readstream.pipe(res);
  // req.resume();
  readstream.on("end", () => {
    console.log("the file was successfully uploaded");
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
