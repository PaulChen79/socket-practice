const chatForm = document.querySelector('#chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.querySelector('#room-name')
const userList = document.querySelector('#users')

// get username & room name for URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

const socket = io()

// get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputUsers(users)
})

// join chatroom
socket.emit('joinRoom', { username, room })

// message from server
socket.on('message', message => {
  console.log(message)
  outputMessage(message)

  // scroll down when message output
  chatMessages.scrollTop = chatMessages.scrollHeight
})

// message submit
chatForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const message = event.target.elements.msg.value

  // emit message to server
  socket.emit('chatMessage', message)

  // clear input value
  event.target.elements.msg.value = ''
  event.target.elements.msg.focus()
})



// output message to DOM

function outputMessage(message) {
  const messageDiv = document.createElement('div')
  messageDiv.classList.add('message')
  messageDiv.innerHTML = `
  <p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">${message.text}</p>
  `
  chatMessages.appendChild(messageDiv)
}

function outputRoomName(room) {
  roomName.innerText = room
}

function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}