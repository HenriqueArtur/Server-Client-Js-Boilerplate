const express   = require('express')
const helmet    = require('helmet')
const cors      = require('cors')
const serverApp = require('./server')

const app = express()
app.use(helmet())
app.use(cors())

app.use((request, response, next) => {
  response.setHeader('X-Powered-By', 'Company Name')
  next()
})

serverApp(app)
