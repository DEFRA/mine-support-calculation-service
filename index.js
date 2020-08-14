require('./server/services/app-insights').setup()
const createEventConsumer = require('./server/services/events/consumer')
const healthService = require('./server/services/health-service')
const eventAction = require('./server/services/event-action')
const config = require('./server/config/config')

process.on('SIGTERM', async () => {
  // await messageService.closeConnections()
  process.exit(0)
})

process.on('SIGINT', async () => {
  // await messageService.closeConnections()
  process.exit(0)
})

module.exports = (function startService () {
  createEventConsumer(config.eventConfig.calculationGroup, config.eventConfig.calculationTopic, eventAction)
  setInterval(healthService, config.healthzFileInterval)
}())
