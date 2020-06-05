const calculationService = require('./calculation-service')
async function messageAction (claim, sender) {
  try {
    const value = calculationService.calculate(claim)
    await sender.sendMessage({ claimId: claim.claimId, value })
  } catch (error) {
    console.log('error sending message', error)
  }
}
module.exports = messageAction
