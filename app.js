const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/format-message')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const PORT = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatCord bot'

// Run when client connects
io.on('connection', socket => {
  // socket.emit -> 單一client
  // socket.brodcast.emit -> 全部client除了沒有連接的client
  // io.emit -> 所有client

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    socket.emit('message', formatMessage(botName, 'Welcome to chat room'))

    // Broadcast when user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined chat room`))

    // send users and room name
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  })
  
  // listen chatMessage
  socket.on('chatMessage', message => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, message))
  })

  // Runs when client disconnected
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    if(user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left chat room`))

      // send users and room name
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    })
    }
  })
})

server.listen(PORT, () => console.log('App is running'))