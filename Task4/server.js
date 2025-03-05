const WebSocket = require("ws");
const http = require("http");
const uuid = require("uuid");

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

const clients = new Map(); // Все подключенные клиенты
const admins = new Map(); // Все подключенные админы
const clientQueue = []; // Очередь клиентов, ожидающих ответа

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", (ws, request) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const role = url.searchParams.get("role");
  const id = uuid.v4();

  if (role === "admin") {
    handleAdminConnection(ws, id);
  } else {
    handleClientConnection(ws, id);
  }
});

function handleClientConnection(ws, id) {
  clients.set(id, ws);
  clientQueue.push(id);
  updateAdmins();

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log(data);
    handleClientMessage(id, data);
  });

  ws.on("close", () => {
    clients.delete(id);
    const index = clientQueue.indexOf(id);
    if (index > -1) clientQueue.splice(index, 1);
    updateAdmins();
  });
}

function handleAdminConnection(ws, id) {
  admins.set(id, ws);
  updateAdmins();

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    handleAdminMessage(id, data);
  });

  ws.on("close", () => {
    admins.delete(id);
  });
}

function handleClientMessage(clientId, data) {
  const adminId = findAdminForClient(clientId);
  if (adminId && admins.has(adminId)) {
    admins.get(adminId).send(
      JSON.stringify({
        type: "message",
        from: clientId,
        content: data.content,
      })
    );
  }
}

function handleAdminMessage(adminId, data) {
  if (data.type === "accept") {
    const clientId = clientQueue.shift();
    if (clientId) {
      admins.get(adminId).clientId = clientId;
      clients.get(clientId).adminId = adminId;
      clients.get(clientId).send(
        JSON.stringify({
          type: "status",
          connected: true,
        })
      );
    }
    updateAdmins();
  } else if (data.type === "message") {
    if (clients.has(data.to)) {
      clients.get(data.to).send(
        JSON.stringify({
          type: "message",
          content: data.content,
        })
      );
    }
  }
}

function updateAdmins() {
  const status = {
    type: "status",
    queueLength: clientQueue.length,
    clients: clientQueue,
  };

  admins.forEach((admin) => {
    admin.send(JSON.stringify(status));
  });
}

function findAdminForClient(clientId) {
  for (const [adminId, admin] of admins) {
    if (!admin.clientId) return adminId;
  }
  return null;
}

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
