require('./server/services/app-insights').setup()
const createMessageService = require('./server/services/message-service')
const healthService = require('./server/services/health-service')
const config = require('./server/config/config')

let messageService

process.on('SIGTERM', async () => {
  await messageService.closeConnections()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await messageService.closeConnections()
  process.exit(0)
})

module.exports = (async function startService () {
  messageService = await createMessageService()
  setInterval(healthService, config.healthzFileInterval)
}())
