const config = require('../config')
const { MessageSender } = require('ffc-messaging')
const createMessage = require('./create-message')

async function sendCalcuation (payment) {
  const message = createMessage(payment)
  const paymentSender = new MessageSender(config.paymentTopicConfig)
  await paymentSender.sendMessage(message)
  console.info(`Published payment for ${payment.claimId}`)
}

module.exports = sendCalcuation
