require('./mongo.js')
require('dotenv').config()
const express = require('express')
const Note = require('./model/Note.js')
const handleErrors = require('./middleware/handleErrors')
const notFound = require('./middleware/notFound')
const cors = require('cors')
const logger = require('./middleware/loggerMiddleware')
const Sentry = require('@sentry/node')

const app = express()

app.use(express.json())
app.use(cors())
app.use(logger)

Sentry.init({
  dsn: 'https://a30605e7f990bca01350c1da712dc578@o4505791948587008.ingest.sentry.io/4505791953567744',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({
      tracing: true
    }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({
      app
    })
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0 // Capture 100% of the transactions, reduce in production!,
})
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})
app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})
app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  Note.findById(id)
    .then((note) => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

app.post('/api/notes', (request, response) => {
  const note = request.body
  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing...'
    })
  } else {
    const newNote = new Note({
      content: note.content,
      important: typeof note.important !== 'undefined' ? note.important : false,
      date: note.date || new Date()
    })
    newNote.save().then((saveData) => {
      response.status(201).json(saveData)
    })
  }
})

app.delete('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params
  await Note.findByIdAndDelete(id)
    .then((note) => {
      response.status(204).send()
    })
    .catch((error) => next(error))
  response.status(204).send()
})

app.put('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params
  const note = request.body
  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing...'
    })
  } else {
    const newNoteInfo = {
      content: note.content,
      important: note.important || true,
      date: note.date || new Date()
    }
    await Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
      .then((result) => {
        response.json({ result })
      })
      .catch((error) => next(error))
  }
})
app.options('/api/notes/:id', (request, response) => {
  response.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')
  response.send(200)
})
app.use(notFound)
app.use(Sentry.Handlers.errorHandler())
app.use(handleErrors)

const PORT = process.env.PORT || 3001
const enviroment = process.env.NODE_ENV
console.log(enviroment)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
