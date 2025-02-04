const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const { addUser, findUser, getRoomUsers, removeUser } = require('./users')
const route = require('./route')
const app = express()

app.use(cors( { origin: "*" }))
app.use(route)

const server = http.createServer(app)

const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
})

// Из документации по socket.io
io.on('connection', (socket) => {
	socket.on('join', ({ name, room }) => {
		
		socket.join(room)
		
		// С user происходит деструктуризация
		const { user, isExist } = addUser({ name, room })

		const userMessage = isExist
			? `${user.name}, here you go again`
			: `Hey my love ${user.name}`
		// Отправляем сообщения на сокет ио
		socket.emit('message', {
			data: { user: { name: 'Admin' }, message: userMessage },
		})

		// С помощью emit делаем прослушку на client
		socket.broadcast.to(user.room).emit('message', {
			data: { user: { name: 'Admin' }, message: `${user.name} has join` },
		})

		//  Выдача количества участников в комнате
		// получаем массива всех пользаков с их названием комнаты
		// Далее в Chat.jsx это все оформляется через useEffect
		io.to(user.room).emit('joinRoom', {
			 data: { users: getRoomUsers(user.room)}
			})
	})

	// На бэкенде сокет принимают message и параметры
	socket.on('sendMessage', ({ message, params }) => {
		const user = findUser(params)

		// Если пользователь существует
		if (user) {
			io.to(user.room).emit('message', { data: {user, message } })
		}
	})

	// Отправляем на сокет данные о том, что пользователь покинул комнату
	socket.on('leftRoom', ({ params }) => {
		const user = removeUser(params)

		if (user) {
			const { room, name } = user

			io.to(room).emit('message', { data: {user: { name: 'Admin' }, message: `${name} has left` } }

			)}

		// И в итоге нужно пересчитать пользователей
		io.to(user.room).emit('room', {
			data: { users: getRoomUsers(user.room)}
		     })
	})


	io.on('disconnect', () => {
		console.log('Disconnect')
	})
})

server.listen(5000, () => {
	console.log('Server is running')
	
})
