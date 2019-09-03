const messageService = require('./server/services/message-service')
const healthService = require('./server/services/health-service')

async function startService () {
  await healthService.deleteHealthy()
  await messageService.registerQueues()
}

startService()

process.on('SIGTERM', async function () {
  await healthService.deleteHealthy()
  process.exit(0)
})
