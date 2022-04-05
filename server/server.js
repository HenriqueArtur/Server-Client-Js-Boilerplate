require('dotenv').config()
const os      = require('os')
const fs      = require('fs')
const path    = require('path')
const http    = require('http')
const https   = require('https')
const express = require('express')
const consign = require('consign')

function serverApp(server) {
  const environment     = process.env.NODE_ENV
  const defaultPort     = process.env.DEFAULT_PORT
  const redirectPort    = process.env.REDIRECT_PORT
  const localhostPort   = process.env.LOCALHOST_PORT
  const hostname = os.hostname()

  const redirect_to = (protocol = 'https') => function (request, response) {
    response.writeHead(301, { "Location": protocol + "://" + request.headers['host'] + request.url })
    response.end()
  }

  serverRoutes(server)

  let devServer     = null
  let httpServer    = null
  let httpsServer   = null

  switch (environment) {
    case 'development':
      devServer = http.createServer(server)
      server.set('server', devServer)
      devServer.listen(localhostPort, 'localhost', startLog('http', 'localhost', localhostPort, environment))
      break
    
    case 'production':
      const dnsFileRoot = '/etc/letsencrypt/live'
      const liveList    = fs.readdirSync(dnsFileRoot)
      const dnsPath     = liveList.filter(f => f.includes(hostname))
      const privateKey  = fs.readFileSync(`${dnsFileRoot}/${dnsPath}/privkey.pem`, 'utf8')
      const certificate = fs.readFileSync(`${dnsFileRoot}/${dnsPath}/cert.pem`, 'utf8')
      const chain       = fs.readFileSync(`${dnsFileRoot}/${dnsPath}/chain.pem`, 'utf8')
      const credentials = {
        key: privateKey,
        cert: certificate,
        ca: chain
      }
      
      httpServer  = http.createServer(redirect_to('https'))
      httpsServer = https.createServer(credentials, server)
      server.set('server', httpsServer)
      httpServer.listen(redirectPort)
      httpsServer.listen(defaultPort, startLog('https', hostname, defaultPort, environment))
      break
    
    case 'test': throw new Error('Test environment is not implemented')
    
    default: throw new Error('Environment is not defined')
  }
}

module.exports = serverApp

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

function serverRoutes(server) {
  const routerVersions = path.join(__dirname, '/src/routes')
  for (const version of fs.readdirSync(routerVersions)) {
    const router = express.Router()
    consign({ verbose: false })
      .then(`/src/routes/${version}`)
      .into({ server, router, version })
    server.use(`/v${version}`, router)
  }
  server.all('*', (request, response) => response.status(404).json({ status: 'Not Found', error: 'Service not found or not exists.' }))
}
