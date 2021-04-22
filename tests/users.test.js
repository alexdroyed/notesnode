const moongose = require('mongoose')
const { server } = require('../index')
const User = require('../models/User')
const { api, getUsers, createUser } = require('./helpers')

describe('at creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    await createUser({ username: 'alex' })
  })

  test('works as expected', async () => {
    const usersAtStart = await getUsers()

    const newUser = {
      username: 'alexo',
      name: 'Alexandro',
      password: 'hacker'
    }

    await api
      .post('/api/v1/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await getUsers()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  })

  test('fails if username is already taken', async () => {
    const usersAtStart = await getUsers()

    const newUser = {
      username: 'alex',
      name: 'alexnadro',
      password: 'test'
    }

    const result = await api
      .post('/api/v1/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(result.body.errors.username.message).toContain('`username` to be unique')

    const userAtEnd = await getUsers()
    expect(userAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  moongose.connection.close()
  server.close()
})
