import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

import { ObjectId } from 'mongodb'

export const userService = {
	query,
	getById,
	getByUsername,
	remove,
	update,
	add,
}

async function query(filterBy = {}) {
	const criteria = _buildCriteria(filterBy)
	try {
		const collection = await dbService.getCollection('user')
		var users = await collection.find(criteria).sort({ nickname: -1 }).toArray()
		users = users.map(user => {
			delete user.password
			user.isHappy = true
			user.createdAt = user._id.getTimestamp()
			return user
		})
		return users
	} catch (err) {
		logger.error('cannot find users', err)
		throw err
	}
}

async function getById(userId) {
	try {
		const collection = await dbService.getCollection('user')
		const user = await collection.findOne({ _id: ObjectId.createFromHexString(userId) })
		delete user.password
		return user
	} catch (err) {
		logger.error(`while finding user ${userId}`, err)
		throw err
	}
}
async function getByUsername(username) {
	try {
		const collection = await dbService.getCollection('user')
		const user = await collection.findOne({ username })
		return user
	} catch (err) {
		logger.error(`while finding user ${username}`, err)
		throw err
	}
}

async function remove(userId) {
	try {
		const collection = await dbService.getCollection('user')
		await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) })
	} catch (err) {
		logger.error(`cannot remove user ${userId}`, err)
		throw err
	}
}

async function update(user) {
	try {
		// peek only updatable fields!
		const userToSave = {
			_id: ObjectId.createFromHexString(user._id),
			username: user.username,
			fullname: user.fullname,
			balance: user.balance,
		}
		const collection = await dbService.getCollection('user')
		await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
		return userToSave
	} catch (err) {
		logger.error(`cannot update user ${user._id}`, err)
		throw err
	}
}

async function add(user) {
	try {
		const existUser = await getByUsername(user.username)
		if (existUser) throw new Error('Username taken')

		const userToAdd = {
			username: user.username,
			password: user.password,
			fullname: user.fullname,
			isAdmin: user.isAdmin,
			balance: user.balance || 1000,
		}
		const collection = await dbService.getCollection('user')
		await collection.insertOne(userToAdd)
		return userToAdd
	} catch (err) {
		logger.error('cannot insert user', err)
		throw err
	}
}

function _buildCriteria(filterBy) {
	const criteria = {}
    
	if (filterBy.txt) {
		const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
		criteria.$or = [
			{
				username: txtCriteria,
			},
			{
				fullname: txtCriteria,
			},
		]
	}
	if (filterBy.minBalance) {
		criteria.balance = { $gte: filterBy.minBalance }
	}
	return criteria
}


// function checkLogin({ username, password }) {
//     // You might want to remove the password validation for dev
//     var user = users.find(user => user.username === username && user.password === password)

//     if (user) {
//         user = {
//             _id: user._id,
//             fullname: user.fullname,
//             isAdmin: user.isAdmin,
//             balance: user.balance
//         }
//     }
//     return Promise.resolve(user)
// }

// function getLoginToken(user) {
//     const str = JSON.stringify(user)
//     const encryptedStr = cryptr.encrypt(str)
//     return encryptedStr
// }

// function validateToken(token) {
//     if (!token) return null

//     const str = cryptr.decrypt(token)
//     const user = JSON.parse(str)
//     return user
// }