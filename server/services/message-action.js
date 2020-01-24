const calculationService = require('./calculation-service')
const { sendMessage } = require('./messaging/message-sender')
const config = require('../config')

const messageAction = async message => {
  const {
    sqsPaymentQueueConfig: {
      url: queueUrl,
      region,
      publishCredentials: {
        accessKeyId,
        secretAccessKey
      }
    }
  } = config
  const claim = JSON.parse(message.Body)
  const value = calculationService.calculate(claim)

  if ([queueUrl, accessKeyId, region, secretAccessKey].every(param => param !== '')) {
    console.log('sending a message')
    sendMessage({
      accessKeyId,
      messageBody: JSON.stringify({ claimId: claim.claimId, value }),
      queueUrl,
      region,
      secretAccessKey
    })
  } else {
    console.log('No SQS message sent as env vars aren\'t set up')
  }
}

module.exports = { messageAction }
