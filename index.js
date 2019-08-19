const messageService = require('./server/services/message-service')

async function startService () {
  await messageService.registerQueues()
}

startService()
