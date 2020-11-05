const createMessage = require('./create-message')

async function sendCalcuation (payment, paymentSender) {
  const message = createMessage(payment)
  await paymentSender.sendMessage(message)
  console.info(`Published payment for ${payment.claimId}`)
}

module.exports = sendCalcuation
