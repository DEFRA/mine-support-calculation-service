const MessageSender = require('./messaging/message-sender')
const MessageReceiver = require('./messaging/message-receiver')
const messageAction = require('./message-action')
const config = require('../config')

const messageSender = new MessageSender('payment-queue-sender', config.paymentQueueConfig)
const messageReceiver = new MessageReceiver('calculation-queue-receiver', config.calculationQueueConfig)

async function registerQueues () {
  await messageReceiver.setupReceiver(calculation => {
    messageAction(calculation, messageSender)
  })
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

module.exports = {
  closeConnections,
  registerQueues
}
