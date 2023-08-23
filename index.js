// const http = require("http");
const express = require('express')
const cors = require('cors')
const logger = require('./loggerMiddleware')

const app = express()
app.use(express.json())
app.use(cors())
app.use(logger)

let notes = [
  {
    id: 1,
    content: 'HTML is not easy',
    important: true
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    important: false
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})
app.get('/api/notes', (request, response) => {
  response.json(notes)
})
app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find((item) => item.id === id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})
app.delete('/api/notes/:id', (request, response) => {
  response.header('Access-Control-Allow-Origin', '*')
  const id = Number(request.params.id)
  notes = notes.filter((item) => item.id !== id)
  response.status(204).end()
})
app.options('/api/notes/:id', (request, response) => {
  response.header('Access-Control-Allow-Origin', '*')
  response.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')
  response.send(200)
})
app.post('/api/notes', (request, response) => {
  const note = request.body
  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing...'
    })
  } else {
    const ids = notes.map((item) => item.id)
    const maxId = Math.max(...ids)

    const newNote = {
      id: maxId + 1,
      content: note.content,
      important: typeof note.important !== 'undefined' ? note.important : false,
      Date: new Date().toISOString()
    }
    notes = notes.concat(newNote)
    response.status(201).json(notes)
  }
})
app.use((request, response) => {
  response.status(404).json({
    error: 'Page not found'
  })
})
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
