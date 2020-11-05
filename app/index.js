require('./services/app-insights').setup()
const createMessageService = require('./services/message-service')
const healthService = require('./services/health-service')
const config = require('./config/config')

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
