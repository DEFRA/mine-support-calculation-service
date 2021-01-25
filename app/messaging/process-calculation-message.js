const calculationService = require('../services/calculation-service')
const sendCalculation = require('./send-calculation')

async function messageAction (message, calculationReceiver) {
  try {
    const claim = message.body
    if (claim.claimId === undefined) {
      calculationReceiver.deadLetterMessage(message)
    } else {
      const value = calculationService.calculate(claim)
      await sendCalculation({ claimId: claim.claimId, value })
      await calculationReceiver.completeMessage(message)
    }
  } catch (err) {
    console.error('Unable to process message:', err)
    await calculationReceiver.abandonMessage(message)
  }
}
module.exports = messageAction
