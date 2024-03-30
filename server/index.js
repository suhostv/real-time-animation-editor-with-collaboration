const { WebSocket, WebSocketServer } = require('ws');
const http = require('http');
const uuid = require('uuid').v4;

// Spinning the http server and the WebSocket server.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});

// I'm maintaining all active connections in this object
const clients = {};
// I'm maintaining all active users in this object
const users = {};
// The current editor content is maintained here.
const editableJsonByUser = {};
// User activity history.
// let userActivity = [];

// Event types
const eventTypes = {
  USER_EVENT: 'userevent',
  CONTENT_CHANGE: 'contentchange',
  ONLINE_STATUS_CHANGE: 'onlinestatuschange'
}

function broadcastMessage(json, userId) {
  // We are sending the current data to all connected clients
  // console.log({editableJsonByUser})
  // console.log({clients, users, editableJsonByUser, editableJsonByUserValues: Object.values(editableJsonByUser)?.layers?.length})
  const data = JSON.stringify(json);
  const liveEditorIds = Object.entries(users).reduce((acc, [key, value]) => (value === users[userId] ? [...acc, key] : acc), []);
  
  for(let userId in clients) {
    let client = clients[userId];
    if(client.readyState === WebSocket.OPEN && liveEditorIds.includes(userId)) {
      console.log('send message')
      client.send(data);
    }
  }
}

function broadcastOnlineChangeMessage(data, userId) {
  const json = JSON.stringify({...data, type: eventTypes.ONLINE_STATUS_CHANGE});
  const liveEditorIds = Object.entries(users).reduce((acc, [key, value]) => (value === users[userId] ? [...acc, key] : acc), []);
  console.log({liveEditorIds})

  if (data.collaboration === false) {
    delete users[userId];
  }
  console.log({col: data.collaboration})
  if (
    (data.collaboration === false && liveEditorIds.length <= 2) ||
    (data.collaboration === true && liveEditorIds.length >= 2)
  ) {
    console.log({json})
    for(let userId in clients) {
      let client = clients[userId];
      if(client.readyState === WebSocket.OPEN && liveEditorIds.includes(userId)) {
        console.log('send online change message', {json})
        client.send(json);
      }
    }
  }
}

function handleMessage(message, userId) {
  const dataFromClient = JSON.parse(message.toString());
  const json = { type: dataFromClient.type };
  if (dataFromClient.type === eventTypes.USER_EVENT) {
    users[userId] = dataFromClient.editableAnimation;
    json.data = { users };
    broadcastOnlineChangeMessage({collaboration: true, sender: "user event"}, userId );
  } else if (dataFromClient.type === eventTypes.CONTENT_CHANGE) {
    if (dataFromClient.initialData && editableJsonByUser[users[userId]]) {
      json.data = editableJsonByUser[users[userId]];
    } else {
      editableJsonByUser[users[userId]] = dataFromClient.content;
      json.data = dataFromClient.content;
    } 
  } else if (dataFromClient.type === eventTypes.ONLINE_STATUS_CHANGE) {
    console.log("online change event")
    broadcastOnlineChangeMessage({collaboration: dataFromClient.collaboration, sender: "online status change event"}, userId);
    return;
  }
  broadcastMessage(json, userId);
}

function handleDisconnect(userId) {
    console.log(`${userId} disconnected.`);
    const json = { type: eventTypes.USER_EVENT };
    console.log("handle disconnect")
    broadcastOnlineChangeMessage({collaboration: false, sender: "disconnect event"}, userId);
    json.data = { users };
    delete editableJsonByUser[users[userId]];
    delete clients[userId];
    delete users[userId];
    broadcastMessage(json);
}

// A new client connection request received
wsServer.on('connection', function(connection) {
  // Generate a unique code for every user
  const userId = uuid();
  console.log('Received a new connection');

  // Store the new connection and handle messages
  clients[userId] = connection;
  console.log(`${userId} connected.`);
  connection.on('message', (message) => handleMessage(message, userId));
  // User disconnected
  connection.on('close', () => handleDisconnect(userId));
});