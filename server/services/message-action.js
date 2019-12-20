const calculationService = require('./calculation-service')
const messageAction = async (claim, sender) => {
  try {
    const value = calculationService.calculate(claim)
    await sender.sendMessage({ claimId: claim.claimId, value })
  } catch (error) {
    console.log('error sending message', error)
  }
}
const sqsMessageAction = (message) => {
  console.log('sqs message received')
  console.log(message)
}
module.exports = { messageAction, sqsMessageAction }
