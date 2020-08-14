require('./server/services/app-insights').setup()
const createEventConsumer = require('./server/services/events/consumer')
const createEventProducer = require('./server/services/events/producer')
const healthService = require('./server/services/health-service')
const config = require('./server/config/config')
const groupName = 'ffc-demo-calculation-service'
const topicName = 'ffc-demo-claim-valid'

process.on('SIGTERM', async () => {
  // await messageService.closeConnections()
  process.exit(0)
})

process.on('SIGINT', async () => {
  // await messageService.closeConnections()
  process.exit(0)
})

module.exports = (function startService () {
  createEventConsumer(groupName, topicName)
  createEventProducer()
  setInterval(healthService, config.healthzFileInterval)
}())
