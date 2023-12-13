const express = require("express");
const spdy = require("spdy");
const fs = require("fs");
const os = require("os");
const osUtils = require('node-os-utils');
const cors = require("cors");

const app = express();
app.use(cors());

let counter = 0;
const subscribers = [];
const logFilePath = "./server_resource_usage.log";

async function logServerResourceUsage() {
  const timestamp = new Date().toISOString();
  const cpuUsage = await osUtils.cpu.usage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  const logMessage = `${timestamp} - Connection: ${subscribers.length}\tCPU Usage: ${cpuUsage}%\t - Total Memory: ${totalMemory} bytes\t - Free Memory: ${freeMemory} bytes\n`;

  // 로그를 파일에 기록
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

const headers = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Connection": "keep-alive",
  "Cache-Control": "no-cache",
};

app.get("/subscribe", (req, res) => {
  console.log("request received");
  console.log(req.headers);
  res.writeHead(200, headers);
  res.counter = req.query.seq || 0;
  subscribers.push(res);
  res.on("error", (err) => {
    console.log("err: " + err);
  });
  res.on("close", () => {
    console.log("connection closed");
    subscribers.splice(subscribers.indexOf(res), 1);
    console.log(subscribers.length);
  });

  console.log(subscribers.length);
});

setInterval(async () => {
  counter++;
  logServerResourceUsage();
  subscribers.forEach((res) => {
    res.counter++;
    res.write("event: notification\n");
    res.write(
      `data: ${JSON.stringify({
        text: res.counter,
        date: new Date().toISOString(),
      })}`
    );
    res.write("\n\n");
  });
}, 2000);

// app.listen(4000, () => {
//   console.log("http://localhost:4000 listening...");
// });

const server = spdy.createServer({
  key: fs.readFileSync("./server.key"),
  cert: fs.readFileSync("./server.crt")
}, app);

server.listen(4000, () => {
  console.log("https://localhost:4000 listening...");
});