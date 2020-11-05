const calculationService = require('../calculation-service')
const sendCalculation = require('./send-calculation')

async function messageAction (message, sender) {
  try {
    const claim = message.body
    const value = calculationService.calculate(claim)
    await sendCalculation({ claimId: claim.claimId, value }, sender)
    await message.complete()
  } catch (err) {
    console.error('Unable to process message:', err)
    await message.abandon()
  }
}
module.exports = messageAction
