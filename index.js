require('./server/services/app-insights').setup()
const messageService = require('./server/services/message-service')
const healthService = require('./server/services/health-service')
const config = require('./server/config/config')

async function startService () {
  await messageService.registerQueues()
  setInterval(healthService, config.healthzFileInterval)
}

startService()
