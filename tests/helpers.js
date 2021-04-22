const bcrypt = require('bcrypt')
const { app } = require('../index')
const supertest = require('supertest')
const User = require('../models/User')

const api = supertest(app)

const initialNotes = [
  {
    content: 'Learning FullStack JS with midudev',
    important: true,
    date: new Date()
  },
  {
    content: 'Follow midu on https://midu.tube',
    important: true,
    date: new Date()
  }
]

const getAllContentFromNotes = async () => {
  const response = await api.get('/api/v1/notes')
  return {
    contents: response.body.map(note => note.content),
    response
  }
}

const createUser = async ({ username, name, password = 'pwd', notes = [] }) => {
  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ username, passwordHash, name, notes })
  return await user.save()
}

const getUsers = async () => {
  const userDB = await User.find({})
  return userDB.map(user => user.toJSON())
}

module.exports = {
  api,
  createUser,
  getAllContentFromNotes,
  initialNotes,
  getUsers
}
