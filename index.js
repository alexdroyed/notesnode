require('dotenv').config()
require('./mongo')
const express = require('express')
const cors = require('cors')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
  response.send('<h1>hola</h1>')
})

app.use('/api/v1/login', loginRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/notes', notesRouter)

app.use(notFound)

app.use(handleErrors)

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = { app, server }
