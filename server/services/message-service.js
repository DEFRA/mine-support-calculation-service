const MessageSender = require('./messaging/message-sender')
const MessageReceiver = require('./messaging/message-receiver')
const { messageAction, sqsMessageAction } = require('./message-action')
const config = require('../config')
const { subscribeToQueue, updateCredentials } = require('./aws-messaging/aws-connector')

const messageSender = new MessageSender('payment-queue-sender', config.paymentQueueConfig)
const messageReceiver = new MessageReceiver('calculation-queue-receiver', config.calculationQueueConfig)

const sqsCalculationQueueConfigured = queueConfig => {
  return queueConfig.url !== '' &&
    queueConfig.listenCredentials.accessKeyId !== '' &&
    queueConfig.listenCredentials.secretAccessKey !== ''
}

async function registerQueues () {
  await openConnections()
  await messageReceiver.setupReceiver((message) => messageAction(message, messageSender))
  if (sqsCalculationQueueConfigured(config.sqsCalculationQueueConfig)) {
    updateCredentials(config.sqsCalculationQueueConfig.listenCredentials)
    await subscribeToQueue(config.sqsCalculationQueueConfig.url, sqsMessageAction)
  }
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
  await messageSender.closeConnection()
  await messageReceiver.closeConnection()
}

async function openConnections () {
  await messageSender.openConnection()
  await messageReceiver.openConnection()
}

module.exports = {
  registerQueues,
  closeConnections
}
