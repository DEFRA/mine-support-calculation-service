const createMessage = require('./create-message')

async function sendCalcuation (payment, paymentSender) {
  const message = createMessage(payment)
  await paymentSender.sendMessage(message)
}

module.exports = sendCalcuation
