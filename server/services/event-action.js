const calculationService = require('./calculation-service')
const sendEvent = require('./events/producer')
const { eventConfig } = require('../config')

async function eventAction (claim) {
  try {
    const value = calculationService.calculate(claim)
    await sendEvent(eventConfig.paymentTopic, { claimId: claim.claimId, value })
  } catch (err) {
    console.error('error sending event', err)
  }
}
module.exports = eventAction
