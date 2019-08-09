const MessageSender = require('./messaging/message-sender')
const MessageReceiver = require('./messaging/message-receiver')
const messageAction = require('./message-action')
const config = require('../config')

const messageSender = new MessageSender('payment-service-sender', config.paymentQueueConfig)
const messageReceiver = new MessageReceiver('payment-service-reciever', config.calculationQueueConfig)

async function registerQueues () {
  await openConnections()
  await messageReceiver.setupReceiver((message) => messageAction(message, messageSender))
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
