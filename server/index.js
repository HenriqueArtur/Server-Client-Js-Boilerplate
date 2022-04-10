const express           = require('express')
const server_app        = require('./server')
const sequelize         = require('./database.js')

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  })

const app = express()
server_app(app)
