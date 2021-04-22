const moongose = require('mongoose')
const { server } = require('../index')
const { api, getAllContentFromNotes, initialNotes, createUser } = require('./helpers')
const Note = require('../models/Note')
const User = require('../models/User')

beforeEach(async () => {
  await Note.deleteMany({})
  await User.deleteMany({})

  // tip: and await inside of a forech dont work
  // parallel
  // const notesObjects = initialNotes.map(note => new Note(note))
  // const promises = notesObjects.map(note => note.save())
  // await Promise.all(promises)

  // sequential
  const user = await createUser({ username: 'alexyed', name: 'alexandro' })
  for (const note of initialNotes) {
    const noteObject = new Note({ ...note, user: user._id })
    await noteObject.save()
  }
})

test('notes are returned as json', async () => {
  await api
    .get('/api/v1/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two notes', async () => {
  const response = await api.get('/api/v1/notes')
  expect(response.body).toHaveLength(initialNotes.length)
})

test('the first note is about miduddev', async () => {
  const { contents } = await getAllContentFromNotes()

  expect(contents).toContain('Learning FullStack JS with midudev')
})

describe('a note', () => {
  test('can be getted', async () => {
    const { response } = await getAllContentFromNotes()
    const { body: notes } = response
    const [noteToGet] = notes

    const { body: noteGetted } = await api.get(
      `/api/v1/notes/${noteToGet.id}`
    )

    expect(noteToGet).toEqual(noteGetted)
  })

  test('can be edited', async () => {
    const { response } = await getAllContentFromNotes()
    const { body: notes } = response
    const [noteToEdit] = notes

    const newData = {
      content: 'nueva nota',
      important: true
    }

    const { body: noteEdited } = await api
      .put(`/api/v1/notes/${noteToEdit.id}`)
      .send(newData)

    expect(noteEdited.content).toContain(newData.content)
  })
})

test('a valid note can be added', async () => {
  const user = await User.find({ username: 'alexyed' })
  console.log(user)
  const newNote = {
    content: 'a new note',
    important: true,
    date: new Date(),
    user: user._id
  }

  await api
    .post('/api/v1/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-type', /application\/json/)

  const { contents } = await getAllContentFromNotes()

  expect(contents).toContain(newNote.content)
})

test('note without content is not added', async () => {
  const newNote = {
    important: true
  }

  await api.post('/api/v1/notes').send(newNote).expect(400)

  const { response } = await getAllContentFromNotes()

  expect(response.body).toHaveLength(initialNotes.length)
})

test('note can be deleted', async () => {
  const { response } = await getAllContentFromNotes()
  const { body: notes } = response
  const [noteToDelete] = notes
  await api.delete(`/api/v1/notes/${noteToDelete.id}`).expect(204)

  const { response: secondResponse } = await getAllContentFromNotes()

  expect(secondResponse.body).toHaveLength(initialNotes.length - 1)
})

test('a note that not exist can not be deleted', async () => {
  await api.delete('/api/v1/notes/1234').expect(400)

  const { response } = await getAllContentFromNotes()
  expect(response.body).toHaveLength(initialNotes.length)
})

afterAll(() => {
  moongose.connection.close()
  server.close()
})
