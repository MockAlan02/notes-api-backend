const mongoose = require('mongoose')
const { username, password } = require('./mongoUser.js')

const connectionString = process.env.NODE_ENV === 'test'
  ? 'mongodb://localhost:27017/notes?retryWrites=true&w=majority'
  : `mongodb+srv://${username}:${password}@cluster0.bnaxagy.mongodb.net/notes?retryWrites=true&w=majority`;

(async () => {
  try {
    await mongoose.connect(connectionString)
    console.log('Conexión a la base de datos establecida')
    // Aquí puedes colocar el resto del código de tu aplicación
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error)
  }
})()
