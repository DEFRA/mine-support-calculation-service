const calculationService = require('./calculation-service')
const { sendMessage } = require('./messaging/message-sender')
const config = require('../config')

const messageAction = async message => {
  console.log('received message')
  const claim = JSON.parse(message.Body)
  const value = calculationService.calculate(claim)

  console.log('sending a message')
  sendMessage({
    queueUrl: config.paymentQueueConfig.queueUrl,
    region: config.paymentQueueConfig.region,
    messageBody: JSON.stringify({ claimId: claim.claimId, value }),
    accessKeyId: config.paymentQueueConfig.credentials.accessKeyId,
    secretAccessKey: config.secretAccessKey.credentials.secretAccessKey
  })
}

module.exports = { messageAction }
