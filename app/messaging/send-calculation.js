const config = require('../config')
const { MessageSender } = require('adp-messaging')
const createMessage = require('./create-message')
const protectiveMonitoringSendEvent = require('../services/protective-monitoring-service')

async function sendCalculation (payment) {
  const message = createMessage(payment)
  const paymentSender = new MessageSender(config.paymentTopicConfig)
  await paymentSender.sendMessage(message)
  await paymentSender.closeConnection()
  await protectiveMonitoringSendEvent(payment.claimId, 'Send calculation message')
  console.info(`Published payment for ${payment.claimId}`)
}

module.exports = sendCalculation
