const messageService = require('./server/services/message-service')
const healthService = require('./server/services/health-service')
const config = require('./server/config/config')

async function startService () {
  messageService.registerService()
  setInterval(healthService, config.healthzFileInterval)
}

startService()
