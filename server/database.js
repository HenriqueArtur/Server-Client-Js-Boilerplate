const { Sequelize } = require('sequelize');
const config_opt = require('./src/database/config/config.js')

let config = null
switch (process.env.NODE_ENV) {
  case "development":
    config = config_opt.development
    break
  case "test":
    config = config_opt.test
    break
  case "production":
    config = config_opt.production
    break
  default:
    config = config_opt.development
    break
}

const sequelize = new Sequelize(config)

module.exports = sequelize