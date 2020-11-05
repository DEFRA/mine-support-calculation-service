const config = require('../config')
const processCalculationMessage = require('./process-calculation-message')
const { MessageReceiver, MessageSender } = require('ffc-messaging')
let paymentSender
let calculationReceiver

async function start () {
  paymentSender = new MessageSender(config.paymentQueueConfig)
  await paymentSender.connect()
  const calculationAction = message => processCalculationMessage(message, paymentSender)
  calculationReceiver = new MessageReceiver(config.calculationQueueConfig, calculationAction)
  await calculationReceiver.connect()
  console.info('Ready to receive claims')
}

async function stop () {
  await calculationReceiver.closeConnection()
  await paymentSender.closeConnection()
}

module.exports = { start, stop }
