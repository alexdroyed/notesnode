require('dotenv').config()
require('./mongo')
const express = require('express')
const cors = require('cors')
const Note = require('./models/Note')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
  response.send('<h1>hola</h1>')
})

app.get('/api/v1/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.post('/api/v1/notes', (request, response) => {
  const note = request.body

  if (!note || !note.content) {
    return (
      response.status(400)
        .json({
          error: 'note.content is missing'
        })
    )
  }

  const newNote = Note({
    content: note.content,
    important: typeof note.important !== 'undefined' ? note.important : false,
    date: new Date().toISOString()
  })

  newNote.save().then(savedNote => {
    response.status(201).json(savedNote)
  })
})

app.get('/api/v1/notes/:id', (request, response, next) => {
  const { id } = request.params

  Note.findById(id)
    .then(note => {
      if (note) {
        return response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(err => {
      console.error(err)
      next(err)
    })
})

app.delete('/api/v1/notes/:id', (request, response, next) => {
  const { id } = request.params

  Note.findOneAndRemove(id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/v1/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => {
      response.json(result)
    })
    .catch(err => next(err))
})

app.use(notFound)

app.use(handleErrors)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
