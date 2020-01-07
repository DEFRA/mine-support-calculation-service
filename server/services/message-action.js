const calculationService = require('./calculation-service')
const { sendMessage } = require('./sqs-messaging/sqs-send-message')
const config = require('../config')

async function messageAction (claim, sender) {
  try {
    const value = calculationService.calculate(claim)
    await sender.sendMessage({ claimId: claim.claimId, value })
  } catch (error) {
    console.log('error sending message', error)
  }
}
const sqsCalculationMessageAction = async message => {
  const {
    sqsPaymentQueueConfig: {
      url: queueUrl,
      publishCredentials: {
        accessKeyId,
        secretAccessKey
      }
    }
  } = config
  const claim = JSON.parse(message.Body)
  const value = calculationService.calculate(claim)

  if (queueUrl !== '' && accessKeyId !== '' && secretAccessKey !== '') {
    console.log('sending a message')
    sendMessage({
      accessKeyId,
      messageBody: JSON.stringify({ claimId: claim.claimId, value }),
      queueUrl,
      secretAccessKey
    })
  } else {
    console.log('No SQS message sent as env vars aren\'t set up')
  }
}

module.exports = { messageAction, sqsCalculationMessageAction }
