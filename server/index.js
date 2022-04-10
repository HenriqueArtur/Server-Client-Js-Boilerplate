const express     = require('express')
const helmet      = require('helmet')
const cors        = require('cors')
const server_app  = require('./server')
const sequelize   = require('./database.js')

const app = express()
app.use(helmet())
app.use(cors())

app.use((request, response, next) => {
  response.setHeader('X-Powered-By', 'Company Name')
  next()
})

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  })

server_app(app)
