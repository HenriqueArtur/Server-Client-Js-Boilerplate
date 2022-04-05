const helloWorld = require('./hello_world.controller.js')

function exec() {
  return helloWorld()
}

module.exports = exec