const calculationService = require('../services/calculation-service')
const sendCalculation = require('./send-calculation')

async function messageAction (message, paymentSender) {
  try {
    const claim = message.body
    if (claim.claimId === undefined) {
      message.deadletter()
    } else {
      const value = calculationService.calculate(claim)
      await sendCalculation({ claimId: claim.claimId, value }, paymentSender)
      await message.complete()
    }
  } catch (err) {
    console.error('Unable to process message:', err)
    await message.abandon()
  }
}
module.exports = messageAction
