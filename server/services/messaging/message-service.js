const MessageSender = require('./message-sender')
const MessageReceiver = require('./message-receiver')
const calculationService = require('../calculation-service')
const config = require('../../config')

const messageSender = new MessageSender(config.paymentQueueConfig)
const messageReceiver = new MessageReceiver(config.calculationQueueConfig)

async function registerQueues () {
  await openConnections()
  await messageReceiver.setupReceiver(eventAction)
}

async function eventAction (claim) {
  try {
    const value = calculationService.calculate(claim)
    await messageSender.sendMessage({ claimId: claim.claimId, value })
  } catch (error) {
    console.log('error sending message', error)
  }
}

process.on('SIGTERM', async function () {
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
  registerQueues
}
