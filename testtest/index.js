const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(port, () => console.log(`app listening on port ${port}!!`));

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});

io.on("connection", (socket) => {
  socket.on("new join room", (preJoinRoom, newJoinRoom, name) => {
    socket.name = name;

    socket.join(newJoinRoom);
    socket.room = newJoinRoom;
  });
});
