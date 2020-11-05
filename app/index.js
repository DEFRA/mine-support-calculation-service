require('./services/app-insights').setup()
const messageService = require('./messaging')
const healthService = require('./services/health-service')
const config = require('./config')

process.on('SIGTERM', async () => {
  await messageService.stop()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await messageService.stop()
  process.exit(0)
})

module.exports = (async function startService () {
  setInterval(healthService, config.healthzFileInterval)
  await messageService.start()
}())
