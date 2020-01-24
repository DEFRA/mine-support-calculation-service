const { messageAction } = require('./message-action')
const MessageConsumer = require('./messaging/message-consumer')
const createQueue = require('./messaging/create-queue')
const config = require('../config')
let consumer

async function registerService () {
  if (config.calculationQueueConfig.createQueue) {
    await createQueue(config.calculationQueueConfig.name, config.calculationQueueConfig)
  }
  if (config.paymentQueueConfig.createQueue) {
    await createQueue(config.paymentQueueConfig.name, config.paymentQueueConfig)
  }
  registerCalculationConsumer()
}

function registerCalculationConsumer () {
  consumer = new MessageConsumer(config.calculationQueueConfig, config.calculationQueueConfig.queueUrl, messageAction)
  consumer.start()
}

process.on('SIGTERM', async function () {
  await closeConnections()
  process.exit(0)
})

process.on('SIGINT', async function () {
  await closeConnections()
  process.exit(0)
})

async function closeConnections () {
  consumer.stop()
}

module.exports = {
  registerService,
  closeConnections
}
