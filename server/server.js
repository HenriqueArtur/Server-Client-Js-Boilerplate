require('dotenv').config()
const os      = require('os')
const fs      = require('fs')
const path    = require('path')
const http    = require('http')
const https   = require('https')
const express = require('express')
const consign = require('consign')

function server_app(server) {
  const environment     = process.env.NODE_ENV
  const default_port    = process.env.DEFAULT_PORT
  const redirect_port   = process.env.REDIRECT_PORT
  const localhost_port  = process.env.LOCALHOST_PORT
  const hostname        = os.hostname()

  const redirect_to = (protocol = 'https') => function (request, response) {
    response.writeHead(301, { "Location": protocol + "://" + request.headers['host'] + request.url })
    response.end()
  }

  server_private_routes(server)
  server_public_routes(server)
  server_not_found_routes(server)

  let dev_server   = null
  let http_server  = null
  let https_server = null

  switch (environment) {
    case 'development':
      dev_server = http.createServer(server)
      server.set('server', dev_server)
      dev_server.listen(localhost_port, 'localhost', startLog('http', 'localhost', localhost_port, environment))
      break
    
    case 'production':
      const dns_file_root = '/etc/letsencrypt/live'
      const live_list     = fs.readdirSync(dns_file_root)
      const dns_path      = live_list.filter(f => f.includes(hostname))
      const private_key   = fs.readFileSync(`${dns_file_root}/${dns_path}/privkey.pem`, 'utf8')
      const certificate   = fs.readFileSync(`${dns_file_root}/${dns_path}/cert.pem`, 'utf8')
      const chain         = fs.readFileSync(`${dns_file_root}/${dns_path}/chain.pem`, 'utf8')
      const credentials   = {
        key: private_key,
        cert: certificate,
        ca: chain
      }
      
      http_server  = http.createServer(redirect_to('https'))
      https_server = https.createServer(credentials, server)
      server.set('server', https_server)
      http_server.listen(redirect_port)
      https_server.listen(default_port, startLog('https', hostname, default_port, environment))
      break
    
    case 'test': throw new Error('Test environment is not implemented')
    
    default: throw new Error('Environment is not defined')
  }
}

module.exports = server_app

const startLog = (protocol, hostname, port, environment) => {
  const logo = `
 _____           _         _   
|  _  |___ ___  |_|___ ___| |_ 
|   __|  _| . | | | -_|  _|  _|
|__|  |_| |___|_| |___|___|_|  
              |___|            
                                                
powered by Company Name

● ${protocol}://${hostname}:${port}
✓ ${environment} mode`
  return console.log(logo)
}

function server_private_routes(server) {
  const router_versions = path.join(__dirname, '/src/routes/private')
  for (const version of fs.readdirSync(router_versions)) {
    const router = express.Router()
    consign({ verbose: false })
      .then(`/src/routes/private/${version}`)
      .into({ server, router, version })
    server.use(`/api/v${version}`, router)
  }
}

function server_public_routes(server) {
  const router_versions = path.join(__dirname, '/src/routes/public')
  for (const version of fs.readdirSync(router_versions)) {
    const router = express.Router()
    consign({ verbose: false })
      .then(`/src/routes/public/${version}`)
      .into({ server, router, version })
    server.use(`/api/v${version}/public`, router)
  }
}

function server_not_found_routes(server) {
  const response_object = {
    status: 'Not Found',
    error: 'Service not found or not exists.' 
  }
  server.all('*', (request, response) => response.status(404).json(response_object))
}