// import { trimStr } from './utils'
const { trimStr } = require("./utils")

let users = []

const findUser = (user) => {
	const userName = trimStr(user.name) 
	const userRoom = trimStr(user.room) 

	return users.find(
		(u) => trimStr(u.name) === userName && trimStr(u.room) === userRoom
	)
	
}

const addUser = (user) => {
	const isExist = findUser(user)

	!isExist && users.push(user)

	const currentUser = isExist || user

	return { isExist: !!isExist, user: currentUser }
}	

//  Функция, которая выдает всех пользователей в комнате
const getRoomUsers = (room) => {
	return users.filter((u) => u.room === room)
}

// Функция, которая удаляет пользователя из массива
const removeUser = (user) => {
	const found = findUser(user)

	// Если пользак нашелся. То есть если значение true
	if (found) {
		users = users.filter(({ room, name }) => room === found.room !== found.name)
	}

	return found
}

module.exports = { addUser, findUser, getRoomUsers, removeUser }