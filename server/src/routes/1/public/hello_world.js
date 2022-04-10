const exec = require('../../../useCases/hello_world/index.js')
module.exports = ({ server, router }) => {
  router.get('/helloworld', (request, response) => {
    const hello_world = exec()
    response.status(200).json({ status: 'OK', result: hello_world })
  })
}
