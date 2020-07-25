const WebSocket = require('ws')

const PORT = process.env.PORT || 8080

function noop () {}

function heartbeat () {
  console.log('pong')
  this.isAlive = true
}

const wss = new WebSocket.Server({ port: PORT })

console.log(`Running on port ${PORT}`)

wss.on('connection', function connection (ws, req) {
  console.log(new Date() + ': New Connection from ' + req.socket.remoteAddress)

  //ws.isAlive = true
  //ws.on('pong', heartbeat)

  const namespace = req.headers['namespace']

  // set a field "namespace" on ws to be its namespace
  if (ws.namespace === undefined) {
    ws.namespace = namespace
    console.log(ws.namespace)
  }

  ws.on('message', function incoming (data) {
    // we ignore requests from connections without a namespace
    console.log('GETTING MESSAGE FROM: ' + ws.namespace)
    console.log(data)
    if (ws.namespace === undefined) {
      console.log('WARNING: got anonymous connection???')
      return
    }

    // when we get a message, search through all our client connections
    console.log('-------START------')
    wss.clients.forEach(function each (client) {
      // if the connection is not us, open, and in our namespace, then broadcast

      if (
        client !== ws &&
        client.readyState === WebSocket.OPEN &&
        client.namespace !== undefined &&
        client.namespace === namespace
      ) {
        console.log('SENDING DATA TO: ' + client.namespace)
        client.send(data)
      } else {
        console.log(client.namespace)
      }
    })
    console.log('-------END------')
  })
})

// const interval = setInterval(function ping () {
//   wss.clients.forEach(function each (ws) {
//     if (ws.isAlive === false) {
//       console.log('terminating bc they didnt ping back in time')
//       return ws.terminate()
//     }

//     ws.isAlive = false
//     ws.ping(noop)
//   })
// }, 60000)

wss.on('close', function close () {
  console.log(new Date() + ': Connection closed')

  //clearInterval(interval)
})
