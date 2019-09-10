const messageService = require('./server/services/message-service')
const healthService = require('./server/services/health-service')

async function startService () {
  await messageService.registerQueues()
  setInterval(healthService, 10000)
}

startService()
